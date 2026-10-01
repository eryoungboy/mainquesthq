"use server";

import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email")?.toString().toLowerCase().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);

  if (!user) {
    return { error: "Invalid email or password." };
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    return { error: "Invalid email or password." };
  }

  await createSession(user.id);
  
  redirect("/admin");
}
