import { sendEmailWithResend } from "../sendEmailWithResend.js"


export async function sendEmployeeInvitationEmail(
    recepients, subject,
    mainLineOne, mainLineTwo, textLine,
    link, buttonText
) {
    
    const message = `<!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Anthill</title>
        </head>
        
        <body style="width: 100%; height: 100%; background: #f2f2f2; margin: 0; overflow-x: hidden; font-size: 16px;">
            <div
                style="min-width: 300px; max-width: 500px; margin-top: 20px; margin-bottom: 20px; margin-left: auto; margin-right: auto; background: #00000a; border:0;">
                <div style="width: 100%; height: 10px; background-color:#262626;"></div>
                <div style="width: 100%; height: 68px;"></div>
                <div style="width: 135px; margin: 0 auto;">
                    <img src="https://i.ibb.co.com/V03nc8cq/ant-logo.png" alt="logo"
                        style="width: 135px; height: 100px">
                </div>
                <div style="width: 100%; height: 46px;"></div>
                <div style="width: 100%;">
                    <h1
                        style="font-family:Arial, Helvetica, sans-serif; font-size: 17px; line-height: 22px; color: #fff; margin: 0; text-align: center;">
                        ${mainLineOne}
                    </h1>
                    <h1
                        style="font-family:Arial, Helvetica, sans-serif; font-size: 17px; line-height: 22px; color: #fff; margin: 0; text-align: center;">
                        ${mainLineTwo}
                    </h1>
                </div>
                <div style="width: 100%; height: 25px;"></div>
                <div style="width: 82%; margin-left: auto; margin-right: auto;">
                    <h3
                        style="width: 100%; font-family:Arial, Helvetica, sans-serif; font-weight: 500; font-size: 15px; line-height: 24px; color: #E6E6E6; margin: 0; text-align: center;">
                        ${textLine}
                    </h3>
                </div>
                <div style="width: 100%; height: 60px;"></div>
                <div style="width: 138px; height: 48px; background-color: #ece9e3; border-radius: 12px; margin: 0 auto;">
                    <a href="${link}"
                        style="display: block; font-family: Arial, Helvetica, sans-serif; font-weight: 500; font-size: 16px; line-height: 20px; color:rgb(3, 3, 2); width: 100%; text-align: center; padding-top: 14px; text-decoration: none;">
                        ${buttonText}
                    </a>
                </div>
                <div style="width: 100%; height: 80px;"></div>
            </div>
        </body>
        
    </html>`
    
    await sendEmailWithResend(recepients, subject, message)
}

export async function sendFormRequestEmail(
    recepients, subject,
    mainLineOne, formInfo, textLine
) {
    
    
    const message = `<!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Anthill</title>
        </head>
        
        <body style="width: 100%; height: 100%; background: #f2f2f2; margin: 0; overflow-x: hidden; font-size: 16px;">
            <div
                style="min-width: 300px; max-width: 500px; margin-top: 20px; margin-bottom: 20px; margin-left: auto; margin-right: auto; background: #333333; border:0;">
                <div style="width: 100%; height: 10px; background-color:#F8BC32;"></div>
                <div style="width: 100%; height: 68px;"></div>
                <div style="width: 100%;">
                    <h3
                        style="width: 100%; font-family:Arial, Helvetica, sans-serif; font-weight: 500; font-size: 15px; line-height: 24px; color: #E6E6E6; margin: 0; text-align: center;">
                        ${mainLineOne}
                    </h3>
                    <br />
                    <h3
                        style="width: 100%; font-family:Arial, Helvetica, sans-serif; font-weight: 500; font-size: 15px; line-height: 24px; color: #E6E6E6; text-decoration: none;  margin: 0; text-align: center;">
                        ${formInfo}
                    </h3>
                </div>
                <div style="width: 100%; height: 25px;"></div>
                <div style="width: 82%; margin-left: auto; margin-right: auto;">
                    <h3
                        style="width: 100%; font-family:Arial, Helvetica, sans-serif; font-weight: 500; font-size: 15px; line-height: 24px; color: #E6E6E6; margin: 0; text-align: center;">
                        ${textLine}
                    </h3>
                </div>
                <div style="width: 100%; height: 60px;"></div>
               
            </div>
        </body>
        
    </html>`

    await sendEmailWithResend(recepients, subject, message)
}