import { v4 as uuidv4 } from 'uuid';
import mongoose, { Model, Schema } from "mongoose";

import config from "../config";

export interface IRefreshToken extends mongoose.Document {
    token: string;
	user: string;
    expiryDate: Date;
    createdAt?: string;
	updatedAt?: string;
}

interface RefreshTokenModel extends Model<IRefreshToken> {
    createToken(string): string;
    verifyExpiration(string): boolean;
  }
  
export const RefreshTokenSchema = new Schema({
	token: { type:String, required: true },
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    expiryDate: { type: Date, required: true }
}, { timestamps: true });

RefreshTokenSchema.statics.createToken = async function (userId) {
  const expiredAt = new Date();

  expiredAt.setSeconds(
    expiredAt.getSeconds() + Number(config.REFRESH_TOKEN_EXPIRY)
  );

  const _token = uuidv4();

  const _object = new this({
    token: _token,
    user: userId,
    expiryDate: expiredAt.getTime(),
  });

  console.log(_object);

  const refreshToken = await _object.save();

  return refreshToken.token;
};

RefreshTokenSchema.statics.verifyExpiration = (token) => {
  return token.expiryDate.getTime() < new Date().getTime();
}

const RefreshToken = mongoose.model<IRefreshToken, RefreshTokenModel>('RefreshToken', RefreshTokenSchema);

export default RefreshToken;