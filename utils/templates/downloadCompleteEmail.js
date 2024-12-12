// utils/templates/downloadCompleteEmail.js

exports.downloadCompleteEmail = (name, fileName) => `
  <h1>Hello, ${name}!</h1>
  <p>Your file <strong>${fileName}</strong> has been successfully downloaded and cached.</p>
  <p>Log in to your account to download it:</p>
  <a href="${process.env.FRONTEND_DEV_URL}/bt-vaults/user/login">Login Here</a>
`;
