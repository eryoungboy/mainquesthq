"use server";
import { db } from "@/db";
import { registrations, communicationsLog } from "@/db/schema";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_123");

function wrapBroadcastEmailHtml(contentHtml: string): string {
  // In HTML emails, desktop webmail (especially Gmail) strips <style> tags in <head>.
  // We must inline max-width, width, and height directly onto all <img> tags so they never bleed out of the 600px container.
  const inlinedContent = contentHtml.replace(/<img\b([^>]*)>/gi, (match, attrs) => {
    if (/style=["']/i.test(attrs)) {
      return match.replace(
        /style=["']([^"']*)["']/i,
        'style="max-width:100% !important; width:100% !important; height:auto !important; display:block; margin:20px auto; border-radius:4px; border:1px solid #000000; box-shadow:4px 4px 0px #000000; $1"'
      );
    }
    return `<img ${attrs} style="max-width:100% !important; width:100% !important; height:auto !important; display:block; margin:20px auto; border-radius:4px; border:1px solid #000000; box-shadow:4px 4px 0px #000000;" />`;
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MainQuest</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1ecd8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111111; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1ecd8; width: 100% !important; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container (standard 600px email width) -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border: 2px solid #000000; box-shadow: 6px 6px 0px #fb1422; text-align: left;">
          <tr>
            <td style="padding: 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <!-- Header -->
              <div style="font-size: 24px; font-weight: 900; letter-spacing: -0.05em; color: #000000; margin-bottom: 24px; border-bottom: 2px solid #f1ecd8; padding-bottom: 12px;">
                MainQuest
              </div>
              <!-- Dynamic Body Content -->
              <div style="font-size: 16px; line-height: 1.6; color: #111111;">
                ${inlinedContent}
              </div>
              <!-- Footer -->
              <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 12px; line-height: 1.5; color: #666666; text-align: center;">
                <p style="margin: 0 0 4px 0;">MainQuest • Find your direction. Make your move.</p>
                <p style="margin: 0; color: #999999;">You received this email because you registered for MainQuest.</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendTestEmailAction(prevState: any, formData: FormData) {
  try {
    const testEmail = formData.get("testEmail")?.toString().trim().toLowerCase();
    const messageHtml = formData.get("messageHtml")?.toString();
    const emailSubject = formData.get("emailSubject")?.toString();

    if (!testEmail || !testEmail.includes("@")) {
      return { error: "Please enter a valid email address for testing." };
    }
    if (!messageHtml || messageHtml === "<p><br></p>" || messageHtml.trim() === "") {
      return { error: "Email content is required before sending a test." };
    }
    if (!emailSubject || emailSubject.trim() === "") {
      return { error: "Email subject is required before sending a test." };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mainquesthq.com";
    const fromEmail = process.env.EMAIL_FROM || "MainQuest <hello@mainquesthq.com>";

    let personalizedHtml = messageHtml;
    personalizedHtml = personalizedHtml.replace(/\{\{firstName\}\}/gi, "Tester");
    personalizedHtml = personalizedHtml.replace(/\{\{lastName\}\}/gi, "Admin");
    personalizedHtml = personalizedHtml.replace(/\{\{email\}\}/gi, testEmail);
    personalizedHtml = personalizedHtml.replace(/\{\{ticketToken\}\}/gi, "SAMPLE-TICKET-TOKEN");
    personalizedHtml = personalizedHtml.replace(/\{\{ticketUrl\}\}/gi, `${baseUrl}/ticket/sample`);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [testEmail],
      subject: `[TEST] ${emailSubject}`,
      html: wrapBroadcastEmailHtml(personalizedHtml),
    });

    if (error) {
      return { error: `Resend error: ${error.message}` };
    }

    return { success: `Test email successfully sent to ${testEmail}! (ID: ${data?.id})` };
  } catch (err: any) {
    console.error("Test email error:", err);
    return { error: err.message || "Failed to send test email." };
  }
}

export async function sendEmailBroadcastAction(prevState: any, formData: FormData) {
  try {
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
          const returnedData = res.data?.data || [];
          const returnedErrors = (res.data as any)?.errors || [];

          const errorByIndex = new Map<number, string>();
          for (const err of returnedErrors) {
            errorByIndex.set(err.index, err.message);
            errorMessages.push(err.message);
          }

          const logsToInsert: any[] = [];
          chunk.forEach((reg, idx) => {
            const err = errorByIndex.get(idx);
            if (err) {
              failCount++;
              logsToInsert.push({
                registrationId: reg.id,
                type: "broadcast_email" as const,
                status: "failed" as const,
                errorMessage: err,
              });
            } else {
              sentCount++;
              logsToInsert.push({
                registrationId: reg.id,
                type: "broadcast_email" as const,
                status: "sent" as const,
                providerId: returnedData[idx]?.id || null,
              });
            }
          });

          if (logsToInsert.length > 0) {
            await db.insert(communicationsLog).values(logsToInsert);
          }
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
      return { error: `Failed to send broadcast: ${errorMessages.slice(0, 3).join("; ")}` };
    }

    if (failCount > 0) {
      return {
        success: `Sent to ${sentCount} recipient(s), but ${failCount} failed: ${errorMessages.slice(0, 3).join("; ")}`,
      };
    }

    return { success: `Successfully sent email blast to all ${sentCount} recipient(s)!` };
  } catch (err: any) {
    console.error("sendEmailBroadcastAction fatal error:", err);
    return { error: err.message || "An unexpected error occurred while sending the broadcast." };
  }
}
