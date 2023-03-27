import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import _ from "lodash";

import { User, Role, RefreshToken } from "../models";

import { constants } from "../config/constants";
import { isPasswordValid, signJwtToken } from "../utils/tokenUtil";

export const signup = async (req: Request, res: Response) => {

    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        phone: req.body.phone,
        name: req.body.name
    });

    await user.save().then(async () => {
        if (req.body.roles) {
            const roles = await Role.find({
                name: { $in: req.body.roles }
            });

            if (roles.length <= 0) {
                res.status(500).send({ message: "Invalid Roles!" });
            }

            user.roles = roles.map(role => role._id);

            await user.save().then(() => {
                res.send({ message: "User was registered successfully!" });
            }).catch(err => {
                console.log(err);
                res.status(500).send({ message: err });
                return;
            });
        } else {
            const role = await Role.findOne({ name: constants.ROLES.USER }).exec();

            if(!role) {
                res.status(500).send({ message: "Role not found!" });
            }
            
            user.roles = [_.get(role, '_id')];

            await user.save().then(() => {
                res.send({ message: "User was registered successfully!" });
            }).catch(err => {
                res.status(500).send({ message: err });
                return;
            });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).send({ message: err });
        return;
    });
};

export const signin = async (req: Request, res: Response) => {

    const user = await User.findOne({ username: req.body.username}).populate("roles", "-__v").exec();

    if (!user) {
        return res.status(401).send({ message: "User not found!" });
    }

    if (!req.body.password) {
        return res.status(401).send({ accessToken: null, message: "Invalid Password!" });
    }

    const passwordIsValid = isPasswordValid(req.body.password, user.password);
            
    if (!passwordIsValid) {
        return res.status(401).send({
            accessToken: null,
            message: "Invalid Password!"
        });
    }

    const token = await signJwtToken(user.id);

    const refreshToken = await RefreshToken.createToken(user.id);

    // eslint-disable-next-line prefer-const
    let authorities: any = [];

    for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i]['name'].toUpperCase());
    }

    res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: authorities,
        accessToken: token,
        refreshToken: refreshToken
    });
};

export const refreshToken = async (req, res) => {
    const { refreshToken: requestToken } = req.body;
  
    if (requestToken == null) {
      return res.status(403).json({ message: "Refresh Token is required!" });
    }
  
    try {
      const refreshToken = await RefreshToken.findOne({ token: requestToken });
  
      if (!refreshToken) {
        res.status(403).json({ message: "Refresh token is not in database!" });
        return;
      }
  
      if (RefreshToken.verifyExpiration(refreshToken)) {
        RefreshToken.findByIdAndRemove(refreshToken._id, { useFindAndModify: false }).exec();
        
        res.status(403).json({
          message: "Refresh token was expired. Please make a new signin request",
        });
        return;
      }
  
      const newAccessToken = await signJwtToken(refreshToken.user['_id']);
  
      return res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: refreshToken.token
      });
    } catch (err) {
      return res.status(500).send({ message: err });
    }
  };