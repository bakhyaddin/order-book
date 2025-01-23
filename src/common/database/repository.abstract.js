import { OrderEntity } from '../../modules/orders/order.entity';

export class AbstractRepository {
  /**
   * The Redis client instance.
   * @type {import('../../providers/redis-client.provider').default}
   */
  client = null;

  /**
   * Prefix for the collection in Redis
   * @type {string}
   */
  collectionPrefix = null;

  /**
   * @param {import('../../providers/redis-client.provider').default} redisClient
   * @param {string} collectionPrefix
   */
  constructor(redisClient, collectionPrefix) {
    this.client = redisClient;
    this.collectionPrefix = collectionPrefix;
  }

  /**
   * Retrieves all the data
   * @returns {Promise<Object[]>}
   */
  async list() {
    const keys = await this.client.keys(`${this.collectionPrefix}:*`);
    if (keys && keys.length === 0) return [];
    const values = await this.client.mget(keys);
    return values.map((value) => JSON.parse(value));
  }

  /**
   * Retrieves an item by its id
   * @param {string} id
   * @returns {Promise<Object | null>}
   */
  async getById(id) {
    const data = await this.client.get(`${this.collectionPrefix}:${id}`);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Creates or updates an item
   * @param {string} id
   * @param {object} data
   * @returns {Promise<OrderEntity>}
   */
  async save(id, data) {
    await this.client.set(
      `${this.collectionPrefix}:${id}`,
      JSON.stringify(data)
    );
    return data;
  }

  /**
   * Deletes an item by its id
   * @param {string} id
   * @returns {Promise<number>} - Number of items deleted
   */
  delete(id) {
    return this.client.del(`${this.collectionPrefix}:${id}`);
  }
}
