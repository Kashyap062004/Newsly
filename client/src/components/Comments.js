import React, { useEffect, useState } from "react";
import "./CSS/Comments.css"; // create this file for modal styles

export default function Comments({ articleUrl, onClose }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [replyText, setReplyText] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!articleUrl) return;
    fetch(`http://localhost:8000/api/comments/${encodeURIComponent(articleUrl)}`)
      .then(res => res.json())
      .then(setComments);
  }, [articleUrl]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    const res = await fetch("http://localhost:8000/api/comments", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleUrl, text }),
    });
    if (res.ok) {
      setText("");
      fetch(`http://localhost:8000/api/comments/${encodeURIComponent(articleUrl)}`)
        .then(res => res.json())
        .then(setComments);
    }
    setLoading(false);
  };

  const handleLike = async (commentId) => {
    await fetch(`http://localhost:8000/api/comments/like/${commentId}`, {
      method: "POST",
      credentials: "include",
    });
    fetch(`http://localhost:8000/api/comments/${encodeURIComponent(articleUrl)}`)
      .then(res => res.json())
      .then(setComments);
  };

  const handleReply = async (commentId) => {
    const reply = replyText[commentId];
    if (!reply || !reply.trim()) return;
    await fetch(`http://localhost:8000/api/comments/reply/${commentId}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: reply }),
    });
    setReplyText((prev) => ({ ...prev, [commentId]: "" }));
    fetch(`http://localhost:8000/api/comments/${encodeURIComponent(articleUrl)}`)
      .then(res => res.json())
      .then(setComments);
  };

  return (
    <div className="comments-modal-bg" onClick={onClose}>
      <div className="comments-modal-window" onClick={e => e.stopPropagation()}>
        <div className="comments-modal-header">
          <span>Comments</span>
          <button className="comments-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="comments-modal-body">
          <form onSubmit={handlePost} style={{ marginBottom: 12 }}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Add a comment..."
              rows={2}
              style={{ width: "100%", marginBottom: 4 }}
            />
            <button type="submit" disabled={loading || !text.trim()}>
              Post
            </button>
          </form>
          {comments.length === 0 && <div>No comments yet.</div>}
          {comments.map((c) => (
            <div key={c._id} style={{ borderBottom: "1px solid #eee", marginBottom: 8, paddingBottom: 8 }}>
              <b>{c.userName || "User"}</b> <span style={{ fontSize: 12, color: "#888" }}>{new Date(c.createdAt).toLocaleString()}</span>
              <div>{c.text}</div>
              <button onClick={() => handleLike(c._id)}>
                👍 {c.likes?.length || 0}
              </button>
              <button onClick={() => setReplyText((prev) => ({ ...prev, [c._id]: prev[c._id] ? "" : "" }))}>
                Reply
              </button>
              <div style={{ marginLeft: 20 }}>
                <input
                  type="text"
                  value={replyText[c._id] || ""}
                  onChange={e => setReplyText((prev) => ({ ...prev, [c._id]: e.target.value }))}
                  placeholder="Write a reply..."
                  style={{ width: "70%" }}
                />
                <button onClick={() => handleReply(c._id)} disabled={!replyText[c._id] || !replyText[c._id].trim()}>
                  Send
                </button>
                {c.replies && c.replies.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    {c.replies.map((r, i) => (
                      <div key={i} style={{ fontSize: 13, marginLeft: 10 }}>
                        <b>{r.userName || "User"}:</b> {r.text} <span style={{ color: "#888" }}>{new Date(r.createdAt).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}