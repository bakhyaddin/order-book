import { UserService } from '../../../src/modules/users/user.service';
import { UserEntity } from '../../../src/modules/users/user.entity';

import { Logger } from '../../../src/common/logger';

jest.mock('ioredis', () => ({
  Redis: jest.fn(),
}));

describe('UserService', () => {
  const userRepository = {
    save: jest.fn(),
    getById: jest.fn(),
  };
  const logger = {
    info: jest.fn(),
  };

  /** @type {UserService} */
  let userService;

  beforeAll(() => {
    userService = new UserService(userRepository);
  });

  beforeEach(() => {
    Logger.info = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create and save a new user', async () => {
      const mockUser = new UserEntity();
      userRepository.save.mockResolvedValueOnce(mockUser);

      const result = await userService.createUser();

      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUserBalances', () => {
    it('should update buyer and seller balances correctly', async () => {
      const buyerId = 'buyer123';
      const sellerId = 'seller123';
      const pair = 'BTC-USD';
      const price = 50000;
      const quantity = 1;

      const mockBuyer = { id: buyerId, BTC: 0, USD: 60000 };
      const mockSeller = { id: sellerId, BTC: 2, USD: 10000 };

      userRepository.getById.mockImplementation((id) => {
        if (id === buyerId) return mockBuyer;
        if (id === sellerId) return mockSeller;
      });

      const updatedBuyer = { id: buyerId, BTC: 1, USD: 10000 };
      const updatedSeller = { id: sellerId, BTC: 1, USD: 60000 };

      userRepository.save.mockResolvedValueOnce(updatedBuyer);
      userRepository.save.mockResolvedValueOnce(updatedSeller);

      await userService.updateUserBalances(
        buyerId,
        sellerId,
        pair,
        price,
        quantity
      );

      expect(userRepository.getById).toHaveBeenCalledWith(buyerId);
      expect(userRepository.getById).toHaveBeenCalledWith(sellerId);

      expect(userRepository.save).toHaveBeenCalledWith(buyerId, updatedBuyer);
      expect(userRepository.save).toHaveBeenCalledWith(sellerId, updatedSeller);

      expect(Logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Both user's balance updated")
      );
    });
  });
});
