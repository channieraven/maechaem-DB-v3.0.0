/**
 * Clerk Webhook Handler — listens for Clerk events and syncs data to Neon.
 *
 * Required environment variables (set in .env.local):
 *   CLERK_WEBHOOK_SECRET — signing secret from the Clerk Dashboard
 *                          (Webhooks → your endpoint → Signing Secret)
 *   DATABASE_URL          — Neon connection string
 *
 * Supported events:
 *   user.created — inserts user_id + primary email into the `profiles` table.
 *
 * Prerequisites — run this SQL once against your Neon database:
 *   CREATE TABLE IF NOT EXISTS profiles (
 *     id         SERIAL PRIMARY KEY,
 *     user_id    TEXT NOT NULL UNIQUE,
 *     email      TEXT NOT NULL,
 *     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
 *   );
 */

import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { sql } from "@/lib/db";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EmailAddress {
  email_address: string;
  id: string;
}

interface UserCreatedData {
  id: string;
  email_addresses: EmailAddress[];
  primary_email_address_id: string;
}

interface ClerkWebhookEvent {
  type: string;
  data: UserCreatedData;
}

// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Missing environment variable: CLERK_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  // Retrieve the raw body and Svix signature headers for verification.
  const body = await request.text();
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing Svix headers" },
      { status: 400 }
    );
  }

  // Verify the webhook payload using the Svix library.
  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Clerk webhook verification failed:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  // Handle the user.created event.
  if (event.type === "user.created") {
    const { id: userId, email_addresses, primary_email_address_id } = event.data;

    // Find the primary email address from the list.
    const primaryEmail = email_addresses.find(
      (e) => e.id === primary_email_address_id
    );

    if (!primaryEmail) {
      console.error("Could not find primary email for user:", userId);
      return NextResponse.json(
        { error: "Primary email not found" },
        { status: 422 }
      );
    }

    try {
      await sql`
        INSERT INTO profiles (user_id, email)
        VALUES (${userId}, ${primaryEmail.email_address})
        ON CONFLICT (user_id) DO NOTHING
      `;
      console.log(`Profile created for user: ${userId}`);
    } catch (err) {
      console.error("Database insert failed:", err);
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
