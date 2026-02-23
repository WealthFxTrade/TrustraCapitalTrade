import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

/**
 * Trustra Capital - Secure File Uplink (2026)
 * Configures storage and validation for sensitive KYC documents.
 */

// 1. Define storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/kyc/'); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    // Generate a random 16-char hex name to prevent original filename leaks
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `node_${uniqueSuffix}${ext}`);
  }
});

// 2. File Filter: Only allow high-res images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const isExtValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const isMimeValid = allowedTypes.test(file.mimetype);

  if (isExtValid && isMimeValid) {
    cb(null, true);
  } else {
    cb(new Error('Invalid document format. Only JPG/PNG accepted.'), false);
  }
};

// 3. Initialize Multer
export const uploadKyc = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit per document
});

