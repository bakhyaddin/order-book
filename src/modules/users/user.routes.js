import express from 'express';

// common
import { AsyncHandler } from '../../common/async-handler';

// controller
import userController from './user.controller';

const router = express.Router();

router.get(
  '/users',
  AsyncHandler.handle(userController.listUsers.bind(userController))
);
router.get(
  '/user/:id',
  AsyncHandler.handle(userController.getUserById.bind(userController))
);
router.post(
  '/user',
  AsyncHandler.handle(userController.createUser.bind(userController))
);
router.delete(
  '/user/:id',
  AsyncHandler.handle(userController.deleteUser.bind(userController))
);

export default router;
