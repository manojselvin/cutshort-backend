import mongoose, { Schema } from "mongoose";

export interface IRole extends mongoose.Document {
    name: string;
	createdAt?: string;
	updatedAt?: string;
}
  
export const RoleSchema = new Schema({
	name: { type:String, required: true }
}, { timestamps: true });
  
const Role = mongoose.model<IRole>('Role', RoleSchema);
export default Role;