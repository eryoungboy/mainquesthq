"use server";
import { whatsappClient } from "@/lib/whatsapp";
import { db } from "@/db";
import { registrations, communicationsLog, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { waitUntil } from "@vercel/functions";

export async function getWhatsAppStatusAction() {
  return await whatsappClient.getStatusAndQR();
}

export async function startWhatsAppAction() {
  return await whatsappClient.connect();
}

export async function logoutWhatsAppAction() {
  await whatsappClient.logout();
  return { success: true };
}

export async function getWelcomeMessageAction() {
  const [row] = await db.select().from(settings).where(eq(settings.key, "whatsapp_welcome_message"));
  return row?.value || "Hi {{firstName}}, thanks for registering for MainQuest! We've sent your ticket and next steps to your email.";
}

export async function updateWelcomeMessageAction(prevState: any, formData: FormData) {
  const message = formData.get("message")?.toString();
  if (!message) return { error: "Message is required." };
  
  await db.insert(settings)
    .values({ key: "whatsapp_welcome_message", value: message })
    .onConflictDoUpdate({ target: settings.key, set: { value: message, updatedAt: new Date() } });
    
  return { success: "Welcome message updated successfully!" };
}

export async function sendBroadcastAction(prevState: any, formData: FormData) {
  const message = formData.get("message")?.toString();
  const audience = formData.get("audience")?.toString(); // "all" or "marketing"

  if (!message) return { error: "Message is required." };

  const allRegistrations = await db.select().from(registrations);
  const targets = audience === "marketing" 
    ? allRegistrations.filter(r => r.wantsUpdates)
    : allRegistrations;

  if (targets.length === 0) return { error: "No recipients found for this audience." };

  waitUntil(processBatchBroadcast(targets, message));
  
  return { success: `Broadcast started for ${targets.length} recipient(s). Check logs later.` };
}

async function processBatchBroadcast(targets: any[], rawMessage: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mainquesthq.com";
  
  for (const reg of targets) {
    const phone = reg.phoneNormalized || reg.phoneRaw;
    if (phone) {
      // Replace placeholders
      let message = rawMessage;
      message = message.replace(/\{\{firstName\}\}/gi, reg.firstName);
      message = message.replace(/\{\{lastName\}\}/gi, reg.lastName);
      message = message.replace(/\{\{email\}\}/gi, reg.email);
      message = message.replace(/\{\{ticketToken\}\}/gi, reg.ticketToken);
      message = message.replace(/\{\{ticketUrl\}\}/gi, `${baseUrl}/ticket/${reg.ticketToken}`);

      const { success, error } = await whatsappClient.sendText(phone, message);
      await db.insert(communicationsLog).values({
        registrationId: reg.id,
        type: "whatsapp_reminder",
        status: success ? "sent" : "failed",
        errorMessage: error || undefined,
      });
      
      // Delay 1s to prevent rate limits on OpenWA
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}
