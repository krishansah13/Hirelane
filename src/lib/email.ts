import nodemailer from "nodemailer";

type StageChangeEmail = {
  to: string;
  applicantName: string;
  jobTitle: string;
  stage: string;
};

type NewJobAlertEmail = {
  to: string;
  seekerName: string;
  jobTitle: string;
  companyName: string;
  jobUrl: string;
  expiresAt: string | Date;
};

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !port || !user || !pass || !from) {
    return null;
  }

  return {
    from,
    transporter: nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    }),
  };
}

export async function sendStageChangeEmail({
  to,
  applicantName,
  jobTitle,
  stage,
}: StageChangeEmail) {
  const mail = getTransport();
  if (!mail) {
    console.error(
      "Missing SMTP_HOST/PORT/USER/PASS/FROM; skipped stage-change email",
    );
    return;
  }
  const greeting = applicantName.trim() || "there";
  const subject = `Your ${jobTitle} application has been moved to the ${stage} stage`;
  const text = `Hi ${greeting},\n\nYour application for ${jobTitle} was updated to: ${stage}.\n\nYou can check the latest status on your Hirelane dashboard.\n`;

  try {
    await mail.transporter.sendMail({
      from: mail.from,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error("Stage-change email failed", error);
  }
}

export async function sendNewJobAlertEmail({
  to,
  seekerName,
  jobTitle,
  companyName,
  jobUrl,
  expiresAt,
}: NewJobAlertEmail) {
  const mail = getTransport();

  if (!mail) {
    console.error(
      "Missing SMTP_HOST/PORT/USER/PASS/FROM; skipped new-job alert email",
    );
    return;
  }

  const greeting = seekerName.trim() || "there";
  const applicationDeadline = new Date(expiresAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const subject = `New job posted: ${jobTitle}`;

  const text = `Hi ${greeting},

A new job has been posted on Hirelane.

Job: ${jobTitle}
Company: ${companyName}
Last date to apply: ${applicationDeadline}

View the job:
${jobUrl}

Good luck with your application!
`;

  const logoUrl =
    "https://hirelane-flax.vercel.app/images/hirelane_brand_mark.png";

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
    <div style="text-align: center; padding: 24px 0;">
      <img
        src="${logoUrl}"
        alt="Hirelane"
        style="max-width: 180px; height: auto;"
      />
    </div>

    <div style="padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="margin-top: 0; color: #111827;">
        New job posted on Hirelane
      </h2>

      <p>Hi ${greeting},</p>

      <p>
        A new job has been posted on Hirelane that you may be interested in.
      </p>

      <p>
        <strong>Job:</strong> ${jobTitle}<br />
        <strong>Company:</strong> ${companyName}<br />
        <strong>Last date to apply:</strong> ${applicationDeadline}
      </p>

      <p>
        <a
          href="${jobUrl}"
          style="display: inline-block; padding: 10px 18px; background: #2e46ba; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;"
        >
          View Job
        </a>
      </p>

      <p>Good luck with your application!</p>
    </div>
  </div>
`;

  try {
    await mail.transporter.sendMail({
      from: mail.from,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error("New-job alert email failed", error);
  }
}
