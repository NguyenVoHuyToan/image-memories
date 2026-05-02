import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    cloudinary_id: {
      type: String,
    },
    title: {
      type: String,
      default: 'Untitled',
    },
    size: {
      type: Number, // in bytes
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Image || mongoose.model('Image', ImageSchema);
