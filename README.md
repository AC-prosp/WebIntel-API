# WebIntel-API
Detect website changes, extract data, and evaluate content in a single API.
## 🚀 What it does

WebIntel API lets you:

* Monitor website changes
* Extract structured data (price, company, emails, etc.)
* Score how fresh or outdated content is

No scraping setup. No infrastructure.

## ⚡ Quick Start

### 1. Get your API key

Visit: https://webintel.io

Free credits included.

---

### 2. Make a request

POST /run-task

```json
{
  "api_key": "your_api_key",
  "task": "detect_change",
  "payload": {
    "url": "https://example.com"
  }
}
```

---

### 3. Example response

```json
{
  "success": true,
  "task": "detect_change",
  "data": {
    "changed": true,
    "summary": "Pricing updated"
  },
  "credits_used": 1,
  "credits_remaining": 99
}
```

---

## 🧠 Supported Tasks

### detect_change

Checks if a webpage has changed.

---

### extract_data

Extract structured fields from a page.

```json
{
  "task": "extract_data",
  "payload": {
    "url": "https://example.com",
    "fields": ["price", "company"]
  }
}
```

---

### freshness_score

Evaluates how up-to-date content is.

---

## 🧪 Try it instantly (no code)

Use the UI:
https://yourdomain.com/try-api

* Enter API key
* Enter URL
* Select task
* Get result instantly

---

## 💰 Pricing

* Free: 100 credits
* Pay-as-you-go (no subscription)

Example:

* 1,000 credits → £10
* 5,000 credits → £30
* 20,000 credits → £79

---

## 📦 Batch Requests

Run multiple tasks in one call:

```json
{
  "api_key": "your_api_key",
  "tasks": [
    { "task": "detect_change", "payload": { "url": "..." } },
    { "task": "extract_data", "payload": { "url": "...", "fields": ["price"] } }
  ]
}
```

---

## ❌ Errors

```json
{ "error": "invalid_api_key" }
```

```json
{ "error": "no_credits" }
```

---

## 🧠 Why use WebIntel?

Instead of building:

* scrapers
* diffing logic
* parsing systems

Use one API.

---

## 🔗 Links

* Docs: https://yourdomain.com/docs
* Get API Key: https://yourdomain.com/get-api-key
* Try UI: https://yourdomain.com/try-api

---

## 💡 Use Cases

* Competitor monitoring
* Price tracking
* SEO tracking
* Job listing alerts
* Content change alerts

---

## ⚡ Notes

* No login required
* API key = access
* Credits deducted per request

---

## 🛠 Built for

* Developers
* Automation tools
* AI agents

---

## 📬 Feedback

Open an issue or reach out — happy to give extra credits to early users.
