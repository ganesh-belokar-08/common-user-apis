const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, html = null) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER, // Gmail address
                pass: process.env.EMAIL_PASS  // App Password
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html: html || undefined // Use HTML if provided
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent: ${info.response}`);

        return { success: true, message: "Email sent successfully" };

    } catch (error) {
        console.error("❌ Error sending email:", error);
        return { success: false, message: "Failed to send email", error: error.message };
    }
};

module.exports = sendEmail;
