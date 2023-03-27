import { Router } from 'express';
import { createComment, deleteComment, getComment, listComments, updateComment } from '../controllers/CommentController';

const CommentRoute = Router();

CommentRoute.get('/', listComments);

CommentRoute.get('/:id', getComment);

CommentRoute.post('/', createComment);

CommentRoute.put('/:id', updateComment);

CommentRoute.delete('/:id', deleteComment);

export default CommentRoute;