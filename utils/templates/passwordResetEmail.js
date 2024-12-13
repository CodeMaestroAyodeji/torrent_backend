// utils/templates/passwordResetEmail.js

exports.passwordResetEmail = (name, resetLink) => `
  <h1>Password Reset Request</h1>
  <p>Hello, ${name}!</p>
  <p>We received a request to reset your password. You can reset it by clicking the link below:</p>
  <a href="${resetLink}">Reset Password</a>
  <p>If you did not request a password reset, please ignore this email.</p>
  <p>Thank you!</p>
`;
