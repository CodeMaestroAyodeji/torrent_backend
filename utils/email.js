// utils/email.js  

const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure the email transport  
const transporter = nodemailer.createTransport({  
  service: 'gmail',  // You can also use SMTP_HOST and SMTP_PORT if needed  
  auth: {  
    user: process.env.SMTP_USER,  
    pass: process.env.SMTP_PASS,  
  },  
});  

// Send an email  
exports.sendEmail = async (to, subject, htmlContent) => {  
  try {  
    await transporter.sendMail({  
      from: `"Bt-Vaults Support" <${process.env.SMTP_USER}>`,  
      to,  
      subject,  
      html: htmlContent, // Use the provided HTML content directly  
    });  
    console.log(`Email sent to ${to}`);  
  } catch (error) {  
    console.error('Error sending email:', error); // Log the error for debugging  
    throw error; // Optionally rethrow to handle it in the calling function  
  }  
};