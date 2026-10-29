"use server";
import { db } from "@/db";
import { registrations, communicationsLog } from "@/db/schema";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_123");

function wrapBroadcastEmailHtml(contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MainQuest</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1ecd8; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111111; }
    .email-container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 2px solid #000000; box-shadow: 6px 6px 0px #fb1422; padding: 32px; box-sizing: border-box; }
    .email-header { font-size: 24px; font-weight: 900; letter-spacing: -0.05em; color: #000000; margin-bottom: 24px; border-bottom: 2px solid #f1ecd8; padding-bottom: 12px; }
    .email-body { font-size: 16px; line-height: 1.6; color: #111111; }
    .email-body p { margin: 0 0 16px 0; }
    .email-body img { max-width: 100%; height: auto; display: block; margin: 16px 0; border: 1px solid #e5e5e5; }
    .email-body a { color: #fb1422; text-decoration: underline; font-weight: bold; }
    .email-body blockquote { border-left: 4px solid #fb1422; margin: 16px 0; padding-left: 16px; color: #555555; }
    .email-footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 12px; line-height: 1.5; color: #666666; text-align: center; }
  </style>
</head>
<body style="margin: 0; padding: 20px 10px; background-color: #f1ecd8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111111;">
  <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 2px solid #000000; box-shadow: 6px 6px 0px #fb1422; padding: 32px; box-sizing: border-box;">
    <div style="font-size: 24px; font-weight: 900; letter-spacing: -0.05em; color: #000000; margin-bottom: 24px; border-bottom: 2px solid #f1ecd8; padding-bottom: 12px;">
      MainQuest
    </div>
    <div style="font-size: 16px; line-height: 1.6; color: #111111;">
      ${contentHtml}
    </div>
    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 12px; line-height: 1.5; color: #666666; text-align: center;">
      <p style="margin: 0 0 4px 0;">MainQuest • Find your direction. Make your move.</p>
      <p style="margin: 0; color: #999999;">You received this email because you registered for MainQuest.</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendEmailBroadcastAction(prevState: any, formData: FormData) {
  const messageHtml = formData.get("messageHtml")?.toString();
  const audience = formData.get("audience")?.toString();
  const emailSubject = formData.get("emailSubject")?.toString();

  if (!messageHtml || messageHtml === "<p><br></p>" || messageHtml.trim() === "") {
    return { error: "Email content is required." };
  }
  if (!emailSubject || emailSubject.trim() === "") {
    return { error: "Email subject is required." };
  }

  const allRegistrations = await db.select().from(registrations);
  const targets = audience === "marketing" 
    ? allRegistrations.filter(r => r.wantsUpdates)
    : allRegistrations;

  if (targets.length === 0) return { error: "No recipients found for this audience." };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mainquesthq.com";
  const fromEmail = process.env.EMAIL_FROM || "MainQuest <hello@mainquesthq.com>";

  const CHUNK_SIZE = 100;
  let sentCount = 0;
  let failCount = 0;
  const errorMessages: string[] = [];

  for (let i = 0; i < targets.length; i += CHUNK_SIZE) {
    const chunk = targets.slice(i, i + CHUNK_SIZE);

    const emailBatch = chunk.map(reg => {
      let personalizedHtml = messageHtml;
      personalizedHtml = personalizedHtml.replace(/\{\{firstName\}\}/gi, reg.firstName);
      personalizedHtml = personalizedHtml.replace(/\{\{lastName\}\}/gi, reg.lastName);
      personalizedHtml = personalizedHtml.replace(/\{\{email\}\}/gi, reg.email);
      personalizedHtml = personalizedHtml.replace(/\{\{ticketToken\}\}/gi, reg.ticketToken);
      personalizedHtml = personalizedHtml.replace(/\{\{ticketUrl\}\}/gi, `${baseUrl}/ticket/${reg.ticketToken}`);

      return {
        from: fromEmail,
        to: [reg.email],
        subject: emailSubject,
        html: wrapBroadcastEmailHtml(personalizedHtml),
      };
    });

    try {
      const res = await resend.batch.send(emailBatch, { batchValidation: "permissive" });

      if (res.error) {
        errorMessages.push(res.error.message);
        failCount += chunk.length;

        const failureLogs = chunk.map(reg => ({
          registrationId: reg.id,
          type: "broadcast_email" as const,
          status: "failed" as const,
          errorMessage: res.error?.message || "Batch send error",
        }));
        await db.insert(communicationsLog).values(failureLogs);
      } else {
        const returnedIds = res.data?.data || [];
        sentCount += chunk.length;

        const successLogs = chunk.map((reg, idx) => ({
          registrationId: reg.id,
          type: "broadcast_email" as const,
          status: "sent" as const,
          providerId: returnedIds[idx]?.id || null,
        }));
        await db.insert(communicationsLog).values(successLogs);
      }
    } catch (batchErr: any) {
      errorMessages.push(batchErr.message || "Failed to send batch");
      failCount += chunk.length;

      const failureLogs = chunk.map(reg => ({
        registrationId: reg.id,
        type: "broadcast_email" as const,
        status: "failed" as const,
        errorMessage: batchErr.message || "Unexpected exception during send",
      }));
      await db.insert(communicationsLog).values(failureLogs);
    }
  }

  if (failCount > 0 && sentCount === 0) {
    return { error: `Failed to send broadcast: ${errorMessages.join("; ")}` };
  }

  if (failCount > 0) {
    return {
      success: `Sent to ${sentCount} recipient(s), but ${failCount} failed: ${errorMessages.join("; ")}`,
    };
  }

  return { success: `Successfully sent email blast to ${sentCount} recipient(s)!` };
}
