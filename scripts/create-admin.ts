import { db } from "../src/db";
import { adminUsers } from "../src/db/schema";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("Usage: npx tsx --env-file=.env.local scripts/create-admin.ts <email> <password>");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.insert(adminUsers).values({
    email: email.toLowerCase(),
    passwordHash,
  });

  console.log(`✅ Admin user created: ${email}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error creating admin:", err);
  process.exit(1);
});
