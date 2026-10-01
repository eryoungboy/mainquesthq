"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import Link from "next/link";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <>
      <header className="site-header" id="top">
        <Link href="/" className="logo" aria-label="MainQuest home">
          <span>Main</span>
          <span className="logo-accent">Quest</span>
          <i aria-hidden="true"></i>
        </Link>
      </header>
      <main style={{ minHeight: "calc(100vh - 84px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", background: "var(--cream)" }}>
        <div className="form-shell" style={{ maxWidth: "450px", width: "100%", padding: "2.5rem", minHeight: "auto" }}>
          <div className="section-label" style={{ marginBottom: "2rem" }}>
            <span>A</span> Admin Portal
          </div>
          
          <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem", lineHeight: 1.1, letterSpacing: "-.05em" }}>
            Sign in
          </h1>

          <form action={formAction}>
            <div className="field" style={{ marginBottom: "1.5rem" }}>
              <label htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" placeholder="admin@mainquesthq.com" required />
            </div>
            
            <div className="field" style={{ marginBottom: "2rem" }}>
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required />
            </div>

            {state?.error && (
              <div className="form-error-banner" style={{ color: "var(--red)", marginBottom: "1rem", fontWeight: "bold" }}>
                {state.error}
              </div>
            )}

            <button className="button button-submit" type="submit" disabled={isPending} style={{ width: "100%", marginTop: "0" }}>
              {isPending ? "Authenticating..." : "Sign in"} <span aria-hidden="true">→</span>
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
