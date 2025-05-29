const express=require("express")
const mongoose=require("mongoose")
const cookieParser=require("cookie-parser")
const { connectToMongoDB } = require("./connect");
const app=express();
const PORT=8000;

const path = require("path");
const userroute=require("./routes/user")
const staticroutes=require("./routes/staticRouter")
const {restrecttologinusers}=require('./middlewares/auth')
const newsRoute=require("./routes/news")
const cors = require("cors");

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
connectToMongoDB( "mongodb://localhost:27017/short-url").then(() =>
  console.log("Mongodb connected")
);

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use("/api/news",newsRoute);
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));


const { getUser } = require("./service/auth");

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
