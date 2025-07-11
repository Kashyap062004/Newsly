const express = require("express");
const axios = require("axios");
const router = express.Router();
const {User}=require("../models/user");
const checkSubscription = require("../middlewares/checkSubscription");
require("dotenv").config();

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY; // Replace with your actual key
const { restrecttologinusers } = require('../middlewares/auth');

// Helper to check if input is a URL
function isUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}
// Add this helper function at the top
async function extractArticleContent(url) {
  try {
    // Try direct extraction first
    const { extract } = await import("@extractus/article-extractor");
    const article = await extract(url);
    if (article?.content) {
      return article.content;
    }

    // If direct extraction fails, try with axios as fallback
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    // Basic content extraction from HTML
    const content = response.data
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return content;
  } catch (error) {
    console.error('Article extraction failed:', error.message);
    throw new Error(`Could not extract content: ${error.message}`);
  }
}

// Then update the extraction code in both summarize and translate blocks:


// Example function to get top news headlines (customize for your app)
async function getTopHeadlines(category = "general", limit = 5) {
  try {
    const response = await axios.get(`${process.env.FRONTEND_URL}/api/news/top?category=${category}&limit=${limit}`);
    const news = response.data.articles || []; // Adjust based on your app's response
    return news.slice(0, limit).map((item, index) => `${index + 1}. ${item.title}`).join("\n");
  } catch (err) {
    console.error("Failed to fetch headlines:", err.message);
    return "No headlines available.";
  }
}
// const handleSend = async (e) => {
//   e.preventDefault();
//   if (!input.trim()) return;
//   const userMsg = { from: "user", text: input };
//   setMessages((msgs) => [...msgs, userMsg]);
//   setInput("");

//   // Send only the message, not user.email
//   const res = await fetch("http://localhost:8000/api/ai/chat", {
//     method: "POST",
//     credentials: "include",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ message: input }),
//   });
//   const data = await res.json();
//   setMessages((msgs) => [
//     ...msgs,
//     { from: "bot", text: data.response },
//     ...(data.showPay ? [{ from: "bot", text: <PaymentButton />}] : []),
//   ]);
// };


router.post("/chat",restrecttologinusers,checkSubscription, async (req, res) => {
  const { message } = req.body;
  const email=req.user.email;
  const user=await User.findOne({email});
  const today=new Date().toDateString();


  if (!user.subscribe) {
    if (!user.lastRequestDate || user.lastRequestDate.toDateString() !== today) {
      user.requestsToday = 0;
      user.lastRequestDate = new Date();
      await user.save();
    }

    const isDigest = req.headers["x-dailydigest"] === "true";
  if (!isDigest && !user.subscribe) {
    if (!user.lastRequestDate || user.lastRequestDate.toDateString() !== today) {
      user.requestsToday = 0;
      user.lastRequestDate = new Date();
      await user.save();
    }
    user.requestsToday += 1;
    await user.save();
  }
  }
  try {
    // Summarization command
    if (message.toLowerCase().startsWith("summarize")) {
      let text = message.replace(/^summarize[:\s]*/i, "").trim();

      // If input is a URL, extract article text
     if (isUrl(text)) {
  try {
    text = await extractArticleContent(text);
    if (!text) {
      return res.json({ 
        response: "Could not extract readable content from the URL. Please check if the URL is accessible and contains article content."
      });
    }
  } catch (extractErr) {
    console.error("Extraction error:", extractErr);
    return res.json({ 
      response: `Could not access the article: ${extractErr.message}. Please make sure the URL is publicly accessible.`,
    });
  }
}

      const mistralRes = await axios.post(
        "https://api.mistral.ai/v1/chat/completions",
        {
          model: "mistral-tiny",
          messages: [
            {
              role: "system",
              content:
                "You are a translation engine. ONLY return the translation in plain text, no HTML, no explanation, no formatting, no markdown, no tags, no code blocks. Just the translated text.",
            },
            { role: "user", content: `Summarize this:\n${text}` },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${MISTRAL_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      return res.json({ response: mistralRes.data.choices[0].message.content });
    }

    // Translation command: "translate to <lang>: <text>"
    if (message.toLowerCase().startsWith("translate to")) {
      const match = message.match(/^translate to\s*<?\s*(\w+)\s*>?\s*:\s*(.*)$/i);
      if (match) {
        const [, target, inputText] = match;
        let text = inputText.trim();

        // If input is a URL, extract article text
        if (isUrl(text)) {
  try {
    text = await extractArticleContent(text);
    if (!text) {
      return res.json({ 
        response: "Could not extract readable content from the URL. Please check if the URL is accessible and contains article content."
      });
    }
  } catch (extractErr) {
    console.error("Extraction error:", extractErr);
    return res.json({ 
      response: `Could not access the article: ${extractErr.message}. Please make sure the URL is publicly accessible.`
    });
  }
}

        const mistralRes = await axios.post(
          "https://api.mistral.ai/v1/chat/completions",
          {
            model: "mistral-tiny",
            messages: [
              {
                role: "system",
                content: "You are a translation engine. Translate the user's message into ONLY the target language. Do not explain or add anything.",
              },
              { role: "user", content: `Translate the following text to ${target}:\n${text}` },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${MISTRAL_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        function stripHtml(html) {
          return html.replace(/<[^>]*>?/gm, "").trim();
        }

        return res.json({ response: stripHtml(mistralRes.data.choices[0].message.content) });
      }
    }

    // General chat with optional news context
    let context = "";
    if (/top\s?\d*\s?(headlines|news)/i.test(message) || /latest (news|headlines)/i.test(message)) {
      const topNews = await getTopHeadlines();
      context = `Here are the latest top headlines:\n${topNews}`;
    }

    const mistralRes = await axios.post(
      "https://api.mistral.ai/v1/chat/completions",
      {
        model: "mistral-medium", // upgrade model for better Q&A
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant for a news app. You can summarize articles, translate content, and answer user questions about the latest headlines. Provide clear answers.",
          },
          ...(context ? [{ role: "system", content: context }] : []),
          { role: "user", content: message },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.json({ response: mistralRes.data.choices[0].message.content });
  } catch (err) {
    res.json({
      response: "AI error: " + (err.response?.data?.error?.message || err.message),
    });
  }
});




module.exports = router;
