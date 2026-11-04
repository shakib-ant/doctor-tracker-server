// import { Resend } from 'resend'

// export async function sendEmailWithResend(recipients, subject, emailBody) {

//   const resend = new Resend(process.env.RESEND_API_KEY)

//   const { data, error } = await resend.emails.send({
//     from: process.env.RESEND_SENDER,
//     to: recipients,
//     subject,
//     html: emailBody,
//   })

//   if (error) {
//     return console.error({ error })
//   }

// }

import { Resend } from 'resend';


export async function sendEmailWithResend(recipients, subject, emailBody, attachments) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const payload = {
      from: process.env.RESEND_SENDER,
      to: recipients,
      subject,
      html: emailBody,
    };

    // If attachments provided, map them to Resend's expected shape.
    // Resend supports attachments specified either as { path, filename }
    // (for remote URL attachments) or as { filename, data, type } (base64).
    if (Array.isArray(attachments) && attachments.length > 0) {
      payload.attachments = attachments.map((a) => {
        // If caller provided a `path` (URL), pass it through with filename
        if (a.path) {
          return { path: a.path, filename: a.filename || a.name || 'attachment' };
        }

        // Otherwise expect base64 data in `content` or `data`
        return {
          filename: a.filename || a.name || 'attachment',
          data: a.content || a.data || '',
          type: a.type || a.mime || 'application/octet-stream',
        };
      });
    }

    const { data, error } = await resend.emails.send(payload);

    if (error) {
      console.error({ error });
      return;
    }

    return data;
  } catch (err) {
    console.error('Failed to send email:', err);
  }
}
