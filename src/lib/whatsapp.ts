export class WhatsAppClient {
  private baseUrl: string;
  private apiKey: string;
  private sessionName = "mainquest";

  constructor() {
    this.baseUrl = process.env.OPEN_WA_URL || "";
    this.apiKey = process.env.OPEN_WA_API_KEY || "";
  }

  private async fetchOpenWa(endpoint: string, options: RequestInit = {}) {
    if (!this.baseUrl) {
      throw new Error("OPEN_WA_URL is not configured");
    }
    const url = `${this.baseUrl.replace(/\/$/, "")}${endpoint}`;
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "User-Agent": "MainQuest/1.0",
          Accept: "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorText = "";
        try {
          errorText = await response.text();
        } catch (e) {}
        throw new Error(`Open-WA API Error: ${response.status} - ${errorText.slice(0, 200)}`);
      }

      const text = await response.text();
      try { return JSON.parse(text); } catch (e) { return text; }
    } catch (error) {
      console.error(`Error connecting to Open-WA at ${url}:`, error);
      throw error;
    }
  }

  private async getRawSession(): Promise<any | null> {
    try {
      const sessions = await this.fetchOpenWa("/api/sessions");
      const existing = sessions.find((s: any) => s.name === this.sessionName);
      return existing || null;
    } catch (err) {
      console.error("Failed to fetch sessions from Open-WA", err);
      return null;
    }
  }

  async connect(): Promise<{ success: boolean; error?: string }> {
    try {
      let session = await this.getRawSession();
      if (!session) {
        session = await this.fetchOpenWa("/api/sessions", {
          method: "POST",
          body: JSON.stringify({ name: this.sessionName }),
        });
      }

      if (["created", "disconnected", "failed"].includes(session.status)) {
        try {
          await this.fetchOpenWa(`/api/sessions/${session.id}/start`, { method: "POST" });
        } catch (e: any) {}
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to start session" };
    }
  }

  async getStatusAndQR(): Promise<{ status: string; qrCode?: string | null; phoneNumber?: string | null }> {
    try {
      const session = await this.getRawSession();
      if (!session) return { status: "Disconnected", qrCode: null, phoneNumber: null };

      const rawStatus = session.status;
      let displayStatus = "Disconnected";
      
      if (rawStatus === "ready") displayStatus = "Connected";
      else if (rawStatus === "qr_ready") displayStatus = "Waiting for QR Scan";
      else if (["initializing", "authenticating", "created"].includes(rawStatus)) displayStatus = "Connecting";
      else if (rawStatus === "failed") displayStatus = "Failed";
      
      let qrCode = null;
      if (rawStatus === "qr_ready") {
        try {
          const res = await this.fetchOpenWa(`/api/sessions/${session.id}/qr`);
          qrCode = res.qrCode || null;
        } catch (e) {}
      }

      return {
        status: displayStatus,
        qrCode,
        phoneNumber: rawStatus === "ready" ? session.phone : null,
      };
    } catch (error: any) {
      return { status: "Disconnected", qrCode: null, phoneNumber: null };
    }
  }

  async logout(): Promise<boolean> {
    try {
      const session = await this.getRawSession();
      if (!session) return false;
      await this.fetchOpenWa(`/api/sessions/${session.id}`, { method: "DELETE" });
      return true;
    } catch (err) {
      return false;
    }
  }

  async sendText(phone: string, text: string): Promise<{ success: boolean; error?: string }> {
    try {
      const session = await this.getRawSession();
      if (!session || session.status !== "ready") {
        return { success: false, error: "WhatsApp is not connected." };
      }
      
      const normalizedPhone = phone.replace(/[^0-9]/g, "");
      let chatId = `${normalizedPhone}@c.us`;

      await this.fetchOpenWa(`/api/sessions/${session.id}/messages/send-text`, {
        method: "POST",
        body: JSON.stringify({ chatId, text }),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const whatsappClient = new WhatsAppClient();
