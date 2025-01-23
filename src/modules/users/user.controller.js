// services
import userService from './user.service';

// response
import { SuccessResponse } from '../../common/api-response';

// errors
import { NotFoundError } from '../../common/api-error';

export class UserController {
  /**
   * @type {userService}
   */
  userService = undefined;

  /**
   * @param {userService} userService
   */
  constructor(userService) {
    this.userService = userService;
  }

  /**
   * List all the users
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async listUsers(req, res) {
    const users = await this.userService.list();
    return new SuccessResponse(undefined, users).send(res);
  }

  /**
   * Get user by id
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async getUserById(req, res) {
    const user = await this.userService.getById(req.params['id']);
    if (!user) throw new NotFoundError('User not found');
    return new SuccessResponse(undefined, user).send(res);
  }

  /**
   * Create User
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async createUser(req, res) {
    const newUser = await this.userService.createUser();
    return new SuccessResponse(undefined, newUser).send(res);
  }

  /**
   * Delete User
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async deleteUser(req, res) {
    const deletedUserNumber = await this.userService.delete(req.params['id']);
    if (deletedUserNumber === 0) throw new NotFoundError('User not found');
    return new SuccessResponse(undefined).send(res);
  }
}

export default new UserController(userService);
