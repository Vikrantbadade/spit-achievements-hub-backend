const { test, expect } = require('@playwright/test');

test.describe('Authentication', () => {
    test('should login successfully with faculty credentials', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[type="email"]', 'faculty@spit.ac.in');
        await page.fill('input[type="password"]', 'password123'); // Ensure this user exists or seed it
        await page.click('button[type="submit"]');

        // Expect to be redirected to faculty dashboard
        await expect(page).toHaveURL(/.*\/faculty/);
        await expect(page.getByText('Faculty Dashboard')).toBeVisible();
    });

    test('should show error with invalid credentials', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[type="email"]', 'faculty@spit.ac.in');
        await page.fill('input[type="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');

        // Expect error message
        // Adjust selector based on actual toast/alert implementation
        await expect(page.getByText('Invalid Credentials')).toBeVisible();
    });
});
