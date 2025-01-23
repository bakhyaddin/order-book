import { Logger } from '../../common/logger';
import { CrudService } from '../../common/services/crud.service';

import { UserEntity } from './user.entity';
import userRepository from './user.repository';

export class UserService extends CrudService {
  /**
   * @param {userRepository} userRepository
   */
  constructor(userRepository) {
    super(userRepository);
  }

  /**
   * Create user
   * @returns {Promise<UserEntity>}
   */
  async createUser() {
    const newUserData = new UserEntity();
    return this.repository.save(newUserData.id, newUserData);
  }

  /**
   * Update user balance after trade
   * @param {string} buyerId
   * @param {string} sellerId
   * @param {string} pair
   * @param {number} price
   * @param {number} quantity
   */
  async updateUserBalances(buyerId, sellerId, pair, price, quantity) {
    const buyer = await this.getById(buyerId);
    const seller = await this.getById(sellerId);

    const [base, quote] = pair.split('-');

    // Buyer pays price in USD, gains `quantity` in crypto currency
    buyer[quote] -= price;
    buyer[base] += quantity;

    // Seller pays 'quantity' in crypto currency, gains balance in USD
    seller[base] -= quantity;
    seller[quote] += price;

    await this.repository.save(buyerId, buyer);
    await this.repository.save(sellerId, seller);
    Logger.info(
      `Both user's balance updated: \n -buyer: ${JSON.stringify(buyer)} \n -seller: ${JSON.stringify(seller)}`
    );
  }
}

export default new UserService(userRepository);
