const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// In-memory store
const monitors = {};
const apiKeys = new Set(["test_key_123"]); // we'll replace this with a database later

// Middleware to check API key
function requireApiKey(req, res, next) {
  const auth = req.headers["authorization"];
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing API key" });
  }
  const key = auth.replace("Bearer ", "").trim();
  if (!apiKeys.has(key)) {
    return res.status(401).json({ error: "Invalid API key" });
  }
  next();
}

// Health check (no auth needed)
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
  };
  res.json({ id, status: "active" });
});

// List all monitors
app.get("/v1/signals", requireApiKey, (req, res) => {
  res.json(Object.values(monitors));
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webintel API running on port ${PORT}`);
});