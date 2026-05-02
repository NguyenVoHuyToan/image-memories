import mongoose from 'mongoose';

const AlbumSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      default: 'New Album',
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        title: { type: String, default: 'Untitled' },
        createdAt: { type: Date, default: Date.now },
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Album || mongoose.model('Album', AlbumSchema);
