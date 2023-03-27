import request from 'supertest';
import config from '../config';
import {app} from '../index';
import mongoose from 'mongoose';
import { Comment, Post, Todo } from '../models';


mongoose.createConnection(`${config.MONGO_URI}/${config.TEST_DB_NAME}?${config.MONGO_QUERY_OPTIONS}`);

const AUTH_ROUTE = '/api/auth/signin';

const CREDENTIALS_NO_ACCOUNT = {
    "username": "manoj",
    "password": "invalidpassword"
}

const CREDENTIALS_NO_PASSWORD = {
    "username": "admin"
}

const CORRECT_CREDENTIALS = {
    "username": "admin",
    "password": "admin123456"
}

let accessToken = "";
let firstPost = {};
let incompleteTodo = {};

// AuthController - Test Suite

describe('#1. Auth Controller - Test Routes', () => {
  test('should throw error when there is no credentials', async () => {
    const res = await request(app).post(AUTH_ROUTE).send({})
    expect(res.statusCode).toBe(401)
    expect(res.body.message).toBe('User not found!')
  })

  test('should throw error when there is no account', async () => {
    const res = await request(app).post(AUTH_ROUTE).send(CREDENTIALS_NO_ACCOUNT)
    expect(res.statusCode).toBe(401)
    expect(res.body.message).toBe('User not found!')
  })

  test('should throw error when there is account but no password', async () => {
    const res = await request(app).post(AUTH_ROUTE).send(CREDENTIALS_NO_PASSWORD)
    expect(res.statusCode).toBe(401)
    expect(res.body.accessToken).toBe(null)
    expect(res.body.message).toBe('Invalid Password!')
  })
})

describe('#2 Return success, username and accessToken when credential is valid', () => {
  test('should return with username and accessToken when the credentials are valid', async () => {
    const res = await request(app).post(AUTH_ROUTE).send(CORRECT_CREDENTIALS)
    accessToken = res.body.accessToken;
    expect(res.body).toHaveProperty('username')
    expect(res.body).toHaveProperty('accessToken')
    expect(res.body.accessToken).not.toBeNull()
    expect(res.body.refreshToken).not.toBeNull()
  })

  test('should throw error when there is no access token header', async () => {
    const res = await request(app).get(TODO_ROUTE).send()
    expect(res.statusCode).toBe(403)
    expect(res.body.message).toBe("No token provided!")
  })
})

// TodoController - Test Suite
const TODO_ROUTE = '/api/todos';

const todos = [
  {
    "title": "Complete Assignment"
  },
  {
    "title": "Add Test Cases"
  }
]

beforeAll(async () => {
  await Todo.deleteMany({});
  await Post.deleteMany({});
  await Comment.deleteMany({});
})

afterAll(async () => {
  await Todo.deleteMany({});
  await Post.deleteMany({});
  await Comment.deleteMany({});
})

describe('#2. Todo Controller - Test Routes', () => {
  test('Throw error when Todo count > 0', async () => {
    const res = await request(app).get(TODO_ROUTE).set('x-access-token', accessToken).send()
    expect(res.body).toHaveProperty('data')
    expect(res.body.data.todos).toHaveLength(0)
  })

  test('Throw error when create todo 1 fails', async () => {
    const res = await request(app).post(TODO_ROUTE).set('x-access-token', accessToken).send(todos[0])
    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toHaveProperty('todo')
    expect(res.body.data.todo.title).toBe(todos[0].title)
  })

  test('Throw error when create todo 2 fails', async () => {
    const res = await request(app).post(TODO_ROUTE).set('x-access-token', accessToken).send(todos[1])
    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toHaveProperty('todo')
    expect(res.body.data.todo.title).toBe(todos[1].title)
    incompleteTodo = res.body.data.todo;
  })

  test('should throw error when marking todo as complete fails', async () => {
    const res = await request(app).put(TODO_ROUTE+"/"+incompleteTodo['_id']).set('x-access-token', accessToken).send({"completed": true})
    expect(res.statusCode).toBe(200)
    expect(res.body.data.todo.completed).toBe(true)
  })
})

// 3. PostController - Test Suite
const POST_ROUTE = '/api/posts';

