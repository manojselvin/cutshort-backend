import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import { constants } from "../config/constants";

const checkDuplicateUsernameOrEmail = async (req: Request, res: Response, next: NextFunction) => {
    let user = await User.findOne({ username: req.body.username }).exec();

    if (user) {
        return res.status(400).json({ error: "Failed! Username is already in use!" });
    }

    user = await User.findOne({ email: req.body.email }).exec();
   
    if (user) {
        return res.status(400).send({ message: "Failed! Email is already in use!" });
    }

    next();
};
  
const checkRolesExisted = async (req: Request, res: Response, next: NextFunction) => {

    if (req.body.roles) {

        req.body.roles.map((role: string) => {
            
            if (!Object.values(constants.ROLES).includes(role)) {
                return res.status(400).json({ error: "Failed! Role is invalid!" });
            }

        });
    }

    next();
};
  
export const verifySignUp = {
    checkDuplicateUsernameOrEmail,
    checkRolesExisted
};