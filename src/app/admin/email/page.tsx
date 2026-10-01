"use client";

import { useState, useActionState, useRef } from "react";
import Link from "next/link";
import { signOutAction } from "../actions";
import { sendEmailBroadcastAction } from "@/app/admin/email/actions";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false, loading: () => <p>Loading editor...</p> }) as any;

export default function EmailBroadcastPage() {
  const [broadcastState, broadcastAction, isBroadcasting] = useActionState(sendEmailBroadcastAction, undefined as any);
  const [messageHtml, setMessageHtml] = useState("");
  const quillRef = useRef<any>(null);

  const insertPlaceholder = (placeholder: string) => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection();
      let position = range ? range.index : editor.getLength();
      editor.insertText(position, placeholder);
      editor.setSelection(position + placeholder.length);
    } else {
      setMessageHtml(prev => prev + placeholder);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--cream)" }}>
      <header className="site-header" style={{ background: "var(--black)", color: "var(--white)", padding: "1rem var(--pad)" }}>
        <Link href="/admin" className="logo logo-light" aria-label="MainQuest Admin">
          <span>Admin</span>
          <span className="logo-accent" style={{ color: "var(--yellow)" }}>Dashboard</span>
          <i aria-hidden="true" style={{ background: "var(--red)" }}></i>
        </Link>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <Link href="/admin" className="text-link" style={{ color: "var(--white)", borderColor: "transparent" }}>Registrations</Link>
          <Link href="/admin/broadcast" className="text-link" style={{ color: "var(--white)", borderColor: "transparent" }}>WhatsApp Blast</Link>
          <Link href="/admin/email" className="text-link" style={{ color: "var(--yellow)", borderColor: "var(--yellow)" }}>Email Blast</Link>
          <form action={signOutAction} style={{ display: "inline-block" }}>
            <button type="submit" className="text-link" style={{ color: "var(--white)", borderColor: "transparent" }}>Sign out</button>
          </form>
        </div>
      </header>

      <main style={{ flex: 1, padding: "clamp(2rem, 5vw, 4rem) var(--pad)" }}>
        <div className="section-label" style={{ marginBottom: "2rem" }}>
          <span>05</span> Email Marketing Blast
        </div>

        <div className="form-shell" style={{ maxWidth: "800px", padding: "2.5rem", minHeight: "auto", boxShadow: "8px 8px 0 var(--navy)" }}>
          <form action={broadcastAction}>
            <input type="hidden" name="messageHtml" value={messageHtml} />
            
            <fieldset className="field choice-field field-wide" style={{ marginBottom: "1.5rem" }}>
              <legend style={{ fontSize: "1rem" }}>Who should receive this email?</legend>
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
              <label htmlFor="emailSubject">Email Subject</label>
              <input id="emailSubject" name="emailSubject" type="text" placeholder="e.g., Get ready for MainQuest!" required />
            </div>

            <div className="field field-wide" style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "1rem", marginBottom: "0.5rem" }}>
                <label style={{ margin: 0 }}>Rich Text Editor</label>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button type="button" onClick={() => insertPlaceholder('{{firstName}}')} className="text-link" style={{ fontSize: "0.7rem", padding: "0.2rem 0" }}>+ First Name</button>
                  <button type="button" onClick={() => insertPlaceholder('{{lastName}}')} className="text-link" style={{ fontSize: "0.7rem", padding: "0.2rem 0" }}>+ Last Name</button>
                  <button type="button" onClick={() => insertPlaceholder('{{ticketUrl}}')} className="text-link" style={{ fontSize: "0.7rem", padding: "0.2rem 0" }}>+ Ticket URL</button>
                </div>
              </div>
              <div style={{ background: "var(--white)", border: "2px solid var(--black)", overflow: "hidden" }}>
                {/* @ts-ignore - ReactQuill dynamic import ref issue */}
                <ReactQuill 
                  ref={quillRef}
                  theme="snow" 
                  value={messageHtml} 
                  onChange={setMessageHtml} 
                  style={{ minHeight: "350px", border: "none" }}
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                      [{'list': 'ordered'}, {'list': 'bullet'}],
                      ['link', 'image', 'video'],
                      ['clean']
                    ],
                  }}
                />
              </div>
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

            <button className="button button-submit" type="submit" disabled={isBroadcasting}>
              {isBroadcasting ? "Queueing Emails..." : "Send Email Blast"} ↗
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
