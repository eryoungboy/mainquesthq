import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <header className="site-header" id="top">
        <Link href="/" className="logo" aria-label="MainQuest home">
          <span>Main</span>
          <span className="logo-accent">Quest</span>
          <i aria-hidden="true"></i>
        </Link>
      </header>

      <main id="main" style={{ minHeight: "calc(100vh - 84px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem var(--pad)", background: "var(--cream)", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(5rem, 10vw, 8rem)", marginBottom: "1rem", color: "var(--red)" }}>404</h1>
        <p className="eyebrow" style={{ justifyContent: "center", marginBottom: "1.5rem" }}>
          <span></span> Ticket not found
        </p>
        <p style={{ maxWidth: "400px", marginBottom: "2.5rem", fontSize: "1.1rem", fontWeight: "bold" }}>
          We couldn't find a valid registration for this link. It may be incorrect or have been removed.
        </p>
        <Link href="/" className="button button-primary">
          Back to homepage <span aria-hidden="true">→</span>
        </Link>
      </main>
    </>
  );
}
