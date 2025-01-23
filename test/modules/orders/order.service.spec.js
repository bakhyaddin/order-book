import eventBus from '../../../src/providers/event-bus.provider';
import { Logger } from '../../../src/common/logger';

import { OrderService } from '../../../src/modules/orders/order.service';
import { OrderEntity } from '../../../src/modules/orders/order.entity';

import {
  OrderType,
  OrderStatus,
  OrderBookingType,
} from '../../../src/common/enums/order.enum';
import { NotFoundError, BadRequestError } from '../../../src/common/api-error';

jest.mock('ioredis', () => ({
  Redis: jest.fn(),
}));

describe('OrderService', () => {
  const orderRepository = {
    save: jest.fn(),
    getById: jest.fn(),
  };
  const orderBookService = {
    addBid: jest.fn(),
    addAsk: jest.fn(),
    removeOrder: jest.fn(),
    getBestBid: jest.fn(),
    getBestAsk: jest.fn(),
  };
  const userService = {
    updateUserBalances: jest.fn(),
  };

  let orderService;
  const pair = 'BTC-USD';

  beforeAll(() => {
    orderService = new OrderService(
      orderRepository,
      orderBookService,
      userService
    );
  });

  beforeEach(() => {
    Logger.info = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create a BUY order and add a bid to the order book', async () => {
      const orderToCreate = {
        userId: 'user123',
        pair,
        type: OrderType.BUY,
        price: 50000,
        quantity: 1,
      };
      const createdOrder = {
        id: expect.any(String),
        createdAt: expect.any(Number),
        ...orderToCreate,
        status: OrderStatus.OPEN,
      };

      jest.spyOn(orderBookService, 'addBid').mockResolvedValue();
      jest.spyOn(eventBus, 'emit');

      const result = await orderService.createOrder(orderToCreate);

      expect(orderRepository.save).toHaveBeenCalledWith(
        createdOrder.id,
        createdOrder
      );
      expect(orderBookService.addBid).toHaveBeenCalledWith(
        createdOrder.id,
        50000,
        pair
      );
      expect(Logger.info).toHaveBeenCalledWith(
        `New order is created with the type of ${OrderType.BUY} for the pair of ${pair}`
      );
      expect(eventBus.emit).toHaveBeenCalledWith('order.created', {
        pair,
        event: 'newOrder',
        data: createdOrder,
      });
      expect(result).toEqual(expect.any(OrderEntity));
    });

    it('should create a SELL order and add an ask to the order book', async () => {
      const orderToCreate = {
        userId: 'user123',
        pair,
        type: OrderType.SELL,
        price: 50000,
        quantity: 1,
      };
      const createdOrder = {
        id: expect.any(String),
        createdAt: expect.any(Number),
        ...orderToCreate,
        status: OrderStatus.OPEN,
      };

      jest.spyOn(orderBookService, 'addAsk').mockResolvedValue();
      jest.spyOn(eventBus, 'emit');

      const result = await orderService.createOrder(orderToCreate);

      expect(orderRepository.save).toHaveBeenCalledWith(
        createdOrder.id,
        createdOrder
      );
      expect(orderBookService.addAsk).toHaveBeenCalledWith(
        createdOrder.id,
        50000,
        pair
      );
      expect(Logger.info).toHaveBeenCalledWith(
        `New order is created with the type of ${OrderType.SELL} for the pair of ${pair}`
      );
      expect(eventBus.emit).toHaveBeenCalledWith('order.created', {
        pair,
        event: 'newOrder',
        data: createdOrder,
      });
      expect(result).toEqual(expect.any(OrderEntity));
    });
  });

  describe('cancelOrder', () => {
    it('should cancel an existing order', async () => {
      const existingOrderId = 'order123';
      const existingOrder = {
        id: existingOrderId,
        pair,
        status: OrderStatus.OPEN,
        type: OrderType.BUY,
      };
      const updatedOrder = { ...existingOrder, status: OrderStatus.CANCELLED };

      jest.spyOn(orderRepository, 'getById').mockResolvedValue(existingOrder);
      jest.spyOn(orderRepository, 'save').mockResolvedValue(updatedOrder);
      jest.spyOn(orderBookService, 'removeOrder').mockResolvedValue();
      jest.spyOn(eventBus, 'emit');

      const result = await orderService.cancelOrder(existingOrderId);

      expect(orderRepository.getById).toHaveBeenCalledWith(existingOrderId);
      expect(orderRepository.save).toHaveBeenCalledWith(
        existingOrder.id,
        expect.objectContaining({ status: OrderStatus.CANCELLED })
      );
      expect(orderBookService.removeOrder).toHaveBeenCalledWith(
        existingOrderId,
        pair,
        [OrderBookingType.BIDS]
      );
      expect(Logger.info).toHaveBeenCalledWith(
        `Order is cancelled \n -id: ${existingOrderId}`
      );
      expect(eventBus.emit).toHaveBeenCalledWith(
        'order.cancelled',
        expect.objectContaining({
          pair,
          event: 'cancelOrder',
          data: updatedOrder,
        })
      );
      expect(result).toEqual(updatedOrder);
    });

    it('should throw NotFoundError if order is not found', async () => {
      jest.spyOn(orderRepository, 'getById').mockResolvedValue(null);

      expect(orderService.cancelOrder('invalidOrder')).rejects.toThrow(
        NotFoundError
      );
      expect(orderRepository.getById).toHaveBeenCalledWith('invalidOrder');
    });

    it('should throw BadRequestError if order is already cancelled', async () => {
      const existingOrderId = 'order123';
      const existingOrder = {
        id: existingOrderId,
        pair,
        status: OrderStatus.CANCELLED,
        type: OrderType.BUY,
      };

      jest.spyOn(orderRepository, 'getById').mockResolvedValue(existingOrder);

      await expect(orderService.cancelOrder(existingOrderId)).rejects.toThrow(
        BadRequestError
      );
      expect(orderRepository.getById).toHaveBeenCalledWith(existingOrderId);
    });
  });

  describe('executeTrade', () => {
    it('should match orders and execute trade', async () => {
      const bestBid = { orderId: 'buyOrder123', price: 50000, quantity: 1 };
      const bestAsk = { orderId: 'sellOrder123', price: 50000, quantity: 1 };
      const buyOrder = {
        id: 'buyOrder123',
        price: 50000,
        quantity: 1,
        userId: 'user123',
        status: OrderStatus.OPEN,
      };
      const sellOrder = {
        id: 'sellOrder123',
        price: 50000,
        quantity: 1,
        userId: 'user456',
        status: OrderStatus.OPEN,
      };

      jest.spyOn(orderBookService, 'getBestBid').mockResolvedValue(bestBid);
      jest.spyOn(orderBookService, 'getBestAsk').mockResolvedValue(bestAsk);
      jest.spyOn(orderBookService, 'removeOrder').mockResolvedValue();
      jest.spyOn(orderRepository, 'getById').mockImplementation((id) => {
        if (id === 'buyOrder123') return buyOrder;
        if (id === 'sellOrder123') return sellOrder;
      });
      jest.spyOn(orderRepository, 'save').mockResolvedValue();
      jest.spyOn(userService, 'updateUserBalances').mockResolvedValue();
      jest.spyOn(eventBus, 'emit');

      await orderService.executeTrade(pair);

      expect(orderBookService.getBestBid).toHaveBeenCalledWith(pair);
      expect(orderBookService.getBestAsk).toHaveBeenCalledWith(pair);
      expect(orderBookService.removeOrder).toHaveBeenCalledTimes(2);
      expect(orderRepository.save).toHaveBeenCalledTimes(2);
      expect(userService.updateUserBalances).toHaveBeenCalledWith(
        buyOrder.userId,
        sellOrder.userId,
        pair,
        buyOrder.price,
        buyOrder.quantity
      );
      expect(eventBus.emit).toHaveBeenCalledWith(
        'order.traded',
        expect.objectContaining({ event: 'tradeExecuted' })
      );
    });

    it('should log info if no matching orders are found', async () => {
      jest.spyOn(orderBookService, 'getBestBid').mockResolvedValue(null);
      jest.spyOn(orderBookService, 'getBestAsk').mockResolvedValue(null);

      await orderService.executeTrade(pair);

      expect(Logger.info).toHaveBeenCalledWith(
        expect.stringContaining(`No best bid or ask for pair ${pair}`)
      );
    });
  });
});
