import { Request, Response } from "express";
import User from "../models/User";
import NodeCache from "node-cache";

const userCache = new NodeCache({ stdTTL: 600 });

export const getUser = async (req: Request, res: Response) => {
    // eslint-disable-next-line prefer-const
    let query = {};

    query['_id'] = req['isAdmin'] ? req.params.id : req['userId'];

    const user = await User.findOne(query).exec();

    return res.send({
        data: {
            user: user || {}
        }
    });
};

export const listUsers = async (req: Request, res: Response) => {

    const { page = 1, limit = 10 } = req.query;
    
    // eslint-disable-next-line prefer-const
    let query: any = {};

    if (req.query.author) {
        query.author = req['userId'];
    }

    // try to get the users from the cache
    let users = userCache.get(JSON.stringify(query)+"allUsers");
    let count = userCache.get(JSON.stringify(query)+"totalUsers") || 0;

    // if users does not exist in the cache, retrieve it from the
    // original source and store it in the cache
    if (users == null) {
        count = await User.countDocuments(query);

        users = await User.find(query).limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit))
        .exec();

        userCache.set(JSON.stringify(query)+"allUsers", users, 300);
        userCache.set(JSON.stringify(query)+"totalUsers", count, 300);
    }

    return res.send({
        data: {
            users: users,
            totalPages: Math.ceil(Number(count) / Number(limit)),
            currentPage: page
        }
    });
};

export const createUser = async (req: Request, res: Response) => {

    const user = new User(req.body);

    await user.save();

    return res.status(201).send({
        data: {
            user: user
        }
    });

};

export const updateUser = async (req: Request, res: Response) => {
   
    const id = req['isAdmin'] ? req.params.id : req['userId'];

    // eslint-disable-next-line prefer-const
    let query = {};
    
    query['_id'] = id;

    let user = await User.findOne(query).exec();

    if (!user) {
        return res.status(404).send({
            message: 'User not found'
        });
    }

    user = await User.findByIdAndUpdate(id, req.body, {new: true});

    return res.send({
        data: {
            user: user
        }
    });
};

export const deleteUser = async (req: Request, res: Response) => {
    const id = req['isAdmin'] ? req.params.id : req['userId'];

    // eslint-disable-next-line prefer-const
    let query = {};
    
    query['_id'] = id;

    const user = await User.findOne(query).exec();

    if (!user) {
        return res.status(404).send({
            message: 'User not found'
        });
    }

    await User.findByIdAndRemove(id).exec();

    return res.send({
        data: {
            user: id
        }
    });
};