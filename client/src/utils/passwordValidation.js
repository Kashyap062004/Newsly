export function isValidPassword(password) {
  // At least 8 chars, one number, one special char
  return /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/.test(password);
}