import { Comment } from "../db/Comment.js";
import { post } from "../db/Post.js";

export const addComment=async(req,res)=>{
    try{
        const {postId}=req.params;
        const {text}=req.body;
        const userId=req.user._id;

        const comment = await Comment.create({
            post:postId,
            user:userId,
            text
        })

        await post.findByIdAndUpdate(postId, {
            $push: { comments: comment._id }
        });

        const populatedComment = await comment.populate("user", "username profilePic");
        res.status(201).json(populatedComment);
    }catch(err){
        res.status(500).json({error:"could not add a comment"});
    }
}