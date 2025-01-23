import { Logger } from '../../../src/common/logger';

import { OrderBookService } from '../../../src/modules/order-books/order-book.service';

import { OrderBookingType } from '../../../src/common/enums/order.enum';

jest.mock('ioredis', () => ({
  Redis: jest.fn(),
}));

describe('OrderBookService', () => {
  const orderBookRepository = {
    client: {
      zadd: jest.fn(),
      zrem: jest.fn(),
      zrevrange: jest.fn(),
      zrange: jest.fn(),
    },
  };

  let orderBookService;

  const pair = 'BTC-USD';

  beforeAll(() => {
    orderBookService = new OrderBookService(orderBookRepository);
  });

  beforeEach(() => {
    Logger.info = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrderBookingKey', () => {
    it('should return the correct key for bids', () => {
      const result = orderBookService.getOrderBookingKey(
        pair,
        OrderBookingType.BIDS
      );

      expect(result).toBe(`orderbook:${pair}:bids`);
    });

    it('should return the correct key for asks', () => {
      const result = orderBookService.getOrderBookingKey(
        pair,
        OrderBookingType.ASKS
      );

      expect(result).toBe(`orderbook:${pair}:asks`);
    });
  });

  describe('addBid', () => {
    it('should add a bid to the order book', async () => {
      const orderId = 'order123';
      const price = 50000;

      orderBookRepository.client.zadd = jest.fn().mockResolvedValue();

      await orderBookService.addBid(orderId, price, pair);

      expect(orderBookRepository.client.zadd).toHaveBeenCalledWith(
        `orderbook:${pair}:bids`,
        price,
        orderId
      );
      expect(Logger.info).toHaveBeenCalledWith(
        `New BID is created: \n -order: ${orderId} \n -pair: ${pair} \n -price: ${price}`
      );
    });
  });

  describe('addAsk', () => {
    it('should add an ask to the order book', async () => {
      const orderId = 'order456';
      const price = 50000;

      orderBookRepository.client.zadd = jest.fn().mockResolvedValue();

      await orderBookService.addAsk(orderId, price, pair);

      expect(orderBookRepository.client.zadd).toHaveBeenCalledWith(
        `orderbook:${pair}:asks`,
        price,
        orderId
      );
      expect(Logger.info).toHaveBeenCalledWith(
        `New ASK is created: \n -order: ${orderId} \n -pair: ${pair} \n -price: ${price}`
      );
    });
  });

  describe('removeOrder', () => {
    it('should remove an order from bids and asks', async () => {
      const orderId = 'order123';

      orderBookRepository.client.zrem = jest.fn().mockResolvedValue();

      await orderBookService.removeOrder(orderId, pair);

      expect(orderBookRepository.client.zrem).toHaveBeenCalledTimes(2);
      expect(Logger.info).toHaveBeenCalledWith(
        `Order book(s) removed: \n -order: ${orderId} \n -pair: ${pair} \n -keys: ${[
          `orderbook:${pair}:bids`,
          `orderbook:${pair}:asks`,
        ]}`
      );
    });

    it('should remove an order from only bids', async () => {
      const orderId = 'order123';

      orderBookRepository.client.zrem = jest.fn().mockResolvedValue();

      await orderBookService.removeOrder(orderId, pair, [
        OrderBookingType.BIDS,
      ]);

      expect(orderBookRepository.client.zrem).toHaveBeenCalledWith(
        `orderbook:${pair}:bids`,
        orderId
      );
      expect(orderBookRepository.client.zrem).toHaveBeenCalledTimes(1);
      expect(Logger.info).toHaveBeenCalledWith(
        `Order book(s) removed: \n -order: ${orderId} \n -pair: ${pair} \n -keys: ${[
          `orderbook:${pair}:bids`,
        ]}`
      );
    });
  });

  describe('getBestBid', () => {
    it('should return the best bid', async () => {
      const mockResult = ['order123', '50000'];
      orderBookRepository.client.zrevrange = jest
        .fn()
        .mockResolvedValue(mockResult);

      const result = await orderBookService.getBestBid(pair);

      expect(orderBookRepository.client.zrevrange).toHaveBeenCalledWith(
        `orderbook:${pair}:bids`,
        0,
        0,
        'WITHSCORES'
      );
      expect(result).toEqual({ orderId: 'order123', price: 50000 });
    });

    it('should return null if no bids are found', async () => {
      orderBookRepository.client.zrevrange = jest.fn().mockResolvedValue([]);

      const result = await orderBookService.getBestBid(pair);

      expect(result).toBeNull();
    });
  });

  describe('getBestAsk', () => {
    it('should return the best ask', async () => {
      const mockResult = ['order456', '49000'];
      orderBookRepository.client.zrange = jest
        .fn()
        .mockResolvedValue(mockResult);

      const result = await orderBookService.getBestAsk(pair);

      expect(orderBookRepository.client.zrange).toHaveBeenCalledWith(
        `orderbook:${pair}:asks`,
        0,
        0,
        'WITHSCORES'
      );
      expect(result).toEqual({ orderId: 'order456', price: 49000 });
    });

    it('should return null if no asks are found', async () => {
      orderBookRepository.client.zrange = jest.fn().mockResolvedValue([]);

      const result = await orderBookService.getBestAsk(pair);

      expect(result).toBeNull();
    });
  });

  describe('getTopBids', () => {
    it('should return the top n bids', async () => {
      const mockResult = ['order123', '50000', 'order456', '49000'];
      orderBookRepository.client.zrevrange = jest
        .fn()
        .mockResolvedValue(mockResult);

      const result = await orderBookService.getTopBids(pair, 2);

      expect(orderBookRepository.client.zrevrange).toHaveBeenCalledWith(
        `orderbook:${pair}:bids`,
        0,
        1,
        'WITHSCORES'
      );
      expect(result).toEqual([
        { orderId: 'order123', price: 50000 },
        { orderId: 'order456', price: 49000 },
      ]);
    });
  });

  describe('getTopAsks', () => {
    it('should return the top n asks', async () => {
      const mockResult = ['order789', '48000', 'order456', '49000'];
      orderBookRepository.client.zrange = jest
        .fn()
        .mockResolvedValue(mockResult);

      const result = await orderBookService.getTopAsks(pair, 2);

      expect(orderBookRepository.client.zrange).toHaveBeenCalledWith(
        `orderbook:${pair}:asks`,
        0,
        1,
        'WITHSCORES'
      );
      expect(result).toEqual([
        { orderId: 'order789', price: 48000 },
        { orderId: 'order456', price: 49000 },
      ]);
    });
  });

  describe('_mapWithScores', () => {
    it('should correctly map scores to an array of objects', () => {
      const mockResult = ['order123', '50000', 'order456', '49000'];

      const result = orderBookService._mapWithScores(mockResult);

      expect(result).toEqual([
        { orderId: 'order123', price: 50000 },
        { orderId: 'order456', price: 49000 },
      ]);
    });
  });
});
