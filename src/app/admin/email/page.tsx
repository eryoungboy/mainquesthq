"use client";

import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { signOutAction } from "../actions";
import { sendEmailBroadcastAction, sendTestEmailAction } from "@/app/admin/email/actions";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false, loading: () => <p>Loading editor...</p> }) as any;

export default function EmailBroadcastPage() {
  const [emailSubject, setEmailSubject] = useState("");
  const [messageHtml, setMessageHtml] = useState("");
  const [audience, setAudience] = useState<"marketing" | "all">("all");
  const [testEmail, setTestEmail] = useState("getclearwithdivine@gmail.com");

  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<{ success?: string; error?: string } | null>(null);

  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState<{ success?: string; error?: string } | null>(null);

  const quillRef = useRef<any>(null);

  const getLiveHtml = () => {
    if (quillRef.current) {
      try {
        const editor = quillRef.current.getEditor();
        return editor.root.innerHTML;
      } catch (e) {
        // Fallback to state
      }
    }
    return messageHtml;
  };

  const insertPlaceholder = (placeholder: string) => {
    if (quillRef.current) {
      try {
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection();
        const position = range ? range.index : editor.getLength();
        editor.insertText(position, placeholder);
        editor.setSelection(position + placeholder.length);
        const html = editor.root.innerHTML;
        setMessageHtml(html);
        return;
      } catch (e) {
        // Fallback
      }
    }
    setMessageHtml(prev => prev + placeholder);
  };

  const insertFlyer = () => {
    const flyerUrl = "https://mainquesthq.com/og-image.jpg";
    if (quillRef.current) {
      try {
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection();
        const position = range ? range.index : editor.getLength();
        editor.insertEmbed(position, "image", flyerUrl);
        editor.setSelection(position + 1);
        const html = editor.root.innerHTML;
        setMessageHtml(html);
        return;
      } catch (e) {
        // Fallback
      }
    }
    setMessageHtml(prev => prev + `<p><img src="${flyerUrl}" alt="MainQuest Flyer" /></p>`);
  };

  const insertImageUrl = () => {
    const url = window.prompt("Enter hosted image URL (e.g. https://mainquesthq.com/og-image.jpg):", "https://mainquesthq.com/og-image.jpg");
    if (!url || !url.trim().startsWith("http")) return;
    if (quillRef.current) {
      try {
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection();
        const position = range ? range.index : editor.getLength();
        editor.insertEmbed(position, "image", url.trim());
        editor.setSelection(position + 1);
        const html = editor.root.innerHTML;
        setMessageHtml(html);
        return;
      } catch (e) {
        // Fallback
      }
    }
    setMessageHtml(prev => prev + `<p><img src="${url.trim()}" alt="Image" /></p>`);
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: insertImageUrl
      }
    }
  }), []);

  const handleSendTest = async (e: React.MouseEvent) => {
    e.preventDefault();
    setTestStatus(null);

    const email = testEmail.trim();
    if (!email || !email.includes("@")) {
      setTestStatus({ error: "Please enter a valid test email address." });
      return;
    }

    const liveHtml = getLiveHtml();
    setMessageHtml(liveHtml);

    if (!liveHtml || liveHtml === "<p><br></p>" || liveHtml.trim() === "") {
      setTestStatus({ error: "Please write email content before sending a test." });
      return;
    }

    if (!emailSubject.trim()) {
      setTestStatus({ error: "Please enter an email subject before sending a test." });
      return;
    }

    setIsTesting(true);
    try {
      const formData = new FormData();
      formData.append("testEmail", email);
      formData.append("emailSubject", emailSubject.trim());
      formData.append("messageHtml", liveHtml);

      const res = await sendTestEmailAction(null, formData);
      setTestStatus(res);
    } catch (err: any) {
      setTestStatus({ error: err.message || "Failed to send test email." });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastStatus(null);

    const liveHtml = getLiveHtml();
    setMessageHtml(liveHtml);

    if (!liveHtml || liveHtml === "<p><br></p>" || liveHtml.trim() === "") {
      setBroadcastStatus({ error: "Please write email content before sending." });
      return;
    }

    if (!emailSubject.trim()) {
      setBroadcastStatus({ error: "Please enter an email subject." });
      return;
    }

    const audienceLabel = audience === "marketing" ? "Marketing Opt-ins" : "All Registrants";
    const confirmed = window.confirm(`Are you sure you want to send this broadcast email to "${audienceLabel}"?`);
    if (!confirmed) return;

    setIsBroadcasting(true);
    try {
      const formData = new FormData();
      formData.append("audience", audience);
      formData.append("emailSubject", emailSubject.trim());
      formData.append("messageHtml", liveHtml);

      const res = await sendEmailBroadcastAction(null, formData);
      setBroadcastStatus(res);
    } catch (err: any) {
      setBroadcastStatus({ error: err.message || "An unexpected error occurred while sending." });
    } finally {
      setIsBroadcasting(false);
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
          <form onSubmit={handleSendBroadcast} method="POST">
            <div className="field field-wide" style={{ marginBottom: "1.5rem" }}>
              <label htmlFor="emailSubject">Email Subject</label>
              <input 
                id="emailSubject" 
                name="emailSubject" 
                type="text" 
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="e.g., Get ready for MainQuest!" 
                required 
              />
            </div>

            <div className="field field-wide" style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "1rem", marginBottom: "0.5rem" }}>
                <label style={{ margin: 0 }}>Rich Text Editor</label>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button type="button" onClick={() => insertPlaceholder('{{firstName}}')} className="text-link" style={{ fontSize: "0.7rem", padding: "0.2rem 0" }}>+ First Name</button>
                  <button type="button" onClick={() => insertPlaceholder('{{lastName}}')} className="text-link" style={{ fontSize: "0.7rem", padding: "0.2rem 0" }}>+ Last Name</button>
                  <button type="button" onClick={() => insertPlaceholder('{{ticketUrl}}')} className="text-link" style={{ fontSize: "0.7rem", padding: "0.2rem 0" }}>+ Ticket URL</button>
                  <button 
                    type="button" 
                    onClick={insertFlyer} 
                    className="text-link" 
                    style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", color: "var(--white)", background: "var(--red)", borderRadius: "3px", textDecoration: "none" }}
                  >
                    🖼️ + Insert Event Flyer
                  </button>
                </div>
              </div>

              <div style={{ background: "var(--white)", border: "2px solid var(--black)", overflow: "hidden" }}>
                <style dangerouslySetInnerHTML={{ __html: `.ql-editor img { max-width: 100%; height: auto; display: block; margin: 16px auto; border-radius: 4px; border: 1px solid #000; box-shadow: 4px 4px 0px #000; }` }} />
                {/* @ts-ignore - ReactQuill dynamic import ref */}
                <ReactQuill 
                  ref={quillRef}
                  theme="snow" 
                  value={messageHtml} 
                  onChange={setMessageHtml} 
                  style={{ minHeight: "350px", border: "none" }}
                  modules={modules}
                />
              </div>
              <p style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.5rem", marginBottom: 0 }}>
                💡 <strong>Tip:</strong> Click <strong>+ Insert Event Flyer</strong> to embed the official poster into your email. Images in emails must use web links (Base64 file uploads are blocked by Gmail/Outlook).
              </p>
            </div>

            {/* TEST EMAIL CARD */}
            <div style={{ background: "#fdf8ee", border: "2px dashed var(--black)", padding: "1.25rem", marginBottom: "2rem" }}>
              <strong style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.95rem" }}>
                Send a Test Email (Preview in Inbox)
              </strong>
              <p style={{ fontSize: "0.85rem", color: "#555", margin: "0 0 1rem 0" }}>
                Send a preview to your own email address to check the layout and flyer formatting before blasting all recipients.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                <input 
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="admin@example.com"
                  style={{ flex: "1 1 240px", padding: "0.6rem 0.8rem", border: "2px solid var(--black)", background: "var(--white)" }}
                />
                <button 
                  type="button" 
                  onClick={handleSendTest}
                  disabled={isTesting || isBroadcasting}
                  className="button"
                  style={{ background: "var(--navy)", color: "var(--white)", padding: "0.6rem 1.2rem", fontSize: "0.85rem", cursor: "pointer" }}
                >
                  {isTesting ? "Sending Test..." : "Send Test Email"}
                </button>
              </div>

              {testStatus?.error && (
                <div style={{ color: "var(--red)", marginTop: "0.75rem", fontWeight: "bold", fontSize: "0.85rem" }}>
                  ⚠️ {testStatus.error}
                </div>
              )}
              {testStatus?.success && (
                <div style={{ color: "var(--green)", marginTop: "0.75rem", fontWeight: "bold", fontSize: "0.85rem" }}>
                  ✅ {testStatus.success}
                </div>
              )}
            </div>

            {/* AUDIENCE SELECTOR */}
            <fieldset className="field choice-field field-wide" style={{ marginBottom: "1.5rem" }}>
              <legend style={{ fontSize: "1rem" }}>Who should receive this broadcast?</legend>
              <div className="choice-row">
                <label>
                  <input 
                    type="radio" 
                    name="audience" 
                    value="marketing" 
                    checked={audience === "marketing"}
                    onChange={() => setAudience("marketing")}
                  />
                  <span>Marketing Opt-ins</span>
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="audience" 
                    value="all" 
                    checked={audience === "all"}
                    onChange={() => setAudience("all")}
                  />
                  <span>All Registrants (Updates)</span>
                </label>
              </div>
            </fieldset>

            {broadcastStatus?.error && (
              <div className="form-error-banner" style={{ color: "var(--red)", marginBottom: "1rem", fontWeight: "bold" }}>
                ⚠️ {broadcastStatus.error}
              </div>
            )}
            
            {broadcastStatus?.success && (
              <div className="form-error-banner" style={{ color: "var(--green)", marginBottom: "1rem", fontWeight: "bold" }}>
                ✅ {broadcastStatus.success}
              </div>
            )}

            <button 
              className="button button-submit" 
              type="submit" 
              disabled={isBroadcasting || isTesting}
            >
              {isBroadcasting ? "Sending Broadcast..." : "Send Email Blast"} ↗
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
