import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendVerificationEmail } from '../utils/email.js';
import { generateUserAddress } from '../utils/bitcoin.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// REGISTER
router.post('/register', async (req,res)=>{
  const { fullName, email, password } = req.body;
  try {
    if(!fullName || !email || !password) return res.status(400).json({success:false, message:'All fields required'});
    if(password.length<8) return res.status(400).json({success:false,message:'Password ≥ 8 characters'});

    const exists = await User.findOne({email});
    if(exists) return res.status(400).json({success:false,message:'Email exists'});

    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 24*60*60*1000;

    const lastUser = await User.findOne().sort({btcIndex:-1});
    const index = lastUser ? lastUser.btcIndex + 1 : 0;

    const btcAddress = generateUserAddress(index);

    const user = new User({
      fullName,email,password,verificationToken:token,
      verificationTokenExpires:expires,
      btcIndex:index,
      btcAddress
    });
    await user.save();
    await sendVerificationEmail(user,token);

    res.status(201).json({success:true,message:'Account created. Check email for verification.'});
  } catch(err){
    console.error(err);
    res.status(500).json({success:false,message:'Server error'});
  }
});

// VERIFY EMAIL
router.get('/verify-email/:token', async (req,res)=>{
  try{
    const user = await User.findOne({verificationToken:req.params.token, verificationTokenExpires:{$gt:Date.now()}});
    if(!user) return res.status(400).json({success:false,message:'Invalid or expired token'});
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    res.json({success:true,message:'Email verified.'});
  } catch(err){console.error(err);res.status(500).json({success:false,message:'Server error'})}
});

// LOGIN
router.post('/login', async (req,res)=>{
  const { email,password } = req.body;
  try{
    const user = await User.findOne({email}).select('+password');
    if(!user) return res.status(401).json({success:false,message:'Invalid credentials'});
    if(!user.isVerified) return res.status(403).json({success:false,message:'Verify email first'});
    const match = await bcrypt.compare(password,user.password);
    if(!match) return res.status(401).json({success:false,message:'Invalid credentials'});

    const token = jwt.sign({id:user._id,email:user.email,role:user.role},process.env.JWT_SECRET,{expiresIn:'30d'});
    res.json({success:true, token, user:{id:user._id,fullName:user.fullName,email:user.email,plan:user.plan,btcAddress:user.btcAddress}});
  } catch(err){console.error(err); res.status(500).json({success:false,message:'Server error'})}
});

export default router;
