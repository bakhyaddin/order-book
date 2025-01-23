import redisClient from '../../providers/redis-client.provider.js';

import { AbstractRepository } from '../../common/database/repository.abstract';

class UserRepository extends AbstractRepository {
  constructor() {
    super(redisClient, 'user');
  }
}

export default new UserRepository();
