import { Request, Response } from "express";
import NodeCache from "node-cache";

import Post from "../models/Post";

const postCache = new NodeCache({ stdTTL: 600 });

export const getPost = async (req: Request, res: Response) => {
    const id = req.params.id;

    const post = await Post.findById(id).exec();

    return res.send({
        data: {
            post: post || {}
        }
    });
};

export const listPosts = async (req: Request, res: Response) => {

    const { page = 1, limit = 10 } = req.query;
    
    // eslint-disable-next-line prefer-const
    let query: any = {};

    if (req.query.author) {
        query.author = req.query.author;
    }

    // try to get the posts from the cache
    let posts = postCache.get(JSON.stringify(query)+"allPosts");
    let count = postCache.get(JSON.stringify(query)+"totalPosts") || 0;

    // if posts does not exist in the cache, retrieve it from the
    // original source and store it in the cache
    if (posts == null) {
        count = await Post.countDocuments(query);
        
        posts = await Post.find(query).limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit))
        .exec();

        postCache.set(JSON.stringify(query)+"allPosts", posts, 300);
        postCache.set(JSON.stringify(query)+"totalPosts", count, 300);
    }

    return res.send({
        data: {
            posts: posts,
            totalPages: Math.ceil(Number(count) / Number(limit)),
            currentPage: page
        }
    });
};

export const createPost = async (req: Request, res: Response) => {
    req.body['author'] = req['userId'];

    const post = new Post(req.body);

    await post.save();

    return res.status(201).send({
        data: {
            post: post
        }
    });

};

export const updatePost = async (req: Request, res: Response) => {
   
    const id = req.params.id;

    // eslint-disable-next-line prefer-const
    let query = {
        author: {
            $eq: req['userId']
        }
    };
    
    query['_id'] = id;

    let post = await Post.findOne(query).exec();

    if (!post) {
        return res.status(404).send({
            message: 'Post not found'
        });
    }

    post = await Post.findByIdAndUpdate(id, req.body, {new: true});

    return res.send({
        data: {
            post: post
        }
    });
};

export const deletePost = async (req: Request, res: Response) => {
    const id = req.params.id;

    // eslint-disable-next-line prefer-const
    let query = {
        author: {
            $eq: req['userId']
        }
    };
    
    query['_id'] = id;

    const post = await Post.findOne(query).exec();

    if (!post) {
        return res.status(404).send({
            message: 'Post not found'
        });
    }

    await Post.findByIdAndRemove(id).exec();

    return res.send({
        data: {
            post: id
        }
    });
};