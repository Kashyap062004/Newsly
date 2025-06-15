const otpMap = new Map();

function setOtp(email, otp) {
  otpMap.set(email, { otp, createdAt: Date.now() });
}

function getOtp(email) {
  return otpMap.get(email);
}

function deleteOtp(email) {
  otpMap.delete(email);
}

module.exports = { setOtp, getOtp, deleteOtp };