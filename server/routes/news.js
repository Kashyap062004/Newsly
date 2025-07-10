const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();

const API_KEYS = [
  process.env.NEWS_API_KEY_1,
  process.env.NEWS_API_KEY_2,
  process.env.NEWS_API_KEY_3,
  process.env.NEWS_API_KEY_4
];

async function fetchWithFallback(urls) {
  let lastError;
  for (const url of urls) {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (err) {
      lastError = err;
      // If error is not quota related, break early
      if (!err.response || (err.response.status !== 429 && err.response.status !== 401)) {
        break;
      }
    }
  }
  throw lastError;
}

router.get("/", async (req, res) => {
  const { category, q } = req.query;
  let baseUrl = "";

  // Home & World: Top headlines, no country (global)
  if (!category || ["home", "world"].includes(category.toLowerCase())) {
    baseUrl = `https://newsapi.org/v2/top-headlines?language=en`;
    if (q) baseUrl += `&q=${encodeURIComponent(q)}`;
  }
  // India: Top headlines for India
  else if (category.toLowerCase() === "india") {
    baseUrl = `https://newsapi.org/v2/top-headlines?country=in&category=general&language=en`;
    if (q) baseUrl += `&q=${encodeURIComponent(q)}`;
  }
  // Other categories: Top headlines for India with category
  else {
    baseUrl = `https://newsapi.org/v2/top-headlines?category=${encodeURIComponent(category.toLowerCase())}`;
    if (q) baseUrl += `&q=${encodeURIComponent(q)}`;
  }

  // Try all API keys in order
  const urls = API_KEYS.map(key => `${baseUrl}&apiKey=${key}`);

  try {
    const data = await fetchWithFallback(urls);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

module.exports = router;