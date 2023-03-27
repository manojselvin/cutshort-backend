import { NextFunction, Request, Response } from "express";
import jwt, {TokenExpiredError} from "jsonwebtoken";
import _ from "lodash";

import {User} from "../models";
import config from "../config";
import { IUser } from "../models/User";
import { constants } from "../config/constants";

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const token: any = req.headers["x-access-token"] || "";

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, config.SECRET_TOKEN, (err, decoded) => {
    if (err) {
      return catchError(err, res);
    }
    req['userId'] = decoded.id;

    next();
  });
};

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res.status(401).send({ message: "Unauthorized! Access Token was expired!" });
  }

  return res.status(401).send({ message: "Unauthorized!" });
}

const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const user: IUser | null = await User.findById(req['userId']).exec();

    const userRole = _.get(user, 'role', '');

    if (userRole == constants.ROLES.ADMIN) {
        req['isAdmin'] = true;
        next();
    } else {
        return res.status(403).send({ message: "Access Denied! Need Admin role" });
    }   
};

const setResponseAuthHeader = async (req: Request, res: Response, next: NextFunction) => {
  
  res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
  );

  next();
}

export const authJwt = {
  verifyToken,
  isAdmin,
  setResponseAuthHeader
};