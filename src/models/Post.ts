import mongoose, { Schema } from "mongoose";

export interface IPost extends mongoose.Document {
    title: string;
    body: string;
    author : string;
    comments?: string[];
	createdAt?: string;
	updatedAt?: string;
}
  
export const PostSchema = new Schema({
	title: { type:String, required: true },
	body: { type:String, required: true },
	author: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    comments: [{ type:  Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true });   
  
  const Post = mongoose.model<IPost>('Post', PostSchema);
  export default Post;