import { Router } from 'express';

import PostRoute from './PostRoute';
import TodoRoute from './TodoRoute';
import UserRoute from './UserRoute';
import CommentRoute from './CommentRoute';
import AuthRoute from './AuthRoute';
import { authJwt } from '../middlewares';

const routes = Router();

routes.use('/users', authJwt.verifyToken, UserRoute);
routes.use('/posts', authJwt.verifyToken, PostRoute);
routes.use('/todos', authJwt.verifyToken, TodoRoute);
routes.use('/comments', authJwt.verifyToken, CommentRoute);
routes.use('/auth', authJwt.setResponseAuthHeader, AuthRoute);

export default routes;
