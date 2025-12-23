/**
 * Registration Success Email Template
 * Sent when a player successfully registers for a tournament
 */

const branding = require('../../config/branding');

module.exports = {
  subject: `Registration Confirmed - ${branding.appName}`,
  
  html: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9fafb;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .header p {
          margin: 8px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .content {
          padding: 30px 20px;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #1f2937;
        }
        .tournament-details {
          background-color: #f3f4f6;
          border-left: 4px solid #2563eb;
          padding: 20px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          color: #6b7280;
        }
        .detail-value {
          color: #1f2937;
          font-weight: 500;
        }
        .payment-info {
          background-color: #ecfdf5;
          border: 1px solid #d1fae5;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
          font-size: 14px;
        }
        .payment-info strong {
          color: #047857;
        }
        .cta-button {
          display: inline-block;
          background-color: #2563eb;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
          font-weight: 600;
        }
        .cta-button:hover {
          background-color: #1e40af;
        }
        .footer {
          background-color: #f9fafb;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          margin: 5px 0;
        }
        .social-links {
          margin-top: 15px;
        }
        .social-links a {
          color: #2563eb;
          text-decoration: none;
          margin: 0 10px;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>${branding.appName}</h1>
          <p>Your tournament registration is confirmed!</p>
        </div>

        <!-- Content -->
        <div class="content">
          <div class="greeting">Hi ${data.playerName},</div>
          
          <p>Great news! You're all set for <strong>${data.tournamentName}</strong>. We're excited to see you compete!</p>

          <!-- Tournament Details -->
          <div class="tournament-details">
            <div class="detail-row">
              <span class="detail-label">Tournament:</span>
              <span class="detail-value">${data.tournamentName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Category:</span>
              <span class="detail-value">${data.categoryName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${new Date(data.tournamentDate).toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Venue:</span>
              <span class="detail-value">${data.venue}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Entry Fee Paid:</span>
              <span class="detail-value">₹${data.amount}</span>
            </div>
          </div>

          <!-- Payment Info -->
          <div class="payment-info">
            <strong>Payment Confirmed</strong><br>
            Payment ID: ${data.paymentId}<br>
            Amount: ₹${data.amount}
          </div>

          <p>Please arrive 15 minutes before the scheduled time. Bring your racket and stay hydrated!</p>

          <a href="${branding.appUrl}/tournaments/${data.tournamentId}" class="cta-button">
            View Tournament Details
          </a>

          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            If you have any questions, feel free to reach out to us at <strong>${branding.supportEmail}</strong>
          </p>

          <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
            See you at the tournament!<br>
            <strong>Team ${branding.appName}</strong>
          </p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>${branding.copyright}</p>
          <p>${branding.appTagline}</p>
          <div class="social-links">
            <a href="https://twitter.com/${branding.social.twitter.replace('@', '')}">Twitter</a>
            <a href="https://instagram.com/${branding.social.instagram.replace('@', '')}">Instagram</a>
            <a href="https://facebook.com/${branding.social.facebook}">Facebook</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
};