const posts = [
  {
    "title": "My First Post",
    "body": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse sed elit in dui ultricies luctus. Proin eu interdum elit, quis ultrices lectus. In at velit nec velit egestas faucibus et eu magna. Donec tempus massa dui, nec rhoncus orci egestas ut. In hac habitasse platea dictumst. Suspendisse accumsan mattis ullamcorper. Integer et tortor eu lacus aliquet volutpat. Donec nec nulla a odio dictum placerat. Praesent mattis urna id risus fringilla porta. Integer mollis congue vulputate. Nullam tempor odio eu erat dictum, eget suscipit orci tristique. Morbi interdum leo mauris, at mollis dui euismod sit amet. Quisque gravida sem id consequat tempus. Proin nunc sem, venenatis sed mollis nec, suscipit nec nisi. Quisque facilisis euismod justo, non molestie nibh gravida nec. Curabitur vitae velit suscipit, vulputate magna at, facilisis ipsum. Mauris et pharetra purus. Ut finibus ex vitae ante elementum imperdiet. Suspendisse ac risus tincidunt, laoreet turpis in, interdum eros. Vivamus posuere sem urna, id gravida felis sollicitudin vel. Vestibulum dapibus ex nibh, et tempor libero finibus ac. Donec cursus, ligula vel semper gravida, nisl arcu molestie nisi, sed tincidunt urna nisi quis tellus. Vivamus commodo bibendum felis iaculis pulvinar. Quisque dapibus eu augue vel ultrices. Vestibulum non interdum enim, sed fermentum sem. Aenean tristique augue id erat accumsan blandit. Vivamus semper ornare felis, a imperdiet tellus interdum a. Quisque viverra nulla id mauris tincidunt fermentum. Aenean egestas feugiat quam, in blandit diam. Vivamus feugiat ante a ex posuere, eget ornare tellus hendrerit. Nam euismod cursus orci eu mattis. Ut aliquam, turpis in eleifend ultricies, enim tellus pellentesque nisl, in placerat quam erat a velit. Duis consectetur eleifend viverra. Donec volutpat congue ante, sagittis egestas dolor vestibulum egestas. Aliquam ultrices pulvinar massa vel ultricies. Mauris id vulputate mi. Vivamus tempus augue arcu. Suspendisse potenti. Vestibulum egestas gravida elit a egestas. Quisque id elit cursus tellus tempor tempor sit amet ut magna. Fusce a hendrerit ipsum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Morbi nec purus odio. Nullam ac lacus ullamcorper tortor fringilla lacinia eget at erat. Mauris ultrices pulvinar est, eget tempor felis tempor condimentum. Fusce turpis diam, pretium vitae diam ut, tempus gravida eros. Nam et arcu id massa pretium dictum. Aenean in fermentum ipsum, at ornare tellus."
  },
  {
    "title": "My Second Post",
    "body": "Second Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse sed elit in dui ultricies luctus. Proin eu interdum elit, quis ultrices lectus. In at velit nec velit egestas faucibus et eu magna. Donec tempus massa dui, nec rhoncus orci egestas ut. In hac habitasse platea dictumst. Suspendisse accumsan mattis ullamcorper. Integer et tortor eu lacus aliquet volutpat. Donec nec nulla a odio dictum placerat. Praesent mattis urna id risus fringilla porta. Integer mollis congue vulputate. Nullam tempor odio eu erat dictum, eget suscipit orci tristique. Morbi interdum leo mauris, at mollis dui euismod sit amet. Quisque gravida sem id consequat tempus. Proin nunc sem, venenatis sed mollis nec, suscipit nec nisi. Quisque facilisis euismod justo, non molestie nibh gravida nec. Curabitur vitae velit suscipit, vulputate magna at, facilisis ipsum. Mauris et pharetra purus. Ut finibus ex vitae ante elementum imperdiet. Suspendisse ac risus tincidunt, laoreet turpis in, interdum eros. Vivamus posuere sem urna, id gravida felis sollicitudin vel. Vestibulum dapibus ex nibh, et tempor libero finibus ac. Donec cursus, ligula vel semper gravida, nisl arcu molestie nisi, sed tincidunt urna nisi quis tellus. Vivamus commodo bibendum felis iaculis pulvinar. Quisque dapibus eu augue vel ultrices. Vestibulum non interdum enim, sed fermentum sem. Aenean tristique augue id erat accumsan blandit. Vivamus semper ornare felis, a imperdiet tellus interdum a. Quisque viverra nulla id mauris tincidunt fermentum. Aenean egestas feugiat quam, in blandit diam. Vivamus feugiat ante a ex posuere, eget ornare tellus hendrerit. Nam euismod cursus orci eu mattis. Ut aliquam, turpis in eleifend ultricies, enim tellus pellentesque nisl, in placerat quam erat a velit. Duis consectetur eleifend viverra. Donec volutpat congue ante, sagittis egestas dolor vestibulum egestas. Aliquam ultrices pulvinar massa vel ultricies. Mauris id vulputate mi. Vivamus tempus augue arcu. Suspendisse potenti. Vestibulum egestas gravida elit a egestas. Quisque id elit cursus tellus tempor tempor sit amet ut magna. Fusce a hendrerit ipsum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Morbi nec purus odio. Nullam ac lacus ullamcorper tortor fringilla lacinia eget at erat. Mauris ultrices pulvinar est, eget tempor felis tempor condimentum. Fusce turpis diam, pretium vitae diam ut, tempus gravida eros. Nam et arcu id massa pretium dictum. Aenean in fermentum ipsum, at ornare tellus."
  }
]

describe('#3. Post Controller - Test Routes', () => {
  test('Throw error when Post count > 0', async () => {
    const res = await request(app).get(POST_ROUTE).set('x-access-token', accessToken).send()
    expect(res.body).toHaveProperty('data')
    expect(res.body.data.posts).toHaveLength(0)
  })

  test('Throw error when create post 1 fails', async () => {
    const res = await request(app).post(POST_ROUTE).set('x-access-token', accessToken).send(posts[0])
    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toHaveProperty('post')
    expect(res.body.data.post.title).toBe(posts[0].title)
    firstPost = res.body.data.post;
  })

  test('Throw error when create post 2 fails', async () => {
    const res = await request(app).post(POST_ROUTE).set('x-access-token', accessToken).send(posts[1])
    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toHaveProperty('post')
    expect(res.body.data.post.title).toBe(posts[1].title)
  })
})

// 4. CommentController - Test Suite
const COMMENT_ROUTE = '/api/comments';

describe('#3. Comment Controller - Test Routes', () => {
  test('Throw error when Comment count > 0', async () => {
    const res = await request(app).get(COMMENT_ROUTE).set('x-access-token', accessToken).send()
    expect(res.body).toHaveProperty('data')
    expect(res.body.data.comments).toHaveLength(0)
  })

  test('Throw error when create comment 1 fails', async () => {
    const res = await request(app).post(COMMENT_ROUTE).set('x-access-token', accessToken).send({
      "postId": firstPost['_id'],
      "body": "My first comment"
    })
    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toHaveProperty('comment')
    expect(res.body.data.comment.body).toBe("My first comment")
  })
})

afterAll((done) => {
  mongoose.connection.close();
  done();
})