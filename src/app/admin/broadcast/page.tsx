"use client";

import { useEffect, useState, useActionState, useRef } from "react";
import Link from "next/link";
import { signOutAction } from "../actions";
import { getWhatsAppStatusAction, startWhatsAppAction, logoutWhatsAppAction, sendBroadcastAction, getWelcomeMessageAction, updateWelcomeMessageAction } from "./actions";

export default function BroadcastPage() {
  const [statusData, setStatusData] = useState<{status: string, qrCode?: string | null, phoneNumber?: string | null}>({ status: "Loading..." });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [broadcastState, broadcastAction, isBroadcasting] = useActionState(sendBroadcastAction, undefined);
  const [messageText, setMessageText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [welcomeMessageState, welcomeMessageAction, isUpdatingWelcome] = useActionState(updateWelcomeMessageAction, undefined as any);
  const [welcomeText, setWelcomeText] = useState("");
  const welcomeTextareaRef = useRef<HTMLTextAreaElement>(null);

  const insertPlaceholder = (placeholder: string, ref: React.RefObject<HTMLTextAreaElement | null>, textState: string, setTextState: (t: string) => void) => {
    const textarea = ref.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = textState.substring(0, start);
    const after = textState.substring(end, textState.length);
    const newText = before + placeholder + after;
    setTextState(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
    }, 0);
  };

  const fetchStatus = async () => {
    setIsRefreshing(true);
    const data = await getWhatsAppStatusAction();
    setStatusData(data);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchStatus();
    getWelcomeMessageAction().then(setWelcomeText);
    const interval = setInterval(() => {
      if (statusData.status === "Waiting for QR Scan" || statusData.status === "Connecting") {
        fetchStatus();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [statusData.status]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--cream)" }}>
      <header className="site-header" style={{ background: "var(--black)", color: "var(--white)", padding: "1rem var(--pad)" }}>
        <Link href="/admin" className="logo logo-light" aria-label="MainQuest Admin">
          <span>Admin</span>
          <span className="logo-accent" style={{ color: "var(--yellow)" }}>Dashboard</span>
          <i aria-hidden="true" style={{ background: "var(--red)" }}></i>
        </Link>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <Link href="/admin" className="text-link" style={{ color: "var(--white)", borderColor: "transparent" }}>
            Registrations
          </Link>
          <Link href="/admin/broadcast" className="text-link" style={{ color: "var(--yellow)", borderColor: "var(--yellow)" }}>
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
          <span>03</span> WhatsApp Connection
        </div>
        
        <div className="event-card" style={{ maxWidth: "600px", padding: "2rem", marginBottom: "3rem", background: "var(--white)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "2px solid var(--black)" }}>
            <span style={{ fontWeight: 900, textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "0.1em" }}>
              Status: <span style={{ color: statusData.status === "Connected" ? "var(--green)" : "var(--red)" }}>{statusData.status}</span>
            </span>
            <button onClick={fetchStatus} disabled={isRefreshing} className="text-link" style={{ padding: 0, fontSize: "0.8rem" }}>
              Refresh Status ⟳
            </button>
          </div>

          {statusData.status === "Disconnected" && (
            <button onClick={async () => { await startWhatsAppAction(); fetchStatus(); }} className="button button-primary" style={{ width: "100%", marginTop: "1rem" }}>
              Start WhatsApp Session
            </button>
          )}

          {statusData.status === "Waiting for QR Scan" && statusData.qrCode && (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: "bold", marginBottom: "1rem" }}>Scan this QR code in WhatsApp</p>
              <img src={statusData.qrCode} alt="WhatsApp QR Code" style={{ display: "inline-block", border: "2px solid var(--black)", padding: "10px", background: "white" }} />
            </div>
          )}

          {statusData.status === "Connected" && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--yellow)", padding: "1rem", border: "2px solid var(--black)" }}>
              <span style={{ fontWeight: "bold" }}>Connected: {statusData.phoneNumber}</span>
              <button onClick={async () => { await logoutWhatsAppAction(); fetchStatus(); }} className="text-link" style={{ borderColor: "var(--red)", color: "var(--red)" }}>Disconnect</button>
            </div>
          )}
        </div>

        <div className="section-label" style={{ marginBottom: "2rem" }}>
          <span>04</span> Automated Welcome Message
        </div>

        <div className="form-shell" style={{ maxWidth: "600px", padding: "2.5rem", minHeight: "auto", boxShadow: "8px 8px 0 var(--navy)", marginBottom: "3rem" }}>
          <form action={welcomeMessageAction}>
            <div className="field field-wide" style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "1rem", marginBottom: "0.5rem" }}>
                <label htmlFor="welcome-message" style={{ margin: 0 }}>Message Content</label>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button type="button" onClick={() => insertPlaceholder('{{firstName}}', welcomeTextareaRef, welcomeText, setWelcomeText)} className="text-link" style={{ fontSize: "0.7rem", padding: "0.2rem 0" }}>+ First Name</button>
                  <button type="button" onClick={() => insertPlaceholder('{{lastName}}', welcomeTextareaRef, welcomeText, setWelcomeText)} className="text-link" style={{ fontSize: "0.7rem", padding: "0.2rem 0" }}>+ Last Name</button>
                  <button type="button" onClick={() => insertPlaceholder('{{ticketUrl}}', welcomeTextareaRef, welcomeText, setWelcomeText)} className="text-link" style={{ fontSize: "0.7rem", padding: "0.2rem 0" }}>+ Ticket URL</button>
                </div>
              </div>
              <textarea 
                id="welcome-message" 
                name="message" 
                ref={welcomeTextareaRef}
                value={welcomeText}
                onChange={(e) => setWelcomeText(e.target.value)}
                rows={4} 
                required 
                placeholder="Hi {{firstName}}, thanks for registering for MainQuest! We've sent your ticket and next steps to your email."
              ></textarea>
            </div>

            {welcomeMessageState?.error && (
              <div className="form-error-banner" style={{ color: "var(--red)", marginBottom: "1rem", fontWeight: "bold" }}>
                {welcomeMessageState.error}
              </div>
            )}
            
            {welcomeMessageState?.success && (
              <div className="form-error-banner" style={{ color: "var(--green)", marginBottom: "1rem", fontWeight: "bold" }}>
                {welcomeMessageState.success}
              </div>
            )}

            <button 
              className="button button-submit" 
              type="submit" 
              disabled={isUpdatingWelcome}
            >
              {isUpdatingWelcome ? "Saving..." : "Save Welcome Message"} ↗
            </button>
          </form>
        </div>

        <div className="section-label" style={{ marginBottom: "2rem" }}>
          <span>05</span> Batch Broadcast
        </div>

        <div className="form-shell" style={{ maxWidth: "600px", padding: "2.5rem", minHeight: "auto", boxShadow: "8px 8px 0 var(--navy)" }}>
          <form action={broadcastAction}>
            <fieldset className="field choice-field field-wide" style={{ marginBottom: "1.5rem" }}>
              <legend style={{ fontSize: "1rem" }}>Who should receive this broadcast?</legend>
              <div className="choice-row">
                <label>
                  <input type="radio" name="audience" value="marketing" required />
                  <span>Marketing Opt-ins</span>
                </label>
                <label>
                  <input type="radio" name="audience" value="all" required defaultChecked />
                  <span>All Registrants (Updates)</span>
                </label>
              </div>
            </fieldset>

            <div className="field field-wide" style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "1rem", marginBottom: "0.5rem" }}>
                <label htmlFor="message" style={{ margin: 0 }}>Message Content</label>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button type="button" onClick={() => insertPlaceholder('{{firstName}}', textareaRef, messageText, setMessageText)} className="text-link" style={{ fontSize: "0.7rem", padding: "0.2rem 0" }}>+ First Name</button>
                  <button type="button" onClick={() => insertPlaceholder('{{lastName}}', textareaRef, messageText, setMessageText)} className="text-link" style={{ fontSize: "0.7rem", padding: "0.2rem 0" }}>+ Last Name</button>
                  <button type="button" onClick={() => insertPlaceholder('{{ticketUrl}}', textareaRef, messageText, setMessageText)} className="text-link" style={{ fontSize: "0.7rem", padding: "0.2rem 0" }}>+ Ticket URL</button>
                </div>
              </div>
              <textarea 
                id="message" 
                name="message" 
                ref={textareaRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={6} 
                required 
                placeholder="Hi {{firstName}}, your MainQuest ticket is here: {{ticketUrl}}"
              ></textarea>
            </div>

            {broadcastState?.error && (
              <div className="form-error-banner" style={{ color: "var(--red)", marginBottom: "1rem", fontWeight: "bold" }}>
                {broadcastState.error}
              </div>
            )}
            
            {broadcastState?.success && (
              <div className="form-error-banner" style={{ color: "var(--green)", marginBottom: "1rem", fontWeight: "bold" }}>
                {broadcastState.success}
              </div>
            )}

            <button 
              className="button button-submit" 
              type="submit" 
              disabled={isBroadcasting || statusData.status !== "Connected"}
            >
              {isBroadcasting ? "Queueing Broadcast..." : "Send Blast"} ↗
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
