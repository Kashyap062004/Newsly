import React, { useEffect, useState } from "react";
import TopNavBar from "./TopNavBar";
import DeleteIcon from "@mui/icons-material/Delete";
import { showSuccess } from "./toast";
import image from "./images/image.png";
import { FaShareAlt } from "react-icons/fa";
import "./CSS/bookmark.css"
import config from "../config";

export default function BookmarkedArticles({
  category,
  setCategory,
  search,
  setSearch,
  onChatBotRequest,
}) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  useEffect(() => {
    fetch(`${config.BACKEND_API}/user/bookmarks`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.bookmarkedArticles || []);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (url) => {
    await fetch(`${config.BACKEND_API}/user/bookmark`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    setArticles((prev) => prev.filter((a) => a.url !== url));
    showSuccess("Removed from bookmarks");
  };

  const handleShare = (idx) => {
    const article = articles[idx];
    if (navigator.clipboard) {
      navigator.clipboard.writeText(article.url);
      showSuccess("News link copied to clipboard!");
    } else {
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
        onSearch={() => {}}
      />
      <div style={{ marginTop: -10, paddingBottom: 24 }}>
        <h1 style={{ textAlign: "center", marginBottom: 20 }}>
          Bookmarked Articles
        </h1>
        {loading ? (
          <div>Loading...</div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: "center" }}>No bookmarks yet.</div>
        ) : (
          <div className="news-list">
            {articles.map((article, idx) => (
              <div
                className="news-card"
                key={article.url || idx}
                style={{ position: "relative" }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <img
                  className="news-img"
                  src={
                    article.urlToImage && article.urlToImage.trim() !== ""
                      ? article.urlToImage
                      : image
                  }
                  alt={article.title}
                />
                <div className="news-content">
                  <h3>{article.title}</h3>
                  <p>{article.description}</p>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read More
                  </a>
                  <div className="news-meta">
                    <span>{article.source?.name}</span>
                    <span>
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                  <div className="news-bottom-actions">
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
                      <>
                        <button
                          className="news-action-btn"
                          onClick={() => handleSummarize(article.url)}
                        >
                          Summarize
                        </button>
                        <button
                          className="news-action-btn"
                          onClick={() => handleTranslate(idx, article.url)}
                        >
                          Translate
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <DeleteIcon
                  onClick={() => handleDelete(article.url)}
                  sx={{
                    position: "absolute",
                    bottom: 10,
                    right: 16,
                    color: "#d32f2f",
                    cursor: "pointer",
                    background: "#fff",
                    borderRadius: "50%",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    p: "4px",
                    fontSize: 20,
                    transition: "background 0.2s",
                  }}
                  titleAccess="Delete"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
