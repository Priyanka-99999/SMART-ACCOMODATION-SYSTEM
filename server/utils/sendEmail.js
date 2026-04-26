const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const message = {
      from: `"${process.env.FROM_NAME || 'StaySmart Support'}" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    const info = await transporter.sendMail(message);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Nodemailer Error Details:', error);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;
