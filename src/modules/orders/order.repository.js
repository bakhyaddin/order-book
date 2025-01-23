import redisClient from '../../providers/redis-client.provider.js';

import { AbstractRepository } from '../../common/database/repository.abstract.js';

export class OrderRepository extends AbstractRepository {
  constructor() {
    super(redisClient, 'orders');
  }
}

export default new OrderRepository();
