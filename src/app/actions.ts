"use server";

import { z } from "zod";
import { parsePhoneNumber } from "libphonenumber-js";
import { db } from "@/db";
import { registrations, communicationsLog, settings, adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { waitUntil } from "@vercel/functions";
import { Resend } from "resend";
import { TicketEmail } from "@/emails/TicketEmail";
import { generateTicketImage } from "@/lib/ticket-image";
import QRCode from "qrcode";
import * as ics from "ics";

const resend = new Resend(process.env.RESEND_API_KEY || "re_123");

const registrationSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address").max(255).transform(s => s.toLowerCase().trim()),
  phone: z.string().min(1, "Phone is required").max(50),
  age: z.string().min(1, "Age range is required").max(50),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(50),
  updates: z.enum(["Yes", "No"]),
  source: z.string().max(100).optional(),
  consent: z.literal("on", {
    message: "You must agree to the terms",
  }),
});

export async function submitRegistration(formData: FormData) {
  try {
    const rawData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      age: formData.get("age"),
      city: formData.get("city"),
      state: formData.get("state"),
      updates: formData.get("updates"),
      source: formData.get("source"),
      consent: formData.get("consent"),
    };

    const validatedData = registrationSchema.parse(rawData);

    // Normalize phone number
    let phoneNormalized = validatedData.phone;
    try {
      const phoneNumber = parsePhoneNumber(validatedData.phone, "US");
      if (phoneNumber && phoneNumber.isValid()) {
        phoneNormalized = phoneNumber.format("E.164");
      } else {
        return { success: false, error: "Invalid phone number format." };
      }
    } catch (err) {
      return { success: false, error: "Invalid phone number format." };
    }

    const ticketToken = crypto.randomBytes(16).toString("hex");

    const [inserted] = await db.insert(registrations).values({
      ticketToken,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      phoneRaw: validatedData.phone,
      phoneNormalized: phoneNormalized,
      ageRange: validatedData.age,
      city: validatedData.city,
      state: validatedData.state,
      wantsUpdates: validatedData.updates === "Yes",
      source: validatedData.source || "",
      consent: true,
    }).returning({ id: registrations.id });
    
    // Dispatch async email task so it doesn't block the UI
    waitUntil(sendWelcomeEmail(
      inserted.id,
      validatedData.email,
      validatedData.firstName,
      validatedData.lastName,
      ticketToken
    ));
    
    waitUntil(sendWelcomeWhatsApp(
      inserted.id,
      phoneNormalized,
      validatedData.firstName,
      validatedData.lastName,
      ticketToken
    ));

    waitUntil(sendAdminNotificationEmail(validatedData));
    
    return { success: true, ticketToken, firstName: validatedData.firstName };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: (error as any).errors[0].message };
    }
    // Check for Postgres unique violation
    if (error.code === '23505') {
      return { success: false, error: "This email address is already registered." };
    }
    console.error("Registration error:", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

async function sendWelcomeEmail(registrationId: string, email: string, firstName: string, lastName: string, ticketToken: string) {
  try {
    const referenceId = ticketToken.substring(0, 8).toUpperCase();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mainquesthq.com";
    const ticketUrl = `${baseUrl}/ticket/${ticketToken}`;

    const qrCodeDataUri = await QRCode.toDataURL(ticketUrl, {
      width: 250, margin: 1, color: { dark: "#000000", light: "#ffffff" }
    });
    const base64Data = qrCodeDataUri.split(",")[1];

    const { error: icsError, value: icsValue } = ics.createEvent({
      title: "MainQuest",
      description: `Your ticket reference: ${referenceId}\nTicket URL: ${ticketUrl}`,
      location: "The Foundry, 101 Rogers St, Cambridge, MA 02142",
      start: [2026, 10, 31, 15, 0], // Oct 31, 2026 at 11am EDT (UTC-4)
      startInputType: "utc",
      duration: { hours: 2, minutes: 0 },
      status: "CONFIRMED",
      busyStatus: "BUSY",
    });

    const attachments: any[] = icsValue ? [
      { filename: "event.ics", content: Buffer.from(icsValue).toString("base64"), content_type: "text/calendar" }
    ] : [];

    const ticketImageResponse = await generateTicketImage(firstName, lastName, referenceId, qrCodeDataUri);
    const ticketImageBuffer = await ticketImageResponse.arrayBuffer();
    const ticketImageBase64 = Buffer.from(ticketImageBuffer).toString("base64");

    attachments.push({
      filename: "MainQuest_Ticket.png",
      content: ticketImageBase64,
      content_type: "image/png"
    });

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "MainQuest <hello@mainquesthq.com>",
      to: [email],
      subject: "You Have Joined The Quest",
      react: TicketEmail({ firstName, lastName, referenceId, ticketUrl, qrCodeDataUri: "cid:qrcode" }),
      attachments,
    });

    if (error) throw error;

    await db.insert(communicationsLog).values({
      registrationId,
      type: "registration_email",
      status: "sent",
      providerId: data?.id,
    });
  } catch (error: any) {
    console.error("Email error:", error);
    await db.insert(communicationsLog).values({
      registrationId,
      type: "registration_email",
      status: "failed",
      errorMessage: error.message || "Unknown error",
    });
  }
}

async function sendWelcomeWhatsApp(registrationId: string, phone: string, firstName: string, lastName: string, ticketToken: string) {
  try {
    const [row] = await db.select().from(settings).where(eq(settings.key, "whatsapp_welcome_message"));
    let template = row?.value || "Hi {{firstName}}, thanks for registering for MainQuest! We've sent your ticket and next steps to your email.";

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mainquesthq.com";
    const ticketUrl = `${baseUrl}/ticket/${ticketToken}`;

    let msg = template;
    msg = msg.replace(/\{\{firstName\}\}/gi, firstName);
    msg = msg.replace(/\{\{lastName\}\}/gi, lastName);
    msg = msg.replace(/\{\{ticketUrl\}\}/gi, ticketUrl);

    const { whatsappClient } = await import("@/lib/whatsapp");
    const { success, error } = await whatsappClient.sendText(phone, msg);

    await db.insert(communicationsLog).values({
      registrationId,
      type: "whatsapp_confirmation",
      status: success ? "sent" : "failed",
      errorMessage: error || undefined,
    });
  } catch (error: any) {
    console.error("WhatsApp error:", error);
    await db.insert(communicationsLog).values({
      registrationId,
      type: "whatsapp_confirmation",
      status: "failed",
      errorMessage: error.message || "Unknown error",
    });
  }
}

async function sendAdminNotificationEmail(registrationData: any) {
  try {
    const admins = await db.select({ email: adminUsers.email }).from(adminUsers);
    const adminEmails = admins.map(a => a.email);
    if (adminEmails.length === 0) return;

    const { firstName, lastName, email, phone, city, state } = registrationData;
    const html = `
      <h2>New Registration for MainQuest</h2>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Location:</strong> ${city}, ${state}</p>
    `;
    
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "MainQuest <hello@mainquesthq.com>",
      to: adminEmails,
      subject: `New Registration: ${firstName} ${lastName}`,
      html: html,
    });
  } catch (error) {
    console.error("Admin notification email error:", error);
  }
}
