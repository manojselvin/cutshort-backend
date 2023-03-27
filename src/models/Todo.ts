import mongoose, { Schema } from "mongoose";

export interface ITodo extends mongoose.Document {
    title: string;
    author : string;
    completed: boolean;
	createdAt?: string;
	updatedAt?: string;
}
  
export const TodoSchema = new Schema({
	title: { type:String, required: true },
	author: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    completed: { type: Boolean, default: false }
}, { timestamps: true });
  
const Todo = mongoose.model<ITodo>('Todo', TodoSchema);
export default Todo;