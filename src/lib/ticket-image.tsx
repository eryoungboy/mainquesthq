import { ImageResponse } from "next/og";
import React from "react";

export async function generateTicketImage(firstName: string, lastName: string, referenceId: string, qrCodeDataUri: string) {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "400px",
          height: "650px",
          backgroundColor: "#ffffff",
          border: "4px solid #000000",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            right: -8,
            width: "8px",
            height: "100%",
            backgroundColor: "#FF3333", // Red shadow edge
          }}
        />
        {/* Top Yellow Section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#FFD747",
            padding: "24px",
            borderBottom: "2px solid #000000",
          }}
        >
          <div style={{ display: "flex", color: "#FF3333", fontSize: "12px", fontWeight: "bold", letterSpacing: "2px", marginBottom: "16px" }}>
            MAINQUEST / 01
          </div>
          <div style={{ display: "flex", height: "2px", backgroundColor: "#FF3333", opacity: 0.3, width: "100%", marginBottom: "16px" }} />
          <div style={{ display: "flex", fontSize: "28px", fontWeight: 900, textTransform: "uppercase", color: "#000000", marginBottom: "16px", lineHeight: 1.1 }}>
            {firstName} {lastName}
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: "14px", fontWeight: "bold", color: "#000000", letterSpacing: "1px" }}>
            <span>REF:</span>
            <span>{referenceId}</span>
          </div>
        </div>

        {/* Details Section */}
        <div style={{ display: "flex", flexDirection: "column", padding: "24px", backgroundColor: "#ffffff" }}>
          <div style={{ display: "flex", borderBottom: "1px solid #e0e0e0", paddingBottom: "12px", marginBottom: "12px" }}>
            <div style={{ display: "flex", width: "80px", color: "#FF3333", fontSize: "12px", fontWeight: "bold", letterSpacing: "1px" }}>DATE</div>
            <div style={{ display: "flex", fontSize: "16px", fontWeight: "bold", color: "#000000" }}>October 31, 2026</div>
          </div>
          <div style={{ display: "flex", borderBottom: "1px solid #e0e0e0", paddingBottom: "12px", marginBottom: "12px" }}>
            <div style={{ display: "flex", width: "80px", color: "#FF3333", fontSize: "12px", fontWeight: "bold", letterSpacing: "1px" }}>TIME</div>
            <div style={{ display: "flex", fontSize: "16px", fontWeight: "bold", color: "#000000" }}>11:00 AM EST</div>
          </div>
          <div style={{ display: "flex", borderBottom: "2px dashed #000000", paddingBottom: "24px", marginBottom: "24px" }}>
            <div style={{ display: "flex", width: "80px", color: "#FF3333", fontSize: "12px", fontWeight: "bold", letterSpacing: "1px" }}>VENUE</div>
            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#000000", display: "flex", flexDirection: "column" }}>
              <span>The Foundry</span>
              <span>101 Rogers St</span>
              <span>Cambridge, MA 02142</span>
            </div>
          </div>

          {/* QR Code Section */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 10px" }}>
            <div style={{ display: "flex", flexDirection: "column", fontSize: "12px", fontWeight: 900, letterSpacing: "1px", color: "#000000", lineHeight: 1.4 }}>
              <span>PRESENT</span>
              <span>THIS</span>
              <span>CODE</span>
              <span>UPON</span>
              <span>ARRIVAL</span>
            </div>
            <img src={qrCodeDataUri} width={160} height={160} style={{ border: "4px solid #000000" }} />
          </div>
        </div>
      </div>
    ),
    {
      width: 400,
      height: 650,
    }
  );
}
