const request = require('supertest');
const app = require('../../server'); // Assuming your express app is exported from server.js
const User = require('../../models/User');
// We need to ensure we don't start the server twice if server.js auto-starts
// Ideally refactor server.js to export 'app' without listening if imported
// For now, let's assume we can mock or handle it. 
// Actually, if server.js calls app.listen(), require() will start it.
// We should check server.js content first.

const setup = require('./setup'); // Ensure DB connection runs

const Department = require('../../models/Department');

describe('Auth Endpoints', () => {
    let tempUser;

    beforeEach(async () => {
        const dept = await Department.create({
            name: 'Computer Engineering',
            code: 'COMP'
        });

        tempUser = await User.create({
            name: 'Test Fac',
            email: 'test@spit.ac.in',
            password: 'password123',
            role: 'Faculty',
            department: dept._id
        });
    });

    it('should login successfully with valid credentials', async () => {
        const res = await request(app)
            .post('/api/v1/auth/signin')
            .send({
                email: 'test@spit.ac.in',
                password: 'password123'
            });

        console.log('Login Response:', JSON.stringify(res.body, null, 2));

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should fail with invalid password', async () => {
        const res = await request(app)
            .post('/api/v1/auth/signin')
            .send({
                email: 'test@spit.ac.in',
                password: 'wrongpassword'
            });

        expect(res.statusCode).toEqual(401);
    });
});
