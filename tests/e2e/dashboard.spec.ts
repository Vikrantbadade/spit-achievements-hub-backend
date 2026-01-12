import { test, expect } from '@playwright/test';

test.describe('Faculty Dashboard Customization', () => {

    test.beforeEach(async ({ page }) => {
        // Mock Login API
        await page.route('*/**/api/v1/auth/signin', async route => {
            const json = {
                success: true,
                data: {
                    token: "fake-jwt-token",
                    role: "Faculty",
                    user: {
                        id: "1",
                        name: "Test Faculty",
                        role: "Faculty",
                        department: { name: "Computer Engineering" }
                    }
                }
            };
            await route.fulfill({ json });
        });

        // Mock Achievements API
        await page.route('*/**/api/v1/faculty/achievements', async route => {
            const json = {
                success: true,
                data: [
                    { _id: '1', title: 'Paper A', category: 'Publication', achievementDate: new Date().toISOString() },
                    { _id: '2', title: 'Patent B', category: 'Patent', achievementDate: new Date().toISOString() },
                    { _id: '3', title: 'Award C', category: 'Award', achievementDate: new Date().toISOString() },
                    { _id: '4', title: 'FDP D', category: 'FDP', achievementDate: new Date().toISOString() },
                    { _id: '5', title: 'Project E', category: 'Project', achievementDate: new Date().toISOString() },
                ]
            };
            await route.fulfill({ json });
        });

        await page.goto('/login');

        await page.getByText('Choose your role').click();
        await page.getByRole('option', { name: 'Faculty' }).click();

        await page.getByText('Select department').click();
        await page.getByRole('option', { name: 'Computer Engineering' }).click();

        await page.fill('input[type="email"]', 'faculty@spit.ac.in');
        await page.fill('input[type="password"]', 'anypass');
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL(/.*\/faculty/);
    });

    test('should show default widgets on load', async ({ page }) => {
        // Use test IDs for robust selection
        await expect(page.getByTestId('widget-publication')).toBeVisible();
        await expect(page.getByTestId('widget-patent')).toBeVisible();
        await expect(page.getByTestId('widget-award')).toBeVisible();
        await expect(page.getByTestId('widget-fdp')).toBeVisible();

        await expect(page.getByTestId('widget-project')).not.toBeVisible();
    });

    test('should add a widget', async ({ page }) => {
        await page.click('button:has-text("Customize Dashboard")');
        await page.getByRole('menuitemcheckbox', { name: "Projects" }).click();

        // Radix menu might stay open or close. Pressing escape ensures dashboard is clear.
        await page.keyboard.press('Escape');

        await expect(page.getByTestId('widget-project')).toBeVisible();
    });

    test('should remove a widget', async ({ page }) => {
        await page.click('button:has-text("Customize Dashboard")');
        await page.getByRole('menuitemcheckbox', { name: "Awards" }).click();

        await page.keyboard.press('Escape');

        await expect(page.getByTestId('widget-award')).not.toBeVisible();
    });

    test('should persist preferences after reload', async ({ page }) => {
        await page.click('button:has-text("Customize Dashboard")');
        const projectsItem = page.getByRole('menuitemcheckbox', { name: "Projects" });

        if (!await projectsItem.isChecked()) {
            await projectsItem.click();
        }
        await page.keyboard.press('Escape');
        await expect(page.getByTestId('widget-project')).toBeVisible();

        await page.reload();

        await expect(page.getByTestId('widget-project')).toBeVisible();
    });
});
