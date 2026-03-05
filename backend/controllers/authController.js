import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';

// 🔓 CIPHER DECODER (Critical Sync Point)
const decryptPassword = (cipherText) => {
  try {
    // We use the environment variables defined in your production .env
    const key = CryptoJS.enc.Hex.parse(process.env.ENCRYPTION_KEY); 
    const iv = CryptoJS.enc.Hex.parse(process.env.ENCRYPTION_IV);
    
    // Ensure the incoming text is treated as Hex
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Hex.parse(cipherText)
    });

    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const result = decrypted.toString(CryptoJS.enc.Utf8);
    if (!result) throw new Error("Decryption resulted in empty string");
    return result;
  } catch (err) {
    console.error("❌ SECURITY ALERT: AES Decryption Failed. Check ENCRYPTION_KEY/IV sync.");
    return null;
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ── LOGIN CONTROLLER ──
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the investor in the ledger
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Identity not found in Trustra Ledger." });
    }

    // 2. Decrypt the Access Cipher from the frontend
    const plainPassword = decryptPassword(password);
    
    if (!plainPassword) {
      return res.status(400).json({ message: "Protocol Error: Secure Handshake Failed." });
    }

    // 3. Compare with Bcrypt hash in DB
    const isMatch = await user.comparePassword(plainPassword);
    
    if (isMatch) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        balances: user.balances,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: "Invalid Access Cipher." });
    }
  } catch (error) {
    console.error("🔥 Login Crash:", error.message);
    res.status(500).json({ message: "Internal Protocol Error: Handshake Timeout." });
  }
};
