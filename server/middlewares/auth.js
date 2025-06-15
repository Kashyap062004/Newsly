const {getUser}=require("../service/auth");

async function restrecttologinusers(req,res,next) {
    const userid=req.cookies?.uid;
    if(!userid) return res.redirect("/login");
    const user=getUser(userid);
    if(!user) return res.redirect("/login");
    req.user=user;

    next();
}

module.exports={
    restrecttologinusers,
}