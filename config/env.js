const { cleanEnv, port, str, url } = require('envalid');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Define schema and validate
const env = cleanEnv(process.env, {
    PORT: port({ default: 5000 }),
    MONGO_URI: url({ desc: 'MongoDB Connection String' }),
    JWT_SECRET: str({ desc: 'Secret for signing JWT tokens' }),
    NODE_ENV: str({ choices: ['development', 'test', 'production', 'staging'], default: 'development' }),
});

module.exports = env;
