// utils/templates/registrationEmail.js

exports.registrationEmail = (name, verificationLink) => `
  <h1>Welcome, ${name}!</h1>
  <p>Thank you for registering on our platform. Please verify your email by clicking the link below:</p>
  <a href="${verificationLink}">Verify Email</a>
  <p>If you did not register, please ignore this email.</p>
`;
