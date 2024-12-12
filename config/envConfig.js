// config/envConfig.js

const frontendUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://your-frontend-domain.com'
    : 'http://localhost:3000';

module.exports = frontendUrl;

