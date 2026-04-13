const nodemailer = require('nodemailer');

/**
 * Sends a premium, structured congratulations email to a student when a credential is issued.
 */
const sendCredentialNotification = async (studentEmail, studentName, credentialDetails) => {
    try {
        // Using explicit host/port for better reliability with Gmail App Passwords
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // Use SSL
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        const dashboardUrl = `${process.env.FRONTEND_URL}/student/dashboard`;

        const mailOptions = {
            from: `"TrustMate AI" <${process.env.SMTP_EMAIL}>`,
            to: studentEmail,
            subject: '🎓 Congratulations! Your Official Credential has been Issued',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 40px; background-color: #0f0f14; color: #e8e4df; border-radius: 24px; border: 1px solid rgba(212, 160, 83, 0.15); box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <span style="background: linear-gradient(135deg, #d4a053 0%, #b8862e 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px; font-weight: 900; letter-spacing: -1px; font-family: sans-serif;">TRUSTMATE AI</span>
                    </div>
                    
                    <h1 style="color: #d4a053; text-align: center; font-size: 28px; font-weight: 900; margin-bottom: 20px;">Congratulations, ${studentName}! 🎓</h1>
                    
                    <p style="font-size: 18px; line-height: 1.6; text-align: center; color: #a8a29e;">
                        An extraordinary milestone has been achieved! We are thrilled to announce that your new professional credential has been successfully verified and etched onto the <strong>Polygon Blockchain</strong>.
                    </p>

                    <div style="background: rgba(212, 160, 83, 0.05); padding: 25px; border-radius: 16px; margin: 30px 0; border: 1px dashed rgba(212, 160, 83, 0.3);">
                        <p style="margin: 8px 0; color: #e8e4df; font-size: 16px;"><strong>Award:</strong> ${credentialDetails.degree}</p>
                        <p style="margin: 8px 0; color: #e8e4df; font-size: 16px;"><strong>Issuer:</strong> ${credentialDetails.institution}</p>
                        <p style="margin: 8px 0; font-family: monospace; font-size: 12px; color: #57534e;">Ref ID: ${credentialDetails.credentialId}</p>
                    </div>

                    <p style="font-size: 16px; line-height: 1.6; color: #a8a29e;">
                        Your dedication and hard work have truly paid off. This cryptographic record serves as a permanent, tamper-proof testament to your exceptional skills and expertise. 
                        <strong>We wish you the very best of luck in all your future professional endeavors! We truly appreciate the skills you have demonstrated.</strong>
                    </p>

                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${dashboardUrl}" style="background: linear-gradient(135deg, #d4a053 0%, #b8862e 100%); color: #0f0f14; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 16px; box-shadow: 0 4px 15px rgba(212, 160, 83, 0.3); display: inline-block;">ACCESS YOUR VAULT</a>
                    </div>

                    <p style="text-align: center; font-size: 13px; color: #57534e; margin-top: 40px; border-top: 1px solid #2a2a34; padding-top: 20px;">
                        Authenticated by the Blockchain Credential Verification System.<br>
                        &copy; ${new Date().getFullYear()} TrustMate AI. All rights reserved.
                    </p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Premium Email sent successfully: ' + info.response);
        return true;
    } catch (error) {
        console.error('Email Send Failure:', error);
        throw new Error('Failed to deliver notification email. Please ensure your SMTP credentials in .env are correct and have no spaces.');
    }
};

module.exports = { sendCredentialNotification };
