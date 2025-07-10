const cron = require('node-cron');
const nodemailer = require('nodemailer');
const {User} = require('../models/user');
const axios = require('axios');


function generateEmailHtml(articles,user) {
  return `
  
    <div style="font-family:Segoe UI, sans-serif; padding: 24px; background:#f5f5f5; color: #222;">
  <h1 style="color:#1976d2;">Good Morning, ${user.name}!</h1>
  <h2 style="margin-top: 0;">Here's your curated news for today 📬</h2>
  
  ${articles.map(a => `
    <div style="border:1px solid #ddd; border-radius:8px; padding:16px; margin:20px 0; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <img src="${a.urlToImage || 'https://via.placeholder.com/400x200?text=No+Image'}" 
           alt="News Image" 
           style="width:100%; max-width:600px; border-radius:6px; margin-bottom:12px;" />
      <h3 style="margin:8px 0 6px;">${a.title}</h3>
      <p style="font-size:15px; color:#555;">${a.description || ''}</p>
      <a href="${a.url}" 
         style="display:inline-block; margin-top:8px; color:#1976d2; text-decoration:none; font-weight:bold;"
         target="_blank" rel="noopener noreferrer">
         Read More →
      </a>
    </div>
    
  `).join('')}

   <a href="http://localhost:3000/" 
         style="display:inline-block; margin:24px 0 0 0; padding:10px 24px; background:#1976d2; color:#fff; border-radius:6px; text-decoration:none; font-weight:bold; font-size:16px;">
         More News
      </a>
  <hr style="margin:40px 0;">

  <p style="font-size:14px; color:#999;">You're receiving this because you subscribed to Daily News Digest. To manage preferences, click here.</p>
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

cron.schedule('30 06 * * *', async () => {
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
