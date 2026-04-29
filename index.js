const express = require("express");
const cors = require("cors");
require("dotenv").config();
const Stripe = require("stripe");

const app = express();
app.use(cors());
app.use(express.json());

// In-memory store
const monitors = {};
const apiKeys = {
  "test_key_123": { customerId: null, plan: "pay_per_signal" }
};

// Middleware to check API key
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

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Webintel API is running" });
});

// Create a monitor
app.post("/v1/signals/subscribe", requireApiKey, (req, res) => {
  const { url, events, webhook_url } = req.body;
  if (!url || !events) {
    return res.status(400).json({ error: "url and events are required" });
  }
  const id = "monitor_" + Math.random().toString(36).substr(2, 9);
  monitors[id] = {
    id,
    url,
    events,
    webhook_url,
    status: "active",
    created_at: new Date().toISOString(),
    apiKey: req.apiKey,
  };
  res.json({ id, status: "active" });
});

// List monitors
app.get("/v1/signals", requireApiKey, (req, res) => {
  const userMonitors = Object.values(monitors).filter(
    (m) => m.apiKey === req.apiKey
  );
  res.json(userMonitors);
});

// Delete a monitor
app.delete("/v1/signals/:id", requireApiKey, (req, res) => {
  const { id } = req.params;
  if (!monitors[id]) {
    return res.status(404).json({ error: "Monitor not found" });
  }
  delete monitors[id];
  res.json({ deleted: true });
});

// Record a signal and bill the customer
app.post("/v1/signals/record", requireApiKey, async (req, res) => {
  const { monitor_id, event } = req.body;
  if (!monitor_id || !event) {
    return res.status(400).json({ error: "monitor_id and event are required" });
  }

  try {
    const customerId = req.keyData.customerId;

    if (customerId) {
      // Bill $0.003 per signal (300 cents = $3, so 0.3 cents = use amount 1 at $0.003)
      await stripe.billing.meterEvents.create({
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

// Create a Stripe checkout session for subscription
app.post("/v1/billing/subscribe", requireApiKey, async (req, res) => {
  const { price_id, success_url, cancel_url } = req.body;
  if (!price_id || !success_url || !cancel_url) {
    return res.status(400).json({ error: "price_id, success_url and cancel_url are required" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
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
app.listen(PORT, () => {
  console.log(`Webintel API running on port ${PORT}`);
});