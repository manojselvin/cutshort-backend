import { Router } from 'express';

import { AuthController } from "../controllers";
import { verifySignUp } from "../middlewares";

const AuthRoute = Router();

AuthRoute.post("/signup",
  [
    verifySignUp.checkDuplicateUsernameOrEmail,
    verifySignUp.checkRolesExisted
  ],
  AuthController.signup
);

AuthRoute.post("/signin", AuthController.signin);
AuthRoute.post("/refreshtoken", AuthController.refreshToken);

export default AuthRoute;