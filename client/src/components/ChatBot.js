import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import "./CSS/ChatBot.css";
import PaymentButton from "./PaymentButton";
const ChatBot = forwardRef(function ChatBot({ onSend }, ref) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [pendingUrl, setPendingUrl] = useState("");
  const [selectedLang, setSelectedLang] = useState("hindi");

  useImperativeHandle(ref, () => ({
    receiveExternalMessage: (msg) => {
      setOpen(true);
      if (typeof msg === "object" && msg.type === "translate") {
        setShowLangDropdown(true);
        setPendingUrl(msg.url);
      } else {
        setShowLangDropdown(false);
        setPendingUrl("");
        
        onSend(msg).then((response) => {
          setMessages((msgs) => [
            ...msgs,
            { from: "user", text: msg },
            { from: "bot", text: response },
          ]);
        });
      }
    },
  }));

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

// const handleSend = async (e) => {
//   e.preventDefault();
//   if (!input.trim()) return;
//  // const userMsg = { from: "user", text: input };
//   setMessages((msgs) => [
//   ...msgs,
//   data.showPay
//     ? { from: "bot", text: <>{data.response} <PaymentButton /></> }
//     : { from: "bot", text: data.response }
// ]);
//   setInput("");

//   // Send only the message, not user.email
//   const res = await fetch("http://localhost:8000/api/ai/chat", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ message: input }),
//   });
//   const data = await res.json();
//   setMessages((msgs) => [
//   ...msgs,
//   data.showPay
//     ? { from: "bot", text: <>{data.response} {<PaymentButton />}</> }
//     : { from: "bot", text: data.response }

//   ]);
// };
const handleSend = async (e) => {
  e.preventDefault();
  if (!input.trim()) return;

  setMessages((msgs) => [...msgs, { from: "user", text: input }]);
  setInput("");

  const res = await fetch("http://localhost:8000/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: input }),
  });

  const data = await res.json();

  setMessages((msgs) => [
    ...msgs,
    { from: "bot", text: data.response, showPay: data.showPay || false },
  ]);
};

  return (
    <div>
      <div
        className="chatbot-fab"
        onClick={() => setOpen((o) => !o)}
        title="Open AI Assistant"
      >
        💬
      </div>
      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>AI Assistant</span>
            <button onClick={() => setOpen(false)}>×</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg ${msg.from}`}>
                <div>{msg.text}</div>
                {msg.from === "bot" && msg.showPay && (
                  <div style={{ marginTop: "10px" }}>
                    <PaymentButton />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Language dropdown for translate */}
          {showLangDropdown && (
            <form
              className="chatbot-input"
              onSubmit={(e) => {
                e.preventDefault();
                setShowLangDropdown(false);
                const msg = `translate to ${selectedLang}: ${pendingUrl}`;
                setMessages((msgs) => [...msgs, { from: "user", text: msg }]);
                onSend(msg).then((response) => {
                  setMessages((msgs) => [
                    ...msgs,
                    { from: "user", text: msg },
                    { from: "bot", text: response },
                  ]);
                });
                setPendingUrl("");
              }}
              style={{ display: "flex", gap: 8, margin: "8px 0" }}
            >
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                style={{ flex: 1, padding: 6, borderRadius: 5 }}
              >
                <option value="hindi">Hindi</option>
                <option value="gujarati">Gujarati</option>
                <option value="french">French</option>
                <option value="german">German</option>
                <option value="spanish">Spanish</option>
                <option value="japanese">Japanese</option>
                {/* Add more as needed */}
              </select>
              <button type="submit" className="news-action-btn large" >
                Translate
              </button>
            </form>
          )}
          {/* Regular input only if not translating */}
          {!showLangDropdown && (
            <form className="chatbot-input" onSubmit={handleSend}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                style={{ resize: "none" }}
              />

              <button type="submit">Send</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
});

export default ChatBot;