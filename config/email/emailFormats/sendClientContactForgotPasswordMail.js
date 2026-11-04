import { sendEmailWithResend } from "../sendEmailWithResend.js"

export async function sendForgotPasswordMail(recipient, link) {

    const message = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #9EDCFF; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table width="400" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <tr>
                        <td align="center" style="padding: 40px 40px 20px 40px;">
                            <img src="https://e-commerce-test.sgp1.digitaloceanspaces.com/attain%20focus/1769507368770-attainfocus.png" alt="Attain Focus" width="200" style="display: block;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 40px; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px; color: #333333;">Forgot Password?</h1>
                            <p style="margin: 16px 0 0 0; font-size: 16px; color: #666666; line-height: 1.5;">
                                No worries! It happens to the best of us. Click the button below to reset your password.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 30px 40px 40px 40px;">
                            <a href="${link}" style="background-color: #000000; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
                                Reset Password
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 40px 40px; text-align: center;">
                            <p style="margin: 0; font-size: 14px; color: #999999;">
                                If you didn't request a password reset, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`

    await sendEmailWithResend(recipient, 'Reset Forgotten Password', message)
}

