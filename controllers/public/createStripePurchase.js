import Book, { Point } from "#models/bookModel.js";
import Purchase from "#models/purchaseModel.js";
import { sendEmailWithResend } from "#utils/sendEmailWithResend.js";
import Stripe from "stripe";
import { OWNER_MAIL } from "./../../constants.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const BOOK_LINK = process.env.BOOK_LINK;
const AMOUNT_CENTS = 10000; // default $100

export async function createCheckoutSession(req, res) {
  try {
    console.log('hit')
    // derive product data from frontend body
    const productTitle = req.body.productTitle || "E-Book: Attain Focus";
    const productPriceRaw = req.body.productPrice;
    const productPriceNumber = typeof productPriceRaw !== 'undefined' && productPriceRaw !== null ? Number(productPriceRaw) : undefined;
    console.log(productPriceRaw,"productPriceRaw");
    
    const productImage = req.body.productImage;
    const pdf = req.body.pdf;

    // normalize price: expect dollars (e.g. 10.5) from frontend
    const amountCents = typeof productPriceNumber !== 'undefined' && !Number.isNaN(productPriceNumber)
      ? Math.round(productPriceNumber * 100)
      : AMOUNT_CENTS;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: productTitle, images: productImage ? [productImage] : [] },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/success/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/failed`,
      // optionally collect email
      customer_email: req.body.email,
      metadata: {
        fullName: req.body.fullName || "",
        phoneNumber: req.body.phoneNumber || "",
        address: req.body.address || "",
        postalCode: req.body.postalCode || "",
        city: req.body.city || "",
        country: req.body.country || "",
        productTitle: productTitle,
        // store productPrice in metadata as dollars
        productPrice: typeof productPriceNumber !== 'undefined' && !Number.isNaN(productPriceNumber) ? productPriceNumber : (AMOUNT_CENTS / 100),
        productImage: productImage || "",
        pdf: pdf || "",
      },
    });
    // persist a pending purchase record with provided customer info
    try {
const objectData = {
        customerName: req.body.fullName || "",
        customerEmail: req.body.email || "",
        phoneNumber: req.body.phoneNumber || "",
        address: {
          address: req.body.address || "",
          postalCode: req.body.postalCode || "",
          city: req.body.city || "",
          country: req.body.country || "",
        },
        stripeSessionId: session.id,
  // store amount in DB as dollars (number)
  amount: typeof productPriceNumber !== 'undefined' && !Number.isNaN(productPriceNumber) ? productPriceNumber : (AMOUNT_CENTS / 100),
        currency: "usd",
        paymentStatus: "pending",
        bookLink: pdf || BOOK_LINK,
        // prefer pdf provided by frontend, else use default BOOK_LINK
        // bookLink: pdf || BOOK_LINK,
        // productTitle: productTitle,
        // productImage: productImage || "",
        metadata: session.metadata || {},
      }
      console.log(objectData, 'objectData');
      
      const purchase = await Purchase.create(objectData);
      console.log(purchase, 'sfsdf');
      
    } catch (err) {
      console.error("Failed to save pending purchase:", err);
    }

    return res
      .status(200)
      .json({
        url: session.url,
        id: session.id,
        client_secret: session.payment_intent,
      });
  } catch (err) {
    console.error("createCheckoutSession error", err);
    return res.status(500).json({ message: "Failed to create Stripe session" });
  }
}

// webhook removed: using server-side `verifyPurchase` instead

export async function verifyPurchase(req, res) {
  const sessionId = req.query.session_id || req.body?.session_id;
  if (!sessionId)
    return res.status(400).json({ message: "session_id is required" });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "customer_details"],
    });

    const paid =
      session.payment_status === "paid" ||
      session.payment_intent?.status === "succeeded";

    const update = {
      customerEmail:
        session.customer_email || session.customer_details?.email || "",
      // convert Stripe cents back to dollars for DB
      amount: typeof session.amount_total !== 'undefined' && session.amount_total !== null ? (session.amount_total / 100) : (AMOUNT_CENTS / 100),
      currency: session.currency || "usd",
      paymentStatus: paid ? "paid" : session.payment_status || "unpaid",
      // preserve any bookLink stored on the Purchase document (will be set during creation)
      metadata: session.metadata || {},
    };

    const purchase = await Purchase.findOneAndUpdate(
      { stripeSessionId: session.id },
      { $set: update },
      { upsert: true, new: true },
    );

    // send email if paid and not sent yet
    if (paid && !purchase.emailSent) {
      const recipient = purchase.customerEmail;
      if (recipient) {
        // prefer purchase.bookLink (stored during creation) otherwise fallback to default BOOK_LINK or metadata.pdf
        const downloadLink = purchase.bookLink || BOOK_LINK || (purchase.metadata && purchase.metadata.pdf) || "";

        // attempt to load book details (best-effort)
        let bookDetails = null;
        const bookId = purchase?.bookId || purchase?.metadata?.bookId || purchase?.metadata?.productId || purchase?.metadata?.bookId;
        try {
          if (bookId) {
            bookDetails = await Book.findById(bookId).lean();
          } else if (purchase?.metadata?.productTitle) {
            bookDetails = await Book.findOne({ name: purchase.metadata.productTitle }).lean();
          }
        } catch (bookErr) {
          console.warn('Book lookup failed:', bookErr.message);
        }

        const prodTitle = (bookDetails && (bookDetails.name || bookDetails.title)) || purchase?.metadata?.productTitle || purchase.productTitle || "Your Book";
        const prodImage = (bookDetails && (bookDetails.bookCover || bookDetails.image)) || purchase?.metadata?.productImage || purchase.productImage || "";
        const prodSubtitle = bookDetails?.subtitle || "";

        const userMessage = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Thanks for your purchase</title>
          </head>
          <body style="margin:0;padding:0;background-color:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="padding:32px 16px;">
                  <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.06);">
                    <tr>
                      <td style="padding:28px;text-align:center;">
                        <h1 style="margin:0;font-size:22px;color:#111;font-weight:700;">Thank you for your purchase</h1>
                        <p style="margin:10px 0 0 0;color:#666;font-size:14px;">Here's your download and order details.</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:12px 28px 10px 28px;">
                        <h2 style="margin:0 0 6px 0;font-size:18px;color:#111;">${prodTitle}</h2>
                        ${prodSubtitle ? `<p style="margin:0 0 8px 0;color:#666;font-size:13px;">${prodSubtitle}</p>` : ''}
                        <p style="margin:8px 0 0 0;color:#333;font-size:14px;">Amount: <strong>${purchase.amount} ${purchase.currency || 'USD'}</strong></p>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding:10px 28px 18px 28px;">
                        ${prodImage ? `<img src="${process.env.SPACES_URL+prodImage}" alt="${prodTitle}" style="max-width:220px;height:auto;border-radius:8px;display:block;margin:0 auto;"/>` : ''}
                      </td>
                    </tr>
                  
                    <tr>
                      <td style="padding:0 28px 28px 28px;color:#777;font-size:12px;text-align:center;">If you have any issues downloading, reply to this email or contact support.</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `;

        // Attach the PDF by URL when possible so Resend can fetch it.
        const attachments = [];
        const isUrl = (u) => typeof u === 'string' && (u.startsWith('http://') || u.startsWith('https://'));
        try {
          if (isUrl(downloadLink)) {
            // Use product title for filename fallback
            const filename = `${prodTitle.replace(/\s+/g, '_')}.pdf`;
            attachments.push({ path: downloadLink, filename });
          }
        } catch (err) {
          console.warn('Attachment handling failed:', err.message || err);
        }

        if (attachments.length > 0) {
          await sendEmailWithResend(recipient, `Your Purchase: ${prodTitle}`, userMessage, attachments);
        } else {
          await sendEmailWithResend(recipient, `Your Purchase: ${prodTitle}`, userMessage);
        }

        // Notify owner about the successful purchase
        try {
          const ownerEmail = OWNER_MAIL;
          const ownerProdTitle = prodTitle || 'E-Book';
          const ownerProdImage = process.env.SPACES_URL+prodImage || '';
          // const ownerBookInfo = bookDetails ? `Book ID: ${bookDetails._id} — ${bookDetails.name || ''}` : '';
          const ownerMessage = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>New Purchase</title>
            </head>
            <body style="margin:0;padding:0;background-color:#f6f9fc;font-family:Arial,Helvetica,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding:20px 0;">
                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
                      <tr>
                        <td style="padding:18px;">
                          <h2 style="margin:0 0 8px 0;color:#111;font-size:18px;">New Purchase Received</h2>
                          <p style="margin:0 0 12px 0;color:#444;font-size:14px;">A purchase was completed. Details:</p>
                          <table style="width:100%;font-size:14px;color:#333;">
                            <tr><td style="padding:6px 0;font-weight:600;width:140px;">Customer</td><td>${purchase.customerName || '—'}</td></tr>
                            <tr><td style="padding:6px 0;font-weight:600;">Email</td><td>${purchase.customerEmail || '—'}</td></tr>
                            <tr><td style="padding:6px 0;font-weight:600;">Phone</td><td>${purchase.phoneNumber || '—'}</td></tr>
                            <tr><td style="padding:6px 0;font-weight:600;">Amount</td><td>${purchase.amount} ${purchase.currency || 'USD'}</td></tr>
                            <tr><td style="padding:6px 0;font-weight:600;">Book</td><td>${ownerProdTitle}</td></tr>
                          </table>
                          ${ownerProdImage ? `<div style="margin-top:12px;text-align:center;"><img src="${ownerProdImage}" alt="product" style="max-width:180px;border-radius:8px;"/></div>` : ''}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `;

          if (ownerEmail) await sendEmailWithResend(ownerEmail, "New Purchase Received", ownerMessage);
        } catch (ownerErr) {
          console.error('Failed to notify owner:', ownerErr);
        }

        purchase.emailSent = true;
        await purchase.save();
      }
    }

    return res.json({ success: true, purchase });
  } catch (err) {
    console.error("verifyPurchase error", err);
    return res.status(500).json({ message: "Failed to verify purchase" });
  }
}

export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find({
      isActive: true,
    });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getPoints = async (req, res) => {
  try {
    const points = await Point.find({isActive:true});
    res.status(200).json(points);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}