const axios = require("axios");

const sendEmail = async (options) => {
  try {
    const payload = {
      sender: {
        name: process.env.FROM_NAME || "BhojanQR",
        email: process.env.SENDER_EMAIL,
      },
      to: [{ email: options.email }],
      subject: options.subject,
      htmlContent: options.html,
      textContent: options.message,
    };

    // Brevo API par Direct HTTP POST Request (Port 443 - Kabhi block nahi hota)
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      payload,
      {
        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
      },
    );

    console.log(
      `✅ Email sent successfully via Brevo API: ${response.data.messageId}`,
    );
    return true;
  } catch (error) {
    // Agar error aata hai toh exact wajah console me dikhayega
    console.error(
      "❌ Error sending email via Brevo API:",
      error.response?.data || error.message,
    );
    return false;
  }
};

module.exports = sendEmail;

// const transporter = require("../config/nodemailer");

// const sendEmail = async (options) => {
//   const mailOptions = {
//     from: `${process.env.FROM_NAME || "BhojanQR"} <${process.env.SENDER_EMAIL}>`,
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     html: options.html,
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log(`Email sent successfully: ${info.messageId}`);
//     return true;
//   } catch (error) {
//     console.error("Error sending email:", error);
//     return false;
//   }
// };

// module.exports = sendEmail;
