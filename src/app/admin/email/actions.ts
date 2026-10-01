"use server";
import { db } from "@/db";
import { registrations, communicationsLog } from "@/db/schema";
import { waitUntil } from "@vercel/functions";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_123");

export async function sendEmailBroadcastAction(prevState: any, formData: FormData) {
  const messageHtml = formData.get("messageHtml")?.toString();
  const audience = formData.get("audience")?.toString();
  const emailSubject = formData.get("emailSubject")?.toString();

  if (!messageHtml || messageHtml === "<p><br></p>" || messageHtml.trim() === "") {
    return { error: "Email content is required." };
  }
  if (!emailSubject) {
    return { error: "Email subject is required." };
  }

  const allRegistrations = await db.select().from(registrations);
  const targets = audience === "marketing" 
    ? allRegistrations.filter(r => r.wantsUpdates)
    : allRegistrations;

  if (targets.length === 0) return { error: "No recipients found for this audience." };

  waitUntil(processBatchEmail(targets, messageHtml, emailSubject));
  
  return { success: `Email broadcast queued for ${targets.length} recipient(s).` };
}

async function processBatchEmail(targets: any[], rawHtml: string, emailSubject: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mainquesthq.com";
  
  for (const reg of targets) {
    let html = rawHtml;
    // Replace placeholders globally in the raw HTML string
    html = html.replace(/\{\{firstName\}\}/gi, reg.firstName);
    html = html.replace(/\{\{lastName\}\}/gi, reg.lastName);
    html = html.replace(/\{\{email\}\}/gi, reg.email);
    html = html.replace(/\{\{ticketToken\}\}/gi, reg.ticketToken);
    html = html.replace(/\{\{ticketUrl\}\}/gi, `${baseUrl}/ticket/${reg.ticketToken}`);

    try {
      const { error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "MainQuest <hello@mainquesthq.com>",
        to: [reg.email],
        subject: emailSubject,
        html: html,
      });

      await db.insert(communicationsLog).values({
        registrationId: reg.id,
        type: "broadcast_email",
        status: error ? "failed" : "sent",
        errorMessage: error?.message || undefined,
      });
    } catch (err: any) {
      await db.insert(communicationsLog).values({
        registrationId: reg.id,
        type: "broadcast_email",
        status: "failed",
        errorMessage: err.message,
      });
    }
    // Small delay to respect Resend rate limits
    await new Promise(r => setTimeout(r, 200));
  }
}
