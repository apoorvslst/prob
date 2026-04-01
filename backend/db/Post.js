import mongoose, { Schema } from 'mongoose';

const postSchema=new Schema({
    description: {
        type: String,
    },
    photo: {
        type: String,
    },
    likedBy: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true
    },
    comments:[
        {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]

},{timestamps:true});

postSchema.pre('validate', function(next) {
    if (!this.description && !this.photo) {
        this.invalidate('description', 'A post must have either a description or a photo.');
    }
});

export const post=mongoose.model("Post",postSchema);