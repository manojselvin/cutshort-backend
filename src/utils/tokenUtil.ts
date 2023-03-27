import jwt from 'jsonwebtoken';
import config from '../config';
import bcrypt from "bcryptjs";

export const signJwtToken = async (userId) => {
  const token = jwt.sign({ id: userId }, config.SECRET_TOKEN, {
    expiresIn: Number(config.TOKEN_EXPIRY) // 24 hours
  });

  return token;
};

export const isPasswordValid = async (reqBodyPassword, savedPassword) => {
  return bcrypt.compareSync(reqBodyPassword, savedPassword);
};