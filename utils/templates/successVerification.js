// utils/templates/successVerification.js  
require('dotenv').config();

exports.successVerification = (name) => `  
  <h1>Welcome, ${name}!</h1>  
  <p>Your email has been successfully verified. You can now log in to your account:</p>  
  <a href="${process.env.FRONTEND_DEV_URL}/bt-vaults/user/login">Login Here</a>  
  <p>Thank you for verifying your email. Enjoy our services!</p>  
`;