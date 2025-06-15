import React, { useEffect, useState } from "react";
import TopNavBar from "./TopNavBar";
import image from "./images/image.png";
import { FaShareAlt } from "react-icons/fa";
import { showSuccess } from "./toast";
import "./CSS/App.css";

function NewsFeed({
  category,
  setCategory,
  search,
  setSearch,
  onChatBotRequest,
}) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // const [search, setSearch] = useState("");
  const [likes, setLikes] = useState({});
  const [dislikes, setDislikes] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const fetchElasticSearch = async (q) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `http://localhost:8000/api/news/search?q=${encodeURIComponent(q)}`
      );
      const data = await res.json();
      if (res.ok) {
        setNews(data.articles || []);
      } else {
        setError(data.error || "Search failed");
        setNews([]);
      }
    } catch {
      setError("Failed to fetch search results.");
      setNews([]);
    }
    setLoading(false);
  };

  // Map UI categories to NewsAPI categories
  const getApiCategory = (cat) => {
    const map = {
      Home: "home",
      India: "india",
      World: "world",
      Business: "business",
      Tech: "technology",
      Cricket: "sports",
      Sports: "sports",
      Entertainment: "entertainment",
      Astro: "science",
      TV: "entertainment",
      Education: "general",
      "Life & Style": "general",
      "Web Series": "entertainment",
    };
    return map[cat] || "general";
  };

  // Fetch news from backend
  const fetchNews = async (cat = category, q = "") => {
    setLoading(true);
    setError("");
    try {
      let url = `http://localhost:8000/api/news?category=${getApiCategory(
        cat
      )}`;
      if (q) url += `&q=${encodeURIComponent(q)}`;
      const res = await fetch(url);
      const data = await res.json();
      // Handle both articles and sources
      if (res.ok) {
        if (data.articles) {
          setNews(data.articles);
        } else if (data.sources) {
          // Map sources to article-like objects for display
          setNews(
            data.sources.map((src) => ({
              title: src.name,
              description: src.description,
              url: src.url,
              urlToImage: "https://via.placeholder.com/320x180?text=No+Image",
              source: { name: src.name },
              publishedAt: new Date().toISOString(),
            }))
          );
        } else {
          setNews([]);
        }
      } else {
        setNews([]);
      }
    } catch {
      setError("Failed to fetch news.");
      setNews([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line
  }, [category]);
  const handleSearch = (q) => {
    if (q && q.trim()) {
      fetchElasticSearch(q);
    } else {
      fetchNews(category, "");
    }
  };

  //Like Handler
  const handleLike = async (idx) => {
    const article = news[idx];
    await fetch("http://localhost:8000/user/like", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ article }),
    });
    setLikes((prev) => ({ ...prev, [idx]: !prev[idx] }));
    setDislikes((prev) => ({ ...prev, [idx]: false }));
    showSuccess("News Liked")
  };
  //Bookmark Handler
  const handleBookmark = async (idx) => {
    const article = news[idx];
    await fetch("http://localhost:8000/user/bookmark", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ article }),
    });
    setBookmarks((prev) => ({ ...prev, [idx]: !prev[idx] }));
    showSuccess("News Bookmarked");
  };

  // Dislike handler
  const handleDislike = (idx) => {
    setDislikes((prev) => ({ ...prev, [idx]: !prev[idx] }));
    setLikes((prev) => ({ ...prev, [idx]: false }));
  };
  // Share handler
  const handleShare = (idx) => {
    const article = news[idx];
    if (navigator.clipboard) {
      navigator.clipboard.writeText(article.url);
      showSuccess("News link copied to clipboard!");
    } else {
      // fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = article.url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      showSuccess("News link copied to clipboard!");
    }
  };
  const handleTranslate = (idx, url) => {
    if (onChatBotRequest) {
      onChatBotRequest({ type: "translate", url });
    }
  };

  // Handler for summarize button
  const handleSummarize = (url) => {
    if (onChatBotRequest) {
      onChatBotRequest(`summarize: ${url}`);
    }
  };

  return (
    <div>
      <TopNavBar
        category={category}
        setCategory={setCategory}
        search={search}
        setSearch={setSearch}
        onSearch={handleSearch}
      />
      {loading && <p style={{ textAlign: "center" }}>Loading news...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && news.length === 0 && !error && (
        <p style={{ textAlign: "center" }}>
          No news articles found for this category.
        </p>
      )}
      <div className="news-list">
        {news.map((article, idx) => (
          <div
            className="news-card"
            key={idx}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <img
              className="news-img"
              src={article.urlToImage || image}
              alt={article.title}
            />
            <div className="news-content">
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                Read More
              </a>
              <div className="news-meta">
                <span>{article.source?.name}</span>
                <span>
                  {new Date(article.publishedAt).toLocaleDateString()}
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" ,marginBottom:"2px"}}>
                <button
                  style={{
                    color: likes[idx] ? "#388e3c" : "#555",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => handleLike(idx)}
                  aria-label="Like"
                  title="Like"
                >
                  👍
                </button>
                <button
                  style={{
                    color: dislikes[idx] ? "#d32f2f" : "#555",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => handleDislike(idx)}
                  aria-label="Dislike"
                  title="Dislike"
                >
                  👎
                </button>
                <button
                  style={{
                    color: bookmarks[idx] ? "#fbc02d" : "#555",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => handleBookmark(idx)}
                  aria-label="Bookmark"
                  title="Bookmark"
                >
                  {bookmarks[idx] ? "★" : "☆"}
                </button>
                <button
                  style={{
                    color: "#1976d2",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => handleShare(idx)}
                  aria-label="Share"
                  title="Share"
                >
                  <FaShareAlt />
                </button>
              
              {hoveredIdx === idx && (
                <div className="news-bottom-actions">
                  <button
                    className="news-action-btn large"
                    onClick={() => handleSummarize(article.url)}
                  >
                    <b>Summarize</b>
                  </button>

                  <button 
                    className="news-action-btn large"
                    onClick={() => handleTranslate(idx, article.url)}
                  >
                    <b>Translate</b>
                  </button>
                </div>
                
              )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NewsFeed;
