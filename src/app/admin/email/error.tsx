"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Email error caught:", error);
  }, [error]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--cream)", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div className="form-shell" style={{ maxWidth: "500px", padding: "2.5rem", textAlign: "center", boxShadow: "8px 8px 0 var(--navy)" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "var(--red)" }}>Something went wrong</h2>
        <p style={{ marginBottom: "1.5rem", color: "#444" }}>
          {error.message || "An unexpected error occurred while processing this request."}
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button className="button" onClick={() => reset()} type="button">
            Try Again
          </button>
          <Link href="/admin" className="button" style={{ background: "var(--black)", color: "var(--white)" }}>
            Back to Admin
          </Link>
        </div>
      </div>
    </div>
  );
}

