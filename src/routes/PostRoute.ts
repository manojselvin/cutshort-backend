import { Router } from 'express';
import { createPost, deletePost, getPost, listPosts, updatePost } from '../controllers/PostController';

const PostRoute = Router();

PostRoute.get('/', listPosts);

PostRoute.get('/:id', getPost);

PostRoute.post('/', createPost);

PostRoute.put('/:id', updatePost);

PostRoute.delete('/:id', deletePost);

export default PostRoute;