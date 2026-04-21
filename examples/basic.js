fetch("https://api.webintel.io/v1/signals", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    url: "https://example.com/product"
  })
})
.then(res => res.json())
.then(console.log);
