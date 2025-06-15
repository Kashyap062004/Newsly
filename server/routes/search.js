const express = require("express");
const router = express.Router();
const { Client } = require("@elastic/elasticsearch");

// v7-compatible client
const client = new Client({ node: "http://localhost:9200" });

router.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) {
    return res.status(400).json({ error: "Missing or empty search query." });
  }

  try {
    const result = await client.search({
      index: "news",
      body: {
        size: 20,  // return up to 20 hits
        query: {
          multi_match: {
            query: q,
            fields: ["title^3", "description", "content"],
            fuzziness: "AUTO"
          }
        }
      }
    });

    // Extract the source documents
    const articles = (result.hits.hits || []).map(hit => hit._source);

    res.json({ articles });
  } catch (error) {
    console.error("Elasticsearch search error:", error);
    res.status(500).json({
      error: "Elasticsearch query failed.",
      details: error.meta?.body?.error || error.message
    });
  }
});

module.exports = router;
