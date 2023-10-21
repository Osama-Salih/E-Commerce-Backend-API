// nodemialer
const nodemialer = require('nodemailer');

const sendEmail = async (options) => {
  // create transporter
  const transporter = nodemialer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, // if secure true port = 465 if false port= 587
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //  Define email options (like from, to, subject, email contents)
  const emailOptions = {
    from: `E-shop <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  //  Send email
  await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;
