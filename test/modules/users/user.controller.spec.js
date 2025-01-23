import { UserController } from '../../../src/modules/users/user.controller';

import { SuccessResponse } from '../../../src/common/api-response';
import { NotFoundError } from '../../../src/common/api-error';

jest.mock('ioredis', () => ({
  Redis: jest.fn(),
}));

describe('UserController', () => {
  const userService = {
    list: jest.fn(),
    getById: jest.fn(),
    createUser: jest.fn(),
    delete: jest.fn(),
  };

  let userController;
  let req;
  let res;

  beforeAll(() => {
    userController = new UserController(userService);
  });

  beforeEach(() => {
    req = {
      params: {},
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest
      .spyOn(SuccessResponse.prototype, 'send')
      .mockImplementation((_, data) => ({
        send: jest.fn(() => ({ data })),
      }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listUsers', () => {
    it('should return a list of users', async () => {
      const mockUsers = [{ id: 1, name: 'John Doe' }];
      userService.list.mockResolvedValueOnce(mockUsers);

      await userController.listUsers(req, res);

      expect(userService.list).toHaveBeenCalled();
      expect(SuccessResponse.prototype.send).toHaveBeenCalledWith(res);
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const mockUser = { id: 1, name: 'John Doe' };
      req.params.id = '1';
      userService.getById.mockResolvedValueOnce(mockUser);

      await userController.getUserById(req, res);

      expect(userService.getById).toHaveBeenCalledWith('1');
      expect(SuccessResponse.prototype.send).toHaveBeenCalledWith(res);
    });

    it('should throw NotFoundError if user is not found', async () => {
      req.params.id = '1';
      userService.getById.mockResolvedValueOnce(null);

      expect(userController.getUserById(req, res)).rejects.toThrow(
        NotFoundError
      );
      expect(userService.getById).toHaveBeenCalledWith('1');
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const mockNewUser = { id: 1, name: 'John Doe' };
      userService.createUser.mockResolvedValueOnce(mockNewUser);

      await userController.createUser(req, res);

      expect(userService.createUser).toHaveBeenCalled();
      expect(SuccessResponse.prototype.send).toHaveBeenCalledWith(res);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by ID', async () => {
      req.params.id = '1';
      userService.delete.mockResolvedValueOnce(1);

      await userController.deleteUser(req, res);

      expect(userService.delete).toHaveBeenCalledWith('1');
      expect(SuccessResponse.prototype.send).toHaveBeenCalledWith(res);
    });

    it('should throw NotFoundError if user is not found', async () => {
      req.params.id = '1';
      userService.delete.mockResolvedValueOnce(0);

      expect(userController.deleteUser(req, res)).rejects.toThrow(
        NotFoundError
      );
      expect(userService.delete).toHaveBeenCalledWith('1');
    });
  });
});
