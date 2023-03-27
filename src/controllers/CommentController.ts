import { Request, Response } from "express";
import NodeCache from "node-cache";
import { Schema } from "mongoose";

import Comment from "../models/Comment";
import { Post } from "../models";

const commentCache = new NodeCache({ stdTTL: 600 });

export const getComment = async (req: Request, res: Response) => {
    const id = req.params.id;

    const comment = await Comment.findById(id).exec();

    return res.send({
        data: {
            comment: comment || {}
        }
    });
};

export const listComments = async (req: Request, res: Response) => {

    const { page = 1, limit = 10 } = req.query;
    
    // eslint-disable-next-line prefer-const
    let query: any = {};

    if (req.query.author) {
        query.author = req.query.author;
    }

    if (req.query.postId) {
        query.postId = req.query.postId;
    }

    // try to get the comments from the cache
    let comments = commentCache.get(JSON.stringify(query)+"allComments");
    let count = commentCache.get(JSON.stringify(query)+"totalComments") || 0;
   
    // if comments does not exist in the cache, retrieve it from the
    // original source and store it in the cache
    if (comments == null) {

        count = await Comment.countDocuments(query);

        comments = await Comment.find(query).limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit))
        .exec();

        commentCache.set(JSON.stringify(query)+"allComments", comments, 300);
        commentCache.set(JSON.stringify(query)+"totalComments", count, 300);
    }

    return res.send({
        data: {
            comments: comments,
            totalPages: Math.ceil(Number(count) / Number(limit)),
            currentPage: page
        }
    });
};

export const createComment = async (req: Request, res: Response) => {
    req.body['author'] = req['userId'];

    const comment = new Comment(req.body);

    await comment.save();

    await Post.findByIdAndUpdate(req.body.postId, {$push: {comments: comment._id}});

    return res.status(201).send({
        data: {
            comment: comment
        }
    });

};

export const updateComment = async (req: Request, res: Response) => {
   
    const id = req.params.id;

    // eslint-disable-next-line prefer-const
    let query = {
        author: {
            $eq: req['userId']
        }
    };
    
    query['_id'] = id;

    let comment = await Comment.findOne(query).exec();

    if (!comment) {
        return res.status(404).send({
            message: 'Comment not found'
        });
    }

    comment = await Comment.findByIdAndUpdate(id, req.body, {new: true});

    return res.send({
        data: {
            comment: comment
        }
    });
};

export const deleteComment = async (req: Request, res: Response) => {
    const id = req.params.id;

    // eslint-disable-next-line prefer-const
    let query = {
        author: {
            $eq: req['userId']
        }
    };
    
    query['_id'] = id;

    const comment = await Comment.findOne(query).exec();

    if (!comment) {
        return res.status(404).send({
            message: 'Comment not found'
        });
    }

    await Comment.findByIdAndRemove(id).exec();

    await Post.findByIdAndUpdate(comment.postId, {$pull: {comments: comment._id}});

    return res.send({
        data: {
            comment: id
        }
    });
};