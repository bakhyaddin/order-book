import { Logger } from '../../common/logger';

// repositories
import orderBookRepository from './order-book.repository';

// enums
import { OrderBookingType } from '../../common/enums/order.enum';

export class OrderBookService {
  /**
   * Order Book repository instance
   * @type {orderBookRepository}
   */
  orderBookRepository = undefined;

  /**
   * Order Book repository instance
   * @param {orderBookRepository} orderBookRepository
   */
  constructor(orderBookRepository) {
    this.orderBookRepository = orderBookRepository;
  }

  /**
   * Retrives order booking type
   * @param {string} pair
   * @param {string} orderBookingType
   */
  getOrderBookingKey(pair, orderBookingType) {
    return {
      [OrderBookingType.BIDS]: `orderbook:${pair}:bids`,
      [OrderBookingType.ASKS]: `orderbook:${pair}:asks`,
    }[orderBookingType];
  }

  /**
   * Add a buy order (bid)
   * @param {string} orderId
   * @param {number} price
   * @param {string} pair
   */
  async addBid(orderId, price, pair) {
    const bidsKey = this.getOrderBookingKey(pair, OrderBookingType.BIDS);
    await this.orderBookRepository.client.zadd(bidsKey, price, orderId);
    Logger.info(
      `New BID is created: \n -order: ${orderId} \n -pair: ${pair} \n -price: ${price}`
    );
  }

  /**
   * Add a sell order (ask)
   * @param {string} orderId
   * @param {number} price
   * @param {string} pair
   */
  async addAsk(orderId, price, pair) {
    const asksKey = this.getOrderBookingKey(pair, OrderBookingType.ASKS);
    await this.orderBookRepository.client.zadd(asksKey, price, orderId);
    Logger.info(
      `New ASK is created: \n -order: ${orderId} \n -pair: ${pair} \n -price: ${price}`
    );
  }

  /**
   * Remove an order from either bids or asks OR both
   * @param {string} orderId
   * @param {string} pair
   * @param {string[]} orderBookingType
   */
  async removeOrder(
    orderId,
    pair,
    orderBookingTypes = [OrderBookingType.BIDS, OrderBookingType.ASKS]
  ) {
    const keys = orderBookingTypes.map((orderBookingType) =>
      this.getOrderBookingKey(pair, orderBookingType)
    );
    await Promise.all(
      keys.map((key) => this.orderBookRepository.client.zrem(key, orderId))
    );
    Logger.info(
      `Order book(s) removed: \n -order: ${orderId} \n -pair: ${pair} \n -keys: ${keys}`
    );
  }

  /**
   * Get the best (highest) bid
   * @param {string} pair
   */
  async getBestBid(pair) {
    const bidsKey = `orderbook:${pair}:bids`;
    const result = await this.orderBookRepository.client.zrevrange(
      bidsKey,
      0,
      0,
      'WITHSCORES'
    );
    if (result.length === 0) return null;

    return {
      orderId: result[0],
      price: parseFloat(result[1]),
    };
  }

  /**
   * Get the best (lowest) ask
   * @param {string} pair
   */
  async getBestAsk(pair) {
    const asksKey = `orderbook:${pair}:asks`;
    const result = await this.orderBookRepository.client.zrange(
      asksKey,
      0,
      0,
      'WITHSCORES'
    );
    if (result.length === 0) return null;

    return {
      orderId: result[0],
      price: parseFloat(result[1]),
    };
  }

  /**
   * Get top n bids (highest to lowest)
   * @param {string} pair
   * @param {number} n
   */
  async getTopBids(pair, n = 10) {
    const bidsKey = `orderbook:${pair}:bids`;
    const result = await this.orderBookRepository.client.zrevrange(
      bidsKey,
      0,
      n - 1,
      'WITHSCORES'
    );
    return this._mapWithScores(result);
  }

  /**
   * Get top n asks (lowest to highest)
   * @param {string} pair
   * @param {number} n
   */
  async getTopAsks(pair, n = 10) {
    const asksKey = `orderbook:${pair}:asks`;
    const result = await this.orderBookRepository.client.zrange(
      asksKey,
      0,
      n - 1,
      'WITHSCORES'
    );
    return this._mapWithScores(result);
  }

  /**
   * Helper function to map order book results
   * @param {Array} result
   * @returns {Array<{ orderId: string, price: number }>}
   */
  _mapWithScores(result) {
    const items = [];
    for (let i = 0; i < result.length; i += 2) {
      items.push({
        orderId: result[i],
        price: parseFloat(result[i + 1]),
      });
    }
    return items;
  }
}

export default new OrderBookService(orderBookRepository);
