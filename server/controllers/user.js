const User = require("../models/user");
const { v4: uuidv4 } = require("uuid");
const { setUser, getUser } = require("../service/auth");
const nodemailer = require("nodemailer");
const { setOtp, getOtp, deleteOtp } = require("../service/otpStore");
const router = require("express").Router();

// Signup with OTP
async function handleUserSignup(req, res) {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already registered" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Send OTP email
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "kashyap.trivedi2004@gmail.com", 
            pass: "qpoa vkzo mrnn sqzo",    // use app password
        },
    });

    await transporter.sendMail({
        from: "kashyap.trivedi2004@gmail.com",
        to: email,
        subject: "Your OTP for Newsly Registration",
        text: `Your OTP is: ${otp}`,
    });

    setOtp(email, otp);

    res.status(200).json({ message: "OTP sent to email", email, name, password });
}

// OTP verification and registration
async function handleVerifyOtp(req, res) {
    const { name, email, password, otp } = req.body;
    const record = getOtp(email);
    if (!record) return res.status(400).json({ error: "OTP expired or not found" });
    if (record.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

    // Register user
    await User.create({ name, 
        email, 
        password,
        subscribe: false,
        requestsToday: 0,
        lastRequestDate: new Date() });
    deleteOtp(email);
    res.status(200).json({ message: "Signup successful! Please login." });
}

// Login
async function handleUserLogin(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) {
        return res.status(401).json({ error: "Invalid Username or Password" });
    }
    const token = setUser(user);
    res.cookie("uid", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false
    });
    res.status(200).json({ message: "Login successful" });
}




module.exports = {
    handleUserSignup,
    handleUserLogin,
    handleVerifyOtp,
};