import { Request, Response } from "express";
import Todo from "../models/Todo";
import NodeCache from "node-cache";

const todoCache = new NodeCache({ stdTTL: 600 });

export const getTodo = async (req: Request, res: Response) => {
    // eslint-disable-next-line prefer-const
    let query = {
        author: {
            $eq: req['userId']
        }
    };

    query['_id'] = req.params.id;

    const todo = await Todo.findOne(query).exec();

    return res.send({
        data: {
            todo: todo || {}
        }
    });
};

export const listTodos = async (req: Request, res: Response) => {

    const { page = 1, limit = 10 } = req.query;
    
    // eslint-disable-next-line prefer-const
    let query: any = {};

    if (req.query.author) {
        query.author = req['userId'];
    }

    // try to get the todos from the cache
    let todos = todoCache.get(JSON.stringify(query)+"allTodos");
    let count = todoCache.get(JSON.stringify(query)+"totalTodos") || 0;

    // if todos does not exist in the cache, retrieve it from the
    // original source and store it in the cache
    if (todos == null) {
        count = await Todo.countDocuments(query);

        todos = await Todo.find(query).limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit))
        .exec();

        todoCache.set(JSON.stringify(query)+"allTodos", todos, 300);
        todoCache.set(JSON.stringify(query)+"totalTodos", count, 300);
    }

    return res.send({
        data: {
            todos: todos,
            totalPages: Math.ceil(Number(count) / Number(limit)),
            currentPage: page
        }
    });
};

export const createTodo = async (req: Request, res: Response) => {
    req.body['author'] = req['userId'];

    const todo = new Todo(req.body);

    await todo.save();

    return res.status(201).send({
        data: {
            todo: todo
        }
    });

};

export const updateTodo = async (req: Request, res: Response) => {
   
    const id = req.params.id;

    // eslint-disable-next-line prefer-const
    let query = {
        author: {
            $eq: req['userId']
        }
    };
    
    query['_id'] = id;

    let todo = await Todo.findOne(query).exec();

    if (!todo) {
        return res.status(404).send({
            message: 'Todo not found'
        });
    }

    todo = await Todo.findByIdAndUpdate(id, req.body, {new: true});

    return res.send({
        data: {
            todo: todo
        }
    });
};

export const deleteTodo = async (req: Request, res: Response) => {
    const id = req.params.id;

    // eslint-disable-next-line prefer-const
    let query = {
        author: {
            $eq: req['userId']
        }
    };
    
    query['_id'] = id;

    const todo = await Todo.findOne(query).exec();

    if (!todo) {
        return res.status(404).send({
            message: 'Todo not found'
        });
    }

    await Todo.findByIdAndRemove(id).exec();

    return res.send({
        data: {
            todo: id
        }
    });
};