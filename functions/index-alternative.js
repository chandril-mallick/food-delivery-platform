const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {defineString} = require("firebase-functions/params");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const logger = require("firebase-functions/logger");

admin.initializeApp();

// Define parameters for environment variables
const ADMIN_EMAIL = defineString("ADMIN_EMAIL");

// Create a test account using Ethereal Email (for testing purposes)
async function createTestAccount() {
  const testAccount = await nodemailer.createTestAccount();
  return {
    user: testAccount.user,
    pass: testAccount.pass,
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false
  };
}

exports.sendOrderNotificationEmail = onDocumentCreated("orders/{orderId}", async (event) => {
  const orderData = event.data.data();
  const orderId = event.params.orderId;

  const adminEmail = ADMIN_EMAIL.value();

  if (!adminEmail) {
    logger.error("Admin email not configured.");
    return;
  }

  try {
    // Create test account for demonstration
    const emailConfig = await createTestAccount();
    
    const mailTransport = nodemailer.createTransporter({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.pass,
      },
    });

    const mailOptions = {
      from: `"Dabba App" <${emailConfig.user}>`,
      to: adminEmail,
      subject: `🍽️ New Order Received! - #${orderId.substring(0, 6)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🍽️ New Order Alert!</h1>
          </div>
          
          <div style="padding: 20px; background: #f9fafb;">
            <h2 style="color: #f97316; margin-top: 0;">Order Details</h2>
            <p><strong>📋 Order ID:</strong> ${orderId}</p>
            <p><strong>👤 Customer:</strong> ${orderData.user?.name || 'N/A'}</p>
            <p><strong>💰 Total Amount:</strong> <span style="color: #16a34a; font-size: 18px; font-weight: bold;">₹${orderData.pricing?.total || orderData.total || 0}</span></p>
            <p><strong>📞 Contact:</strong> ${orderData.contactNumber || 'N/A'}</p>
            
            <h3 style="color: #f97316;">🛒 Order Items:</h3>
            <ul style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #f97316;">
              ${orderData.items?.map(item => 
                `<li style="margin: 5px 0;"><strong>${item.name}</strong> (Qty: ${item.qty || item.quantity}) - ₹${item.price}</li>`
              ).join('') || '<li>No items found</li>'}
            </ul>
            
            <h3 style="color: #f97316;">📍 Delivery Address:</h3>
            <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #16a34a;">
              <p style="margin: 5px 0;"><strong>Street:</strong> ${orderData.deliveryAddress?.street || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>City:</strong> ${orderData.deliveryAddress?.city || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Pincode:</strong> ${orderData.deliveryAddress?.pincode || 'N/A'}</p>
              ${orderData.deliveryAddress?.landmark ? `<p style="margin: 5px 0;"><strong>Landmark:</strong> ${orderData.deliveryAddress.landmark}</p>` : ''}
            </div>
            
            ${orderData.specialInstructions ? `
            <h3 style="color: #f97316;">📝 Special Instructions:</h3>
            <div style="background: #fef3c7; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0;">${orderData.specialInstructions}</p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #6b7280;">Please check your admin dashboard for full order management.</p>
              <div style="background: #f97316; color: white; padding: 10px; border-radius: 5px; display: inline-block; margin-top: 10px;">
                <strong>⏰ Estimated Delivery: 30 minutes</strong>
              </div>
            </div>
          </div>
          
          <div style="background: #374151; color: white; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">🍛 Dabba App - Ghar Jaisa Khana</p>
          </div>
        </div>
      `,
    };

    const info = await mailTransport.sendMail(mailOptions);
    
    // Log the preview URL for Ethereal Email
    logger.log(`Email sent successfully!`);
    logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    logger.log(`New order notification sent for order: ${orderId}`);
    
  } catch (error) {
    logger.error("Error sending email notification:", error);
  }
});
