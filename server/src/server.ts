import express from "express";
import cors from "cors";
import fs from "fs";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
console.log("[Auth] Server started. Expected Google Client ID (aud):", process.env.GOOGLE_CLIENT_ID);

// Load JSON DB
let USERS: any[] = [];
if (fs.existsSync("users.json")) {
  USERS = JSON.parse(fs.readFileSync("users.json", "utf8"));
}

// Handle Google Login
app.post("/google-login", async (req, res) => {
  const { credential } = req.body || {};

  if (!credential) {
    console.error("[Auth] Missing credential in request body");
    return res.status(400).json({ error: "Missing credential" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const email = payload?.email;

    console.log("[Auth] Token verified:", {
      iss: payload?.iss,
      aud: payload?.aud,
      email: email,
      email_verified: payload?.email_verified
    });

    if (!email) {
      return res.status(400).json({ error: "No email in Google token" });
    }

    // Restrict to RIT Google accounts
    if (!/@(rit\.edu|g\.rit\.edu)$/i.test(email)) {
      return res.status(403).json({
        error: "Only @rit.edu or @g.rit.edu emails are allowed"
      });
    }

    return res.json({ email });
  } catch (err: any) {
    console.error("[Auth] verifyIdToken error:", err?.message || err);
    return res.status(400).json({ error: `Google authentication failed: ${err?.message || "unknown error"}` });
  }
});

// Create local app account
app.post("/create-account", (req, res) => {
  const { googleEmail, username, password } = req.body;

  USERS.push({ googleEmail, username, password });
  fs.writeFileSync("users.json", JSON.stringify(USERS, null, 2));

  res.json({ success: true });
});

app.listen(4000, () => console.log("Backend running on port 4000"));
