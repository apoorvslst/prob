import mongoose, { Schema } from 'mongoose';

const postSchema = new Schema({
    description: {
        type: String,
    },
    media: [
        {
            url: { type: String, required: true },
            mediaType: { type: String, enum: ['image', 'video'], required: true }
        }
    ],
    category: {
        type: String,
        enum: ["fun", "study", "travel", "fashion", "food", "fitness", "other"],
        default: "other"
    },
    postType: {
        type: String,
        enum: ["post", "reel"],
        default: "post"
    },
    likedBy: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]

}, { timestamps: true });

postSchema.pre('validate', function () {
    if (!this.description && (!this.media || this.media.length === 0)) {
        this.invalidate('description', 'A post must have either a description or media files.');
    }
});

export const Post = mongoose.model("Post", postSchema);