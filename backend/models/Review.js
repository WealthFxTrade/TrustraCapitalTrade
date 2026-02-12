import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: [true, 'Review must belong to a user'] 
    },
    rating: { 
      type: Number, 
      min: 1, 
      max: 5, 
      required: [true, 'Please provide a rating between 1 and 5'] 
    },
    comment: { 
      type: String, 
      required: [true, 'Review comment cannot be empty'], 
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      trim: true
    },
  },
  { 
    timestamps: true 
  }
);

// This check prevents Mongoose from trying to compile the model twice 
// which often happens in development environments like Nodemon
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default Review;

