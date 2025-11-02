const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {defineString} = require("firebase-functions/params");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const logger = require("firebase-functions/logger");

admin.initializeApp();

// Define parameters for environment variables
const GMAIL_EMAIL = defineString("GMAIL_EMAIL");
const GMAIL_PASSWORD = defineString("GMAIL_PASSWORD");
const ADMIN_EMAIL = defineString("ADMIN_EMAIL");

exports.sendOrderNotificationEmail = onDocumentCreated("orders/{orderId}", async (event) => {
  const orderData = event.data.data();
  const orderId = event.params.orderId;

  // Access the defined parameters
  const gmailEmail = GMAIL_EMAIL.value();
  const gmailPassword = GMAIL_PASSWORD.value();
  const adminEmail = ADMIN_EMAIL.value();

  if (!gmailEmail || !gmailPassword || !adminEmail) {
    logger.error("Required environment variables are not set.");
    return;
  }

  const mailTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailEmail,
      pass: gmailPassword,
    },
  });

  const mailOptions = {
    from: `Dabba App <${gmailEmail}>`,
    to: adminEmail,
    subject: `New Order Received! - #${orderId.substring(0, 6)}`,
    html: `
      <h1>A new order has been placed!</h1>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Customer Name:</strong> ${orderData.user.name}</p>
      <p><strong>Total Amount:</strong> ₹${orderData.total.toFixed(2)}</p>
      <h2>Order Items:</h2>
      <ul>
        ${orderData.items
    .map((item) => `<li>${item.name} (x${item.quantity})</li>`)
    .join("")}
      </ul>
      <h2>Delivery Address:</h2>
      <p>${orderData.deliveryAddress.street}, ${orderData.deliveryAddress.city}</p>
      <p>Please check the admin dashboard for full details.</p>
    `,
  };

  try {
    await mailTransport.sendMail(mailOptions);
    logger.log(`New order notification email sent to ${adminEmail}`);
  } catch (error) {
    logger.error("There was an error while sending the email:", error);
  }
});
