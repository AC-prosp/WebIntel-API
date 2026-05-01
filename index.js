const express = require("express");
const cors = require("cors");
require("dotenv").config();
const Stripe = require("stripe");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

const app = express();
app.use(cors());
app.use(express.json());

const apiKeys = {};

// Load API keys from database into memory on startup
async function loadApiKeys() {
  const result = await pool.query(`
    CREATE TABLE IF NOT EXISTS api_keys (
      key TEXT PRIMARY KEY,
      customer_id TEXT,
      plan TEXT DEFAULT 'pay_per_signal',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  const keys = await pool.query(`SELECT * FROM api_keys`);
  keys.rows.forEach(row => {
    apiKeys[row.key] = { customerId: row.customer_id, plan: row.plan };
  });
  // Always keep test key available
  apiKeys["test_key_123"] = { customerId: null, plan: "pay_per_signal" };
  console.log(`Loaded ${keys.rows.length} API keys from database`);
}

// Create tables if they don't exist
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS monitors (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      events TEXT[],
      webhook_url TEXT,
      status TEXT DEFAULT 'active',
      api_key TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log("Database ready");
  await loadApiKeys();
}

function requireApiKey(req, res, next) {
  const auth = req.headers["authorization"];
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing API key" });
  }
  const key = auth.replace("Bearer ", "").trim();
  if (!apiKeys[key]) {
    return res.status(401).json({ error: "Invalid API key" });
  }
  req.apiKey = key;
  req.keyData = apiKeys[key];
  next();
}

app.get("/", (req, res) => {
  res.json({ status: "Webintel API is running" });
});
// Generate a new API key
app.post("/v1/keys/generate", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }
  try {
    // Create a Stripe customer
    const customer = await getStripe().customers.create({ email });

    // Create a Stripe subscription for pay-per-signal
    await getStripe().subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env.STRIPE_PRICE_ID }],
    });

    // Generate API key and store with Stripe customer ID
    const key = "wi_" + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);
    await pool.query(
      `INSERT INTO api_keys (key, customer_id, plan) VALUES ($1, $2, $3)`,
      [key, customer.id, "pay_per_signal"]
    );
    apiKeys[key] = { customerId: customer.id, plan: "pay_per_signal" };
    res.json({ api_key: key, plan: "pay_per_signal", email });
  } catch (err) {
    console.error("Full Stripe error:", JSON.stringify(err));
    res.status(500).json({ error: err.message });
  }
});
app.post("/v1/signals/subscribe", requireApiKey, async (req, res) => {
  const { url, events, webhook_url } = req.body;
  if (!url || !events) {
    return res.status(400).json({ error: "url and events are required" });
  }
  const id = "monitor_" + Math.random().toString(36).substr(2, 9);
  await pool.query(
    `INSERT INTO monitors (id, url, events, webhook_url, api_key) VALUES ($1, $2, $3, $4, $5)`,
    [id, url, events, webhook_url, req.apiKey]
  );
  res.json({ id, status: "active" });
});

app.get("/v1/signals", requireApiKey, async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM monitors WHERE api_key = $1`,
    [req.apiKey]
  );
  res.json(result.rows);
});

app.delete("/v1/signals/:id", requireApiKey, async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    `DELETE FROM monitors WHERE id = $1 AND api_key = $2 RETURNING *`,
    [id, req.apiKey]
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Monitor not found" });
  }
  res.json({ deleted: true });
});

app.post("/v1/signals/record", requireApiKey, async (req, res) => {
  const { monitor_id, event } = req.body;
  if (!monitor_id || !event) {
    return res.status(400).json({ error: "monitor_id and event are required" });
  }
  try {
    const customerId = req.keyData.customerId;
    if (customerId) {
      await getStripe().billing.meterEvents.create({
        event_name: "webintel_signal",
        payload: {
          stripe_customer_id: customerId,
          value: "1",
        },
      });
    }
    res.json({
      recorded: true,
      monitor_id,
      event,
      timestamp: new Date().toISOString(),
      billed: !!customerId,
    });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: "Failed to record signal" });
  }
});

app.post("/v1/billing/subscribe", requireApiKey, async (req, res) => {
  const { price_id, success_url, cancel_url } = req.body;
  if (!price_id || !success_url || !cancel_url) {
    return res.status(400).json({ error: "price_id, success_url and cancel_url are required" });
  }
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: price_id, quantity: 1 }],
      success_url,
      cancel_url,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

const PORT = process.env.PORT || 3000;
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Webintel API running on port ${PORT}`);
  });
});