const User=require("../models/user")
const {v4:uuidv4}=require("uuid")
const {setUser,getUser}=require("../service/auth")
async function handleUserSignup(req,res) {
    const {name,email,password}=req.body;
    await User.create({
        name,
        email,
        password,
    });
    return res.render("login");
}

// async function handleUserLogin(req,res) {
//     const {email,password}=req.body;
//     const user=await User.findOne({email,password});
//     if(!user){
//         res.render("login",{
//             error:"Invalid Username or Password",
//         })
//     }
//     // return res.redirect("home");
//     const sessionid=uuidv4();
//     setUser(sessionid,user);
//     res.cookie("uid",sessionid);
//     res.render("home",{user});
      

// }
async function handleUserLogin(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) {
        return res.status(401).json({ error: "Invalid Username or Password" });
    }
    const token = setUser(user);
    res.cookie("uid", token, {
        httpOnly: true,
        sameSite: "lax", // Use "none" and secure: true if using HTTPS
        secure: false    // Use true if using HTTPS
    });
    res.status(200).json({ message: "Login successful" });
}
module.exports={
    handleUserSignup,
    handleUserLogin,
};