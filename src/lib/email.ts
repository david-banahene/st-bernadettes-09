import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "St. Bernadette's '09 <noreply@stbernadettes09.org>";
const FROM_EMAIL_DEV = "St. Bernadette's '09 <onboarding@resend.dev>";

function getFrom() {
  return process.env.RESEND_FROM_EMAIL || FROM_EMAIL_DEV;
}

export async function sendMemberApprovedEmail(to: string, memberName: string) {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: getFrom(),
    to,
    subject: "Welcome to St. Bernadette's '09 Association!",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: #1B4332; padding: 24px; text-align: center;">
          <h1 style="color: #C8962E; font-size: 20px; margin: 0;">St. Bernadette's '09</h1>
          <p style="color: #FAF6F0; font-size: 12px; margin: 4px 0 0;">One Year Group, One Family</p>
        </div>
        <div style="padding: 24px; background: #FAF6F0;">
          <h2 style="color: #1B4332; font-size: 18px;">Welcome, ${memberName}!</h2>
          <p style="color: #333; font-size: 14px; line-height: 1.6;">
            Your membership has been approved. You now have full access to the association dashboard,
            events, announcements, and all member features.
          </p>
          <p style="color: #333; font-size: 14px; line-height: 1.6;">
            Log in to your dashboard to get started.
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 24px;">
            Unity | Support | Progress
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendNewEventEmail(
  to: string,
  memberName: string,
  eventTitle: string,
  eventDate: string,
  location: string
) {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: getFrom(),
    to,
    subject: `New Event: ${eventTitle}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: #1B4332; padding: 24px; text-align: center;">
          <h1 style="color: #C8962E; font-size: 20px; margin: 0;">St. Bernadette's '09</h1>
        </div>
        <div style="padding: 24px; background: #FAF6F0;">
          <h2 style="color: #1B4332; font-size: 18px;">New Event Announced</h2>
          <p style="color: #333; font-size: 14px;">Hi ${memberName},</p>
          <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <h3 style="color: #1B4332; margin: 0 0 8px;">${eventTitle}</h3>
            <p style="color: #666; font-size: 13px; margin: 4px 0;">Date: ${eventDate}</p>
            <p style="color: #666; font-size: 13px; margin: 4px 0;">Location: ${location}</p>
          </div>
          <p style="color: #333; font-size: 14px;">
            Log in to your dashboard for full details and to confirm attendance.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendQuestionAnsweredEmail(
  to: string,
  memberName: string,
  questionSubject: string,
  response: string,
  respondedBy: string
) {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: getFrom(),
    to,
    subject: `Your question has been answered: ${questionSubject}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: #1B4332; padding: 24px; text-align: center;">
          <h1 style="color: #C8962E; font-size: 20px; margin: 0;">St. Bernadette's '09</h1>
        </div>
        <div style="padding: 24px; background: #FAF6F0;">
          <h2 style="color: #1B4332; font-size: 18px;">Question Answered</h2>
          <p style="color: #333; font-size: 14px;">Hi ${memberName},</p>
          <p style="color: #333; font-size: 14px;">
            Your question "<strong>${questionSubject}</strong>" has been answered by ${respondedBy}.
          </p>
          <div style="background: white; border-left: 3px solid #C8962E; padding: 12px 16px; margin: 16px 0;">
            <p style="color: #333; font-size: 14px; margin: 0;">${response}</p>
          </div>
          <p style="color: #333; font-size: 14px;">
            Log in to your dashboard to continue the conversation.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendPaymentConfirmedEmail(
  to: string,
  memberName: string,
  paymentType: string,
  amount: string
) {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: getFrom(),
    to,
    subject: `Payment Confirmed: ${paymentType}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: #1B4332; padding: 24px; text-align: center;">
          <h1 style="color: #C8962E; font-size: 20px; margin: 0;">St. Bernadette's '09</h1>
        </div>
        <div style="padding: 24px; background: #FAF6F0;">
          <h2 style="color: #1B4332; font-size: 18px;">Payment Confirmed</h2>
          <p style="color: #333; font-size: 14px;">Hi ${memberName},</p>
          <p style="color: #333; font-size: 14px;">
            Your payment of <strong>GHS ${amount}</strong> for <strong>${paymentType}</strong>
            has been confirmed by the admin.
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 24px;">
            Thank you for your contribution. Unity | Support | Progress
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendWelfareDecisionEmail(
  to: string,
  memberName: string,
  decision: "approved" | "declined",
  notes?: string
) {
  if (!process.env.RESEND_API_KEY) return;

  const statusText = decision === "approved" ? "Approved" : "Declined";
  const statusColor = decision === "approved" ? "#1B4332" : "#DC2626";

  await resend.emails.send({
    from: getFrom(),
    to,
    subject: `Welfare Request ${statusText}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: #1B4332; padding: 24px; text-align: center;">
          <h1 style="color: #C8962E; font-size: 20px; margin: 0;">St. Bernadette's '09</h1>
        </div>
        <div style="padding: 24px; background: #FAF6F0;">
          <h2 style="color: #1B4332; font-size: 18px;">Welfare Request Update</h2>
          <p style="color: #333; font-size: 14px;">Hi ${memberName},</p>
          <p style="color: #333; font-size: 14px;">
            Your welfare request has been
            <strong style="color: ${statusColor};">${statusText}</strong>.
          </p>
          ${notes ? `
          <div style="background: white; border-left: 3px solid #C8962E; padding: 12px 16px; margin: 16px 0;">
            <p style="color: #666; font-size: 13px; margin: 0 0 4px;">Review notes:</p>
            <p style="color: #333; font-size: 14px; margin: 0;">${notes}</p>
          </div>
          ` : ""}
          <p style="color: #333; font-size: 14px;">
            Log in to your dashboard for more details.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendNewAnnouncementEmail(
  to: string,
  memberName: string,
  announcementTitle: string,
  content: string
) {
  if (!process.env.RESEND_API_KEY) return;

  const preview = content.length > 200 ? content.slice(0, 200) + "..." : content;

  await resend.emails.send({
    from: getFrom(),
    to,
    subject: `Announcement: ${announcementTitle}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: #1B4332; padding: 24px; text-align: center;">
          <h1 style="color: #C8962E; font-size: 20px; margin: 0;">St. Bernadette's '09</h1>
        </div>
        <div style="padding: 24px; background: #FAF6F0;">
          <h2 style="color: #1B4332; font-size: 18px;">${announcementTitle}</h2>
          <p style="color: #333; font-size: 14px;">Hi ${memberName},</p>
          <p style="color: #333; font-size: 14px; line-height: 1.6;">${preview}</p>
          <p style="color: #333; font-size: 14px;">
            Log in to your dashboard to read the full announcement.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendBulkEmail(
  recipients: { email: string; name: string }[],
  subject: string,
  htmlBuilder: (name: string) => string
) {
  if (!process.env.RESEND_API_KEY) return;

  for (const r of recipients) {
    try {
      await resend.emails.send({
        from: getFrom(),
        to: r.email,
        subject,
        html: htmlBuilder(r.name),
      });
    } catch {
      // continue sending to other recipients
    }
  }
}
