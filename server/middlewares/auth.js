const {getUser}=require("../service/auth");

async function restrecttologinusers(req,res,next) {
    const userid=req.cookies?.uid;
    if(!userid) return res.redirect("/login");
    const user=getUser(userid);
    if(!user) return res.redirect("/login");
    req.user=user;

    next();
}
function authMiddleware(req, res, next) {
  const token = req.cookies?.uid;
  
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  const user = getUser(token);
  if (!user) return res.status(401).json({ error: "Invalid token" });
  req.user = user;
  next();
}
module.exports={
    restrecttologinusers,
    authMiddleware
}