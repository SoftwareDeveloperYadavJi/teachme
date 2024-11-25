const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD,
    
  },
});


async function sendMail(sender, receiver, subject, textBody, htmlBody) {
  try {
    const info = await transporter.sendMail({
      from: '"nitiny1524@gmail.com" <nitiny1524@gmail.com>', // sender address
      to: receiver, // receiver's address
      subject: subject, // subject line
      text: textBody, // plain text body
      html: htmlBody, // HTML body
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
}


module.exports = {
  mail:sendMail
}