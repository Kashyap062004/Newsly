const cron = require('node-cron');
const nodemailer = require('nodemailer');
const User = require('../models/user');
const axios = require('axios');


function generateEmailHtml(articles,user) {
  return `
  
    <div style="font-family:Segoe UI,sans-serif;">
    <h1>Good Morning, ${user.name}!</h1>
      <h2>Your Daily News Digest</h2>
      ${articles.map(a => `
        <div style="border:1px solid #eee;border-radius:8px;padding:16px;margin-bottom:18px;">
          <img src="${a.urlToImage || 'https://via.placeholder.com/320x180?text=No+Image'}" style="width:100%;max-width:400px;border-radius:8px;" alt="news"/>
          <h3>${a.title}</h3>
          <p>${a.description || ''}</p>
          <a href="${a.url}" style="color:#1976d2;text-decoration:none;">Read More</a>
        </div>
      `).join('')}

      
    </div>
  `;
}

async function fetchArticlesForCategory(category, limit = 2) {
  const res = await axios.get(`http://localhost:8000/api/news?category=${category}`);
  return (res.data.articles || []).slice(0, limit);
}

async function sendEmail(to, subject, html) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "kashyap.trivedi2004@gmail.com",
      pass: "qpoa vkzo mrnn sqzo"
    }
  });
  await transporter.sendMail({
    from: "kashyap.trivedi2004@gmail.com",
    to,
    subject,
    html
  });
}

cron.schedule('30 6 * * *', async () => {
  const users = await User.find({ interests: { $exists: true, $not: { $size: 0 } } });
  for (const user of users) {
    let articles = [];
    for (const cat of user.interests.slice(0, 3)) {
      const catArticles = await fetchArticlesForCategory(cat, 2);
      articles = articles.concat(catArticles);
    }
    if (articles.length) {
      const html = generateEmailHtml(articles,user);
      await sendEmail(user.email, "Your Daily News Digest", html);
    }
  }
});
