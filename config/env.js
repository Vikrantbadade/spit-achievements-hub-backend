const { cleanEnv, port, str, url } = require('envalid');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Define schema and validate
const env = cleanEnv(process.env, {
    PORT: port({ default: 5000 }),
    MONGO_URI: url({ desc: 'MongoDB Connection String' }),
    JWT_SECRET: str({ desc: 'Secret for signing JWT tokens' }),
    EMAIL_USER: str({ default: '', desc: 'Email address for notifications' }),
    EMAIL_PASS: str({ default: '', desc: 'Email password/app-password' }),
    NODE_ENV: str({ choices: ['development', 'test', 'production', 'staging'], default: 'development' }),
});

module.exports = env;
