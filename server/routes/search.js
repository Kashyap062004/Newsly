// const express = require("express");
// const router = express.Router();
// const { Client } = require("@elastic/elasticsearch");

// // v7-compatible client
// const client = new Client({ node: "http://localhost:9200" });

// async function insertDummyArticles() {
//   const articles = [
//     {
//       title: "Trump speaks at rally",
//       description: "Donald Trump addressed a rally in Florida today.",
//       content: "Trump talked about the upcoming elections...",
//       url: "https://example.com/trump-rally",
//       publishedAt: new Date().toISOString(),
//       source: { name: "CNN" }
//     },
//     {
//       title: "Election coverage",
//       description: "Coverage of US elections 2024.",
//       content: "Candidates include Trump, Biden...",
//       url: "https://example.com/election",
//       publishedAt: new Date().toISOString(),
//       source: { name: "BBC" }
//     }
//   ];

//   for (const article of articles) {
//     await client.index({
//       index: "news",
//       body: article
//     });
//   }

//   await client.indices.refresh({ index: "news" });
//   console.log("✅ Dummy articles inserted.");
// }

// insertDummyArticles();
// async function createNewsIndex() {
//   try {
//     const exists = await client.indices.exists({ index: 'news' });
//     if (!exists.body) {
//       await client.indices.create({
//         index: 'news',
//         body: {
//           mappings: {
//             properties: {
//               title: { type: 'text' },
//               description: { type: 'text' },
//               content: { type: 'text' },
//               url: { type: 'keyword' },
//               publishedAt: { type: 'date' },
//               source: {
//                 properties: {
//                   name: { type: 'keyword' }
//                 }
//               }
//             }
//           }
//         }
//       });
//       console.log("✅ 'news' index created.");
//     } else {
//       console.log("ℹ️ 'news' index already exists.");
//     }
//   } catch (err) {
//     console.error("❌ Failed to create index:", err);
//   }
// }

// createNewsIndex();
// router.get("/search", async (req, res) => {
//   const { q } = req.query;
//   if (!q || !q.trim()) {
//     return res.status(400).json({ error: "Missing or empty search query." });
//   }

//   try {
//     const result = await client.search({
//       index: "news",
//       body: {
//         size: 20,
//         query: {
//           multi_match: {
//             query: q,
//             fields: ["title^3", "description", "content"],
//             fuzziness: "AUTO"
//           }
//         }
//       }
//     });

//     // Safe fallback
//     const articles = result.hits?.hits?.map(hit => hit._source) || [];
//     res.json({ articles });

//   } catch (error) {
//     console.error("Elasticsearch search error:", error);
//     res.status(500).json({
//       error: "Elasticsearch query failed.",
//       details: error.meta?.body?.error || error.message
//     });
//   }
// });


// module.exports = router;
