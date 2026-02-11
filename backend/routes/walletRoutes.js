import express from 'express';
const router = express.Router();

// Wallet endpoints
router.get('/', (req, res) => {
  res.json({ message: "Wallet routes are working!" });
});

router.post('/deposit', (req, res) => {
  res.json({ message: "Deposit request received" });
});

router.post('/withdraw', (req, res) => {
  res.json({ message: "Withdrawal request received" });
});

export default router;
