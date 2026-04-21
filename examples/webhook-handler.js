// Example: Receive and handle Webintel price change events

// Simple Express server to receive webhook events

const express = require("express");
const app = express();

app.use(express.json());

// Webhook endpoint
app.post("/webhook", (req, res) => {
  const event = req.body;

  console.log("Received event:", event);

  // Example handling logic
  if (event.event === "price_drop") {
    console.log(
      `Price dropped from ${event.old_price} to ${event.new_price} on ${event.url}`
    );

    // Example: trigger action
    // You could update your pricing, send a notification, etc.
  }

  if (event.event === "stock_change") {
    console.log(`Stock status changed for ${event.url}`);
  }

  // Always respond quickly
  res.status(200).send("OK");
});

// Start server
app.listen(3000, () => {
  console.log("Webhook server running on http://localhost:3000");
});
