import { sendEmailWithResend } from "./sendEmailWithResend.js";

export async function sendToOwner(recipient, formData) {
  console.log(formData,"form data")
  const { service, fullName, phoneNumber, email } = formData;

  const message = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        <h2 style="color: #333;">📩 New Consultation Request</h2>
        <p><strong>Selected Service:</strong> ${service}</p>
        <p><strong>Full Name:</strong> ${fullName}</p>
        <p><strong>Phone Number:</strong> ${phoneNumber}</p>
        <p><strong>Email Address:</strong> ${email}</p>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">If you were not expecting this, you can ignore this email.</p>
      </div>
    </div>
  `;

  await sendEmailWithResend(recipient, "Client Consultation Request", message);
}

export async function sendConfirmationToClient(recipient) {
  const message = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <p style="font-size: 16px; color: #333;">✅ Your response has been received. We’ll get back to you shortly.</p>
    </div>
  `;

  await sendEmailWithResend(
    recipient,
    "Confirmation of Consultation Form Received",
    message
  );
}
