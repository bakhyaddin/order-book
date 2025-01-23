export class RedisConfig {
  /**
   * @returns {string}
   */
  static get host() {
    return process.env.REDIS_HOST;
  }

  /**
   * @returns {string}
   */
  static get port() {
    return process.env.REDIS_PORT || '6379';
  }
}
