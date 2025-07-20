const express=require("express")
const mongoose=require("mongoose")
const cookieParser=require("cookie-parser")
const { connectToMongoDB } = require("./connect");
const app=express();
require("./utils/dailyDigest");
const PORT=8000;

const path = require("path");
const userroute=require("./routes/user")
const staticroutes=require("./routes/staticRouter")
const {restrecttologinusers,authMiddleware}=require('./middlewares/auth')
const newsRoute=require("./routes/news")
const cors = require("cors");
const router = express.Router();
const session = require("express-session");
const passport = require("./service/googleAuth"); 
const { getUser ,setUser} = require("./service/auth");

const { User } = require("./models/user");

app.use(cors({
    origin: 'https://newsly-live.netlify.app' || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// app.use(express.json());
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
const newsRoutes = require("./routes/news");
app.use("/api/news", newsRoutes);
// const searchRoutes = require("./routes/search");
// app.use("/api/news", searchRoutes);
require('dotenv').config();

// connectToMongoDB( "mongodb://localhost:27017/short-url").then(() =>
//   console.log("Mongodb connected")
// );
// connectToMongoDB(process.env.MONGO_URI).then(() =>
//   console.log("MongoDB Atlas connected")
// ).catch((err) => console.error("Connection error:", err));
// console.log("process.env.MONGO_URI", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected ✅"))
.catch((err) => console.error("MongoDB connection error ❌", err));

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));


app.use(session({
  secret: "your-session-secret",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


app.get('/user/me', (req, res) => {
  const token = req.cookies?.uid;
  if (!token) return res.json({ loggedIn: false });
  const user = getUser(token);
  if (!user) return res.json({ loggedIn: false });
  res.json({ loggedIn: true, user });
});


app.get("/home", restrecttologinusers, (req, res) => {
    res.render("home", { user: req.user });
});
app.use("/user",userroute);
app.use("/",staticroutes);

app.listen(PORT,()=>console.log(`Server started at ${PORT}`));

app.post('/user/logout', (req, res) => {
  res.clearCookie("uid");
  res.json({ message: "Logged out" });
});
app.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: process.env.FRONTEND_URL,
    // failureRedirect: 'http://localhost:3000',
    session: true
  }),
  (req, res) => {
    // Set JWT cookie for frontend
    const token = setUser(req.user);
    res.cookie("uid", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    });
    // Redirect to frontend
    const isNewUser = req.user._isNewGoogleUser;
const redirectUrl = isNewUser
  ? `${process.env.FRONTEND_URL}/login?newuser=1`
  : `${process.env.FRONTEND_URL}/login`;

res.redirect(redirectUrl);
    res.redirect(process.env.FRONTEND_URL);
  }
);

const aiRoutes = require("./routes/ai");
app.use("/api/ai", aiRoutes);
// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const paymentRoutes = require('./routes/payment');
app.use('/api/payment', paymentRoutes);

router.get("/", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ recommendations: user.recommendations || [] });
});

const activityRoutes = require("./routes/activity");
app.use("/api/activity", activityRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

const commentRoutes = require("./routes/comment");
app.use("/api/comments", commentRoutes);
router.get("/trending", async (req, res) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const trending = await Comment.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: "$articleUrl", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);
  res.json(trending);
});

