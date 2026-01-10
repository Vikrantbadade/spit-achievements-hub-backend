const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SPIT Achievements Hub API',
            version: '1.0.0',
            description: 'API documentation for the SPIT Achievements Hub backend service',
        },
        servers: [
            {
                url: 'http://localhost:5000/api/v1',
                description: 'Local server',
            },
        ],
    },
    apis: ['./routes/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs;
