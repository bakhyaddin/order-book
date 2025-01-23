import { Redis } from 'ioredis';
import { RedisConfig } from '../configs/redis.config';

export default new Redis({
  host: RedisConfig.host,
  port: RedisConfig.port,
});
