# Webintel
## Install in 5 seconds

```bash
npm install @acpro/webintel
```

---

## Example

```js
const Webintel = require("@acpro/webintel");

const client = new Webintel("YOUR_API_KEY");

await client.subscribe({
  url: "https://example.com/product",
  events: ["price_drop"]
});
```

## Install

```bash
npm install @acpro/webintel

Quick example:

const Webintel = require("@acpro/webintel");

const client = new Webintel("YOUR_API_KEY");

await client.subscribe({
  url: "https://example.com/product",
  events: ["price_drop"]
});

## Why this exists

Most tools either:

* return raw scraped data
* or trigger alerts on every minor change

Webintel focuses on:

→ meaningful events only
→ clean structured output
→ ready for automation


Real-time price and stock change detection — delivered as clean events.

Track competitor pricing, detect meaningful changes instantly, and trigger actions via API and webhooks.

---

## What this does

Instead of scraping pages or polling repeatedly, Webintel detects **only meaningful changes**:

* Price drops
* Price increases
* Back in stock
* Out of stock

You receive structured events when something actually matters.

---

## Example output

```json
{
  "event": "price_drop",
  "url": "https://example.com/product",
  "old_price": 120,
  "new_price": 95,
  "timestamp": "2026-04-20T10:00:00Z"
}
```

---

## Quick start

### 1. Create a monitor

```bash
curl -X POST https://api.webintel.io/v1/signals/subscribe \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/product",
    "events": ["price_drop", "price_increase", "back_in_stock", "out_of_stock"],
    "webhook_url": "https://yourapp.com/webhook"
  }'
```

Response:

```json
{
  "id": "monitor_123",
  "status": "active"
}
```

---

### 2. Receive events (webhook)

Your webhook will receive:

```json
{
  "event": "back_in_stock",
  "url": "https://example.com/product",
  "timestamp": "2026-04-20T10:00:00Z"
}
```

---

### 3. Act on it

Typical uses:

* Update pricing automatically
* Send alerts
* Trigger workflows
* Feed into AI agents

---

## API

### Base URL

```
https://api.webintel.io/v1
```

---

### Authentication

All requests require an API key:

```
Authorization: Bearer YOUR_API_KEY
```

---

### Endpoints

**Create monitor**

```
POST /signals/subscribe
```

```json
{
  "url": "https://example.com/product",
  "events": ["price_drop", "back_in_stock"],
  "webhook_url": "https://yourapp.com/webhook"
}
```

---

**List monitors**

```
GET /signals
```

---

**Delete monitor**

```
DELETE /signals/{id}
```

---

## Code examples

### Node.js

```js
const fetch = require("node-fetch");

fetch("https://api.webintel.io/v1/signals/subscribe", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    url: "https://example.com/product",
    events: ["price_drop", "back_in_stock"]
  })
})
.then(res => res.json())
.then(console.log);
```

---

### Python

```python
import requests

url = "https://api.webintel.io/v1/signals/subscribe"

headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

data = {
    "url": "https://example.com/product",
    "events": ["price_drop", "back_in_stock"]
}

response = requests.post(url, json=data, headers=headers)

print(response.json())
```

---

## Webhook example (Node.js)

```js
const express = require("express");
const app = express();

app.use(express.json());

app.post("/webhook", (req, res) => {
  const event = req.body;

  console.log("Received:", event);

  if (event.event === "price_drop") {
    console.log(`Price dropped: ${event.old_price} → ${event.new_price}`);
  }

  if (event.event === "back_in_stock") {
    console.log("Back in stock:", event.url);
  }

  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("Webhook running on port 3000");
});
```

---

## Supported events

* price_drop
* price_increase
* back_in_stock
* out_of_stock

---

## Errors

* 400 — invalid request
* 401 — invalid API key
* 429 — rate limit exceeded
* 500 — server error

---

## Rate limits

* ~60 requests per minute per API key
* Short bursts allowed

---

## Retry strategy

* Retry up to 3 times
* Use exponential backoff (1s → 2s → 4s)
* Handle 429 and 5xx errors

---

## Best practices

* Use webhooks instead of polling
* Subscribe only to relevant events
* Avoid duplicate monitors
* Store monitor IDs

---

## Scaling

* Batch monitor creation
* Queue webhook processing
* Ensure idempotent handlers

---

## Integrations

* n8n → trigger workflows via webhook
* Zapier → connect to other tools
* LangChain → feed events into AI agents

---

## Mental model

Instead of:

"Something on the page changed"

You get:

"Price dropped from £120 → £95"

---

## Status

Early-stage, actively improving.

---

## Try it

https://webintel.io
