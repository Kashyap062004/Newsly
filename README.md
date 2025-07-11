# Newsly

Newsly is a full-stack news aggregator platform that delivers personalized, real-time news from multiple sources. It features advanced search, AI-powered summarization and translation, interactive comments, daily email digests, and more.

## Features

- 📰 **Personalized Feed:** Recommendations based on user interests.
- 🗨️ **Interactive Comments:** Like, reply, and discuss articles in a modern UI.
- ⭐ **Bookmarks & Likes:** Save and react to your favorite news.
- 🤖 **AI Summarization & Translation:** Get concise summaries and translate articles instantly.
- 📧 **Daily Email Digest:** Receive a curated selection of news in your inbox.
- 🔒 **Authentication:** Secure login with JWT and Google OAuth.
- 📊 **User Activity Tracking:** Analytics for engagement and preferences.
- 💬 **Chatbot:** Ask for summaries, translations, and more via an integrated AI assistant.
- 📱 **Responsive Design:** Works seamlessly on desktop and mobile.

## Tech Stack

- **Frontend:** React, CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Search:** Elasticsearch
- **AI Integration:** OpenAI/Mistral APIs
- **Authentication:** JWT, Google OAuth
- **Email:** Nodemailer
- **Other:** Razorpay (for payments), Cron (for scheduled tasks)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB Atlas account
- Elasticsearch instance (local or cloud)
- (Optional) OpenAI/Mistral API key for AI features

### Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/newsly.git
    cd newsly
    ```

2. **Set up environment variables:**
    - Copy `.env.example` to `.env` in both `/client` and `/server` folders.
    - Fill in your MongoDB URI, JWT secret, API keys, etc.

3. **Install dependencies:**
    ```bash
    cd server
    npm install
    cd ../client
    npm install
    ```

4. **Start the backend:**
    ```bash
    cd ../server
    npm start
    ```

5. **Start the frontend:**
    ```bash
    cd ../client
    npm start
    ```

6. **Access the app:**
    - Open [http://localhost:3000](http://localhost:3000) in your browser.
