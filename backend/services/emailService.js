const nodemailer = require('nodemailer');
const { query } = require('../config/database');

// Initialize email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Email templates
const emailTemplates = {
  tournament_joined: (data) => ({
    subject: `You've joined ${data.tournament_name}!`,
    html: `
      <h2>Tournament Registration Confirmed</h2>
      <p>Hi ${data.player_name},</p>
      <p>You've successfully joined <strong>${data.tournament_name}</strong>!</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Tournament Details:</strong></p>
        <p>📅 Date: ${new Date(data.tournament_date).toLocaleDateString()}</p>
        <p>📍 Venue: ${data.venue}</p>
        <p>🎾 Format: ${data.match_type}</p>
        <p>💰 Entry Fee: ₹${data.entry_fee}</p>
      </div>
      <p>Good luck! See you at the tournament.</p>
      <p>Best regards,<br>MATCHIFY Team</p>
    `,
  }),

  match_scheduled: (data) => ({
    subject: `Your match is scheduled - ${data.tournament_name}`,
    html: `
      <h2>Match Scheduled</h2>
      <p>Hi ${data.player_name},</p>
      <p>Your match in <strong>${data.tournament_name}</strong> has been scheduled!</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Match Details:</strong></p>
        <p>🎾 Opponent: ${data.opponent_name}</p>
        <p>📅 Date: ${new Date(data.match_date).toLocaleDateString()}</p>
        <p>⏰ Time: ${data.match_time}</p>
        <p>📍 Venue: ${data.venue}</p>
      </div>
      <p>Good luck with your match!</p>
      <p>Best regards,<br>MATCHIFY Team</p>
    `,
  }),

  tournament_results: (data) => ({
    subject: `${data.tournament_name} Results`,
    html: `
      <h2>Tournament Results</h2>
      <p>Hi ${data.player_name},</p>
      <p>The tournament <strong>${data.tournament_name}</strong> has concluded!</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Your Result:</strong></p>
        <p>🏆 Placement: ${data.placement}</p>
        <p>📊 Matches Won: ${data.matches_won}</p>
        <p>💰 Prize Money: ₹${data.prize_money || 0}</p>
      </div>
      <p>Thank you for participating! Check out upcoming tournaments in your city.</p>
      <p>Best regards,<br>MATCHIFY Team</p>
    `,
  }),

  payment_confirmation: (data) => ({
    subject: `Payment received for ${data.tournament_name}`,
    html: `
      <h2>Payment Confirmation</h2>
      <p>Hi ${data.player_name},</p>
      <p>Your payment for <strong>${data.tournament_name}</strong> has been received!</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Payment Details:</strong></p>
        <p>💰 Amount: ₹${data.amount}</p>
        <p>🔑 Transaction ID: ${data.transaction_id}</p>
        <p>📅 Date: ${new Date(data.payment_date).toLocaleDateString()}</p>
      </div>
      <p>You're all set for the tournament!</p>
      <p>Best regards,<br>MATCHIFY Team</p>
    `,
  }),

  community_invitation: (data) => ({
    subject: `You're invited to join ${data.group_name}`,
    html: `
      <h2>Community Invitation</h2>
      <p>Hi ${data.player_name},</p>
      <p>You've been invited to join <strong>${data.group_name}</strong>!</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Group Details:</strong></p>
        <p>📍 City: ${data.city}</p>
        <p>👥 Members: ${data.member_count}</p>
        <p>📝 Description: ${data.description}</p>
      </div>
      <p>Join the community and connect with other players!</p>
      <p>Best regards,<br>MATCHIFY Team</p>
    `,
  }),
};

// Send email
const sendEmail = async (userId, email, templateName, data) => {
  try {
    // Get template
    const template = emailTemplates[templateName];
    if (!template) {
      throw new Error(`Email template not found: ${templateName}`);
    }

    // Generate email content
    const emailContent = template(data);

    // Log email attempt
    const logResult = await query(
      `INSERT INTO email_logs (user_id, recipient_email, subject, template, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING email_log_id`,
      [userId, email, emailContent.subject, templateName, 'pending']
    );

    const emailLogId = logResult.rows[0].email_log_id;

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@matchify.app',
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    // Update log status
    await query(
      `UPDATE email_logs 
       SET status = $1, sent_at = NOW()
       WHERE email_log_id = $2`,
      ['sent', emailLogId]
    );

    return { success: true, email_log_id: emailLogId };
  } catch (error) {
    console.error('Error sending email:', error);

    // Log error
    try {
      await query(
        `INSERT INTO email_logs (user_id, recipient_email, subject, template, status, error_message)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, email, 'Error', templateName, 'failed', error.message]
      );
    } catch (logError) {
      console.error('Error logging email failure:', logError);
    }

    throw error;
  }
};

// Send notification email
const sendNotificationEmail = async (userId, email, title, message) => {
  try {
    const emailContent = {
      subject: title,
      html: `
        <h2>${title}</h2>
        <p>${message}</p>
        <p>Best regards,<br>MATCHIFY Team</p>
      `,
    };

    // Log email attempt
    const logResult = await query(
      `INSERT INTO email_logs (user_id, recipient_email, subject, template, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING email_log_id`,
      [userId, email, emailContent.subject, 'notification', 'pending']
    );

    const emailLogId = logResult.rows[0].email_log_id;

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@matchify.app',
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    // Update log status
    await query(
      `UPDATE email_logs 
       SET status = $1, sent_at = NOW()
       WHERE email_log_id = $2`,
      ['sent', emailLogId]
    );

    return { success: true, email_log_id: emailLogId };
  } catch (error) {
    console.error('Error sending notification email:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendNotificationEmail,
  emailTemplates,
};
