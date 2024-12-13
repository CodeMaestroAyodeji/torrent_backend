const request = require('supertest');
const app = require('../server'); // Adjust this path as necessary
const User = require('../models/User');
const { connectDB, disconnectDB } = require('../config/db'); // Make sure this path is correct

process.env.NODE_ENV = 'test';
process.env.PORT = 5001; // Change to an unused port

// Mock Stripe
jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => {
        return {
            checkout: {
                sessions: {
                    create: jest.fn(),
                },
            },
        };
    });
});

const mockStripe = require('stripe');

describe('Subscription Controller', () => {
    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await disconnectDB();
    });

    describe('POST /checkout', () => {
        let user;

        beforeEach(async () => {
            // Create a mock user
            user = await User.create({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            });
        }, 10000);

        afterEach(async () => {
            // Clean up the user after each test
            await User.deleteMany({});
            jest.clearAllMocks(); // Clear mocks after each test
        });

        it('should create a checkout session for premium plan', async () => {
            // Mock the Stripe session creation response
            mockStripe().checkout.sessions.create.mockResolvedValue({
                url: 'https://checkout.stripe.com/pay/test-session-id',
            });
        
            const response = await request(app)
                .post('/api/subscriptions/checkout') // Ensure this endpoint is correct
                .set('Authorization', `Bearer ${user.generateAuthToken()}`) // This should now work
                .send({ plan: 'premium' });
        
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('url');
            expect(response.body.url).toMatch(/https:\/\/checkout\.stripe\.com\/pay/);
        });
        

        it('should return 400 for invalid plan', async () => {
            const response = await request(app)
                .post('/api/subscriptions/checkout') // Ensure this endpoint is correct
                .set('Authorization', `Bearer ${user.generateAuthToken()}`)
                .send({ plan: 'invalid-plan' });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Invalid subscription plan.');
        });

        it('should return 401 for unauthorized user', async () => {
            const response = await request(app)
                .post('/api/subscriptions/checkout') // Ensure this endpoint is correct
                .send({ plan: 'premium' });

            expect(response.status).toBe(401); // Expecting unauthorized status
        });
    });
});
