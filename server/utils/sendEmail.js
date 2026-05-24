const transporter = require("../config/nodemailer");

const sendEmail = async (options) => {
  const mailOptions = {
    from: `${process.env.FROM_NAME || "BhojanQR"} <${process.env.SENDER_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

module.exports = sendEmail;
