import redisClient from '../../providers/redis-client.provider.js';

import { AbstractRepository } from '../../common/database/repository.abstract.js';

class OrderBookRepository extends AbstractRepository {
  constructor() {
    super(redisClient, 'orderbook');
  }
}

export default new OrderBookRepository();
