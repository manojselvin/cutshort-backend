import mongoose, { Schema } from "mongoose";

export interface IUser extends mongoose.Document {
	name: string; 
	email: string; 
	username: string;
	password: string;
	phone: string;
	roles: string[];
	createdAt?: string;
	updatedAt?: string;
}
  
export const UserSchema = new mongoose.Schema({
	name: {type:String, required: true},
	email: {type:String, required: true},
	username: {type:String, required: true},
	password: {type:String, required: true},
	phone: {type:String, required: true},
	roles: [
		{
			type: Schema.Types.ObjectId,
			ref: "Role"
		}
	]
}, { timestamps: true });   
  
  const User = mongoose.model<IUser>('User', UserSchema);
 export default User;