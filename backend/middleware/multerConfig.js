import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import pkg from 'multer-storage-cloudinary';

// Handle the nested export structure
const CloudinaryStorage = pkg.CloudinaryStorage || pkg;

// 🛰️ Initialization Node
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'trustra_kyc_vault',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export default upload;

