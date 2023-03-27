import mongoose, { Schema } from "mongoose";

export interface IComment extends mongoose.Document {
    body: string;
    author : string;
    postId : string;
	createdAt?: string;
	updatedAt?: string;
}
  
export const CommentSchema = new Schema({
	body: { type:String, required: true },
	author: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
	postId: { type: Schema.Types.ObjectId, required: true, ref: 'Post' }
}, { timestamps: true });   
  
const Comment = mongoose.model<IComment>('Comment', CommentSchema);
export default Comment;