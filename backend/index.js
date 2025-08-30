require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const axios = require("axios");

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 3000;
const ZALO_APP_ID = process.env.ZALO_APP_ID; 
const REDIRECT_URI = "http://localhost:3000/auth/zalo/callback"; 

const b64url = (buf) =>
  buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

function createPkce() {
  const codeVerifier = b64url(crypto.randomBytes(32));
  const challenge = crypto.createHash("sha256").update(codeVerifier).digest();
  const codeChallenge = b64url(challenge);
  return { codeVerifier, codeChallenge };
}

app.get("/", (_req, res) => res.send("Hello World!"));

app.get("/auth/zalo", (req, res) => {
  const state = b64url(crypto.randomBytes(16));
  const { codeVerifier, codeChallenge } = createPkce();

  
  const cookieOpts = { httpOnly: true, sameSite: "lax", maxAge: 5 * 60 * 1000 };
  res.cookie("zalo_state", state, cookieOpts);
  res.cookie("zalo_cv", codeVerifier, cookieOpts);

  const params = new URLSearchParams({
    app_id: ZALO_APP_ID,
    redirect_uri: REDIRECT_URI,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const authorizeUrl = `https://oauth.zaloapp.com/v4/permission?${params.toString()}`;
  res.redirect(authorizeUrl);
});

app.get("/auth/zalo/callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    const expectedState = req.cookies?.zalo_state;
    const codeVerifier = req.cookies?.zalo_cv;

    if (!code || !state || state !== expectedState || !codeVerifier) {
      return res.status(400).send("Invalid state or missing code.");
    }

    const tokenUrl = "https://oauth.zaloapp.com/v4/access_token";

    const body = new URLSearchParams({
      app_id: ZALO_APP_ID,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    });

    const { data } = await axios.post(tokenUrl, body.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    console.log("Zalo OAuth Success:", data);
    res.send(`Zalo connected! Tokens: ${JSON.stringify(data)}`);
    res.redirect("/?status=success");

  } catch (e) {
    console.error(e?.response?.data || e.message);
    res.status(500).send("Failed to connect Zalo.");
    res.redirect(`/?status=error&reason=${encodeURIComponent('Token exchange failed')}`);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
