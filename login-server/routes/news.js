const express = require("express");
const axios = require("axios");
const router = express.Router();

const API_KEY = "9e2000bb21064844877b67b9fdf860db";

router.get("/", async (req, res) => {
  const { category, q } = req.query;
  let url = `https://newsapi.org/v2/top-headlines?country=in&apiKey=${API_KEY}`;
  if (category && category.toLowerCase() !== "home" && category.toLowerCase() !== "general") {
    url += `&category=${category}`;
  }
  if (q) url += `&q=${encodeURIComponent(q)}`;

  try {
    let response = await axios.get(url);
    // If no articles, try global headlines
    if (!response.data.articles || response.data.articles.length === 0) {
      url = `https://newsapi.org/v2/top-headlines?apiKey=${API_KEY}`;
      if (category && category.toLowerCase() !== "home" && category.toLowerCase() !== "general") {
        url += `&category=${category}`;
      }
      if (q) url += `&q=${encodeURIComponent(q)}`;
      response = await axios.get(url);
    }
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

module.exports = router;