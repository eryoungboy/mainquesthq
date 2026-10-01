import { notFound } from "next/navigation";
import { db } from "@/db";
import { registrations } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import QRCode from "qrcode";

interface TicketPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function TicketPage({ params }: TicketPageProps) {
  const { token } = await params;

  const [registration] = await db
    .select()
    .from(registrations)
    .where(eq(registrations.ticketToken, token))
    .limit(1);

  if (!registration) {
    notFound();
  }

  const referenceId = token.substring(0, 8).toUpperCase();
  
  // Create an absolute URL for the QR code (if env var exists, otherwise relative for local dev)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mainquesthq.com";
  const ticketUrl = `${baseUrl}/ticket/${token}`;
  
  // Generate QR as a base64 image
  const qrCodeDataUri = await QRCode.toDataURL(ticketUrl, {
    width: 250,
    margin: 1,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  return (
    <>
      <header className="site-header" id="top">
        <Link href="/" className="logo" aria-label="MainQuest home">
          <span>Main</span>
          <span className="logo-accent">Quest</span>
          <i aria-hidden="true"></i>
        </Link>
      </header>

      <main id="main" style={{ minHeight: "calc(100vh - 84px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(2rem, 5vw, 4rem) var(--pad)", background: "var(--cream)" }}>
        
        <div style={{ maxWidth: "480px", width: "100%" }}>
          <div className="section-label" style={{ marginBottom: "1rem" }}>
            <span>03</span> Ticket Confirmed
          </div>
          
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3rem)", lineHeight: 1.1, marginBottom: "2rem", letterSpacing: "-.05em" }}>
            You're in.<br />
            <em>See you there.</em>
          </h1>

          <div className="event-card" style={{ margin: "0 0 2rem 0", width: "100%", boxShadow: "10px 10px 0 var(--red)" }}>
            <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--black)", background: "var(--yellow)" }}>
              <span className="card-kicker">MainQuest / 01</span>
              <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.2rem)", marginTop: "0.5rem", marginBottom: "0", lineHeight: 1.1 }}>
                {registration.firstName.toUpperCase()} {registration.lastName.toUpperCase()}
              </h2>
              <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.75rem", fontWeight: 900, letterSpacing: ".1em" }}>
                REF: {referenceId}
              </p>
            </div>
            
            <p><span>Date</span><strong>October 31, 2026</strong></p>
            <p><span>Time</span><strong>11:00 AM Start</strong></p>
            <p><span>Venue</span><strong>The Foundry<br />101 Rogers St<br />Cambridge, MA 02142</strong></p>

            <div style={{ padding: "2rem", textAlign: "center", borderTop: "2px dashed var(--black)", background: "var(--white)" }}>
              <img 
                src={qrCodeDataUri} 
                alt="Ticket QR Code" 
                style={{ width: "200px", height: "200px", border: "var(--border)", display: "block", margin: "0 auto" }} 
              />
              <p style={{ margin: "1rem 0 0 0", fontSize: "0.8rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".05em" }}>
                Present this code upon arrival
              </p>
            </div>
          </div>

          <Link href="/" className="text-link">
            ← Back to homepage
          </Link>
        </div>
      </main>
    </>
  );
}
