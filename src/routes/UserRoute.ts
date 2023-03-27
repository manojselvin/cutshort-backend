import { Router } from 'express';
import { createUser, deleteUser, getUser, listUsers, updateUser } from '../controllers/UserController';
import { authJwt } from '../middlewares';

const UserRoute = Router();

UserRoute.get('/', authJwt.isAdmin, listUsers);

UserRoute.get('/:id', authJwt.isAdmin, getUser);

UserRoute.post('/', authJwt.isAdmin, createUser);

UserRoute.put('/:id', authJwt.isAdmin, updateUser);

UserRoute.delete('/:id', authJwt.isAdmin, deleteUser);

export default UserRoute;