# Competitor Price Monitoring API

Track competitor price and product changes in real time and trigger automated actions.

## Overview

Competitors change prices, stock, and product listings constantly. Reacting late can cost revenue.

This API monitors product pages and detects meaningful changes such as price updates and availability changes. It returns structured data and can trigger webhooks so your systems can respond immediately.

## Features

- Detect price drops and increases
- Monitor stock availability changes
- Structured JSON output
- Webhook support for real-time automation
- Designed for developers and automation systems
- Fast and reliable monitoring

## Example Response

```json
{
  "change_type": "price_drop",
  "product_name": "Running Shoes X",
  "old_price": 120,
  "new_price": 95,
  "percentage_change": 21,
  "ai_summary": "Price dropped significantly, likely a promotion",
  "timestamp": "2026-04-15T10:00:00Z"
}

Quick start
1. Create a monitor
POST /api/monitors
{
  "url": "https://example.com/product",
  "type": "product",
  "check_interval_minutes": 10
}

2. (Optional) Add a webhook
Receive updates automatically when a change is detected.

3. Get changes
GET /api/changes/latest

Use cases:
Track competitor pricing
React instantly to price drops
Monitor stock availability
Automate pricing decisions
Power internal tools or AI agents

How it works:
Add a product URL
The system extracts structured data
Changes are detected and classified
Results are returned via API or sent via webhook

Design goals:
Detect meaningful changes, not noise
Provide clean, structured data
Be easy to integrate
Enable automation, not just alerts

Limitations:
Accuracy depends on page structure
Some dynamic pages may be harder to parse
Detection improves over time

License:
MIT

---

#  Why this version is better

- Shorter → higher engagement  
- Quick start is immediate  
- No fluff sections devs ignore  
- Clear use cases  
- Honest limitations (builds trust)

---

#  One optional upgrade (high impact)

At the very top, you can add:

```md
Simple API to detect competitor price changes and trigger actions.

