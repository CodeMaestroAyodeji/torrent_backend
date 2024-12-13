// utils/templates/successPasswordReset.js  

exports.successPasswordReset = (name) => `  
  <h1>Password Reset Successful</h1>  
  <p>Hello, ${name}!</p>  
  <p>Your password has been successfully reset. You can now log in to your account:</p>  
  <a href="${process.env.FRONTEND_DEV_URL}/bt-vaults/user/login">Login Here</a>  
  <p>If you did not request this change, please contact support immediately.</p>  
  <p>Thank you for using our services!</p>  
`;  
