import { db } from "@/db";
import { registrations } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { signOutAction } from "./actions";

export default async function AdminDashboard() {
  const allRegistrations = await db
    .select()
    .from(registrations)
    .orderBy(desc(registrations.createdAt));

  const total = allRegistrations.length;
  const optIns = allRegistrations.filter(r => r.wantsUpdates).length;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--cream)" }}>
      <header className="site-header" style={{ background: "var(--black)", color: "var(--white)", padding: "1rem var(--pad)" }}>
        <Link href="/admin" className="logo logo-light" aria-label="MainQuest Admin">
          <span>Admin</span>
          <span className="logo-accent" style={{ color: "var(--yellow)" }}>Dashboard</span>
          <i aria-hidden="true" style={{ background: "var(--red)" }}></i>
        </Link>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <Link href="/admin" className="text-link" style={{ color: "var(--yellow)", borderColor: "var(--yellow)" }}>
            Registrations
          </Link>
          <Link href="/admin/broadcast" className="text-link" style={{ color: "var(--white)", borderColor: "transparent" }}>
            WhatsApp Blast
          </Link>
          <Link href="/admin/email" className="text-link" style={{ color: "var(--white)", borderColor: "transparent" }}>
            Email Blast
          </Link>
          <form action={signOutAction} style={{ display: "inline-block" }}>
            <button type="submit" className="text-link" style={{ color: "var(--white)", borderColor: "transparent" }}>
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main style={{ flex: 1, padding: "clamp(2rem, 5vw, 4rem) var(--pad)" }}>
        <div className="section-label" style={{ marginBottom: "2rem" }}>
          <span>01</span> Overview
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem", marginBottom: "3rem" }}>
          <div className="event-card" style={{ maxWidth: "100%", margin: 0, padding: "2rem", background: "var(--yellow)" }}>
            <span className="card-kicker">Total Registrations</span>
            <p style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", margin: 0 }}>{total}</p>
          </div>
          <div className="event-card" style={{ maxWidth: "100%", margin: 0, padding: "2rem", background: "var(--white)", boxShadow: "6px 6px 0 var(--red)" }}>
            <span className="card-kicker">Marketing Opt-ins</span>
            <p style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", margin: 0 }}>{optIns}</p>
          </div>
        </div>

        <div className="section-label" style={{ marginBottom: "2rem" }}>
          <span>02</span> Registrants
        </div>

        <div style={{ overflowX: "auto", background: "var(--white)", border: "var(--border)", boxShadow: "8px 8px 0 var(--navy)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem", minWidth: "800px" }}>
            <thead style={{ background: "var(--black)", color: "var(--white)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <tr>
                <th style={{ padding: "1rem", borderBottom: "var(--border)" }}>Name</th>
                <th style={{ padding: "1rem", borderBottom: "var(--border)" }}>Contact</th>
                <th style={{ padding: "1rem", borderBottom: "var(--border)" }}>Location</th>
                <th style={{ padding: "1rem", borderBottom: "var(--border)" }}>Age</th>

                <th style={{ padding: "1rem", borderBottom: "var(--border)" }}>Registered</th>
              </tr>
            </thead>
            <tbody>
              {allRegistrations.map((reg) => (
                <tr key={reg.id} style={{ borderBottom: "1px solid var(--black)" }}>
                  <td style={{ padding: "1rem" }}>
                    <strong>{reg.firstName} {reg.lastName}</strong>
                    <br />
                    <span style={{ fontSize: "0.7rem", color: "#555" }}>Ref: {reg.ticketToken.substring(0,8).toUpperCase()}</span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {reg.email}
                    <br />
                    <span style={{ fontSize: "0.75rem" }}>{reg.phoneNormalized || reg.phoneRaw}</span>
                  </td>
                  <td style={{ padding: "1rem" }}>{reg.city}, {reg.state}</td>
                  <td style={{ padding: "1rem" }}>{reg.ageRange}</td>

                  <td style={{ padding: "1rem", whiteSpace: "nowrap" }}>
                    {new Date(reg.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {allRegistrations.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "2rem", textAlign: "center" }}>
                    No registrations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
