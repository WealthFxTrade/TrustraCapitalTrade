import KYC from '../models/KYC.js';

export const submitKyc = async (req, res) => {
  try {
    const { documentType, documentNumber } = req.body;
    const userId = req.user._id;

    // Check if files exist in the request
    if (!req.files || !req.files.frontImage || !req.files.selfieImage) {
      return res.status(400).json({ success: false, message: 'Identity nodes missing' });
    }

    const kycRecord = await KYC.create({
      user: userId,
      documentType,
      documentNumber,
      frontImage: req.files.frontImage[0].path,
      selfieImage: req.files.selfieImage[0].path,
      backImage: req.files.backImage ? req.files.backImage[0].path : null,
      status: 'pending'
    });

    res.status(201).json({ success: true, message: 'Identity transmitted successfully', kycRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

