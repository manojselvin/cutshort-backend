import { Router } from 'express';
import { createTodo, deleteTodo, getTodo, listTodos, updateTodo } from '../controllers/TodoController';

const TodoRoute = Router();

TodoRoute.get('/', listTodos);

TodoRoute.get('/:id', getTodo);

TodoRoute.post('/', createTodo);

TodoRoute.put('/:id', updateTodo);

TodoRoute.delete('/:id', deleteTodo);

export default TodoRoute;