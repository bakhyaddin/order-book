import { OrderController } from '../../../src/modules/orders/order.controller';

import { SuccessResponse } from '../../../src/common/api-response';
import { NotFoundError } from '../../../src/common/api-error';

jest.mock('ioredis', () => ({
  Redis: jest.fn(),
}));

describe('OrderController', () => {
  const orderService = {
    list: jest.fn(),
    getById: jest.fn(),
    delete: jest.fn(),
    createOrder: jest.fn(),
    cancelOrder: jest.fn(),
    executeTrade: jest.fn(),
  };

  /** @type {OrderController} */
  let orderController;
  let req;
  let res;

  beforeAll(() => {
    orderController = new OrderController(orderService);
  });

  beforeEach(() => {
    orderController = new OrderController(orderService);

    req = {
      params: {},
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest
      .spyOn(SuccessResponse.prototype, 'send')
      .mockImplementation((_, data) => ({
        send: jest.fn(() => ({ data })),
      }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listOrders', () => {
    it('should return a list of orders', async () => {
      const mockOrders = [{ id: 1, name: 'Order 1' }];
      orderService.list.mockResolvedValue(mockOrders);

      await orderController.listOrders(req, res);

      expect(orderService.list).toHaveBeenCalled();
      expect(SuccessResponse.prototype.send).toHaveBeenCalledWith(res);
    });
  });

  describe('getOrderById', () => {
    it('should return an order by ID', async () => {
      const mockOrder = { id: 1, name: 'Order 1' };
      req.params.id = '1';
      orderService.getById.mockResolvedValue(mockOrder);

      await orderController.getOrderById(req, res);

      expect(orderService.getById).toHaveBeenCalledWith('1');
      expect(SuccessResponse.prototype.send).toHaveBeenCalledWith(res);
    });

    it('should throw NotFoundError if order is not found', async () => {
      req.params.id = '1';
      orderService.getById.mockResolvedValue(null);

      await expect(orderController.getOrderById(req, res)).rejects.toThrow(
        NotFoundError
      );
      expect(orderService.getById).toHaveBeenCalledWith('1');
    });
  });

  describe('createOrder', () => {
    it('should create a new order', async () => {
      const mockNewOrder = { id: 1, name: 'New Order' };
      req.body = { name: 'New Order' };
      orderService.createOrder.mockResolvedValue(mockNewOrder);

      await orderController.createOrder(req, res);

      expect(orderService.createOrder).toHaveBeenCalledWith(req.body);
      expect(SuccessResponse.prototype.send).toHaveBeenCalledWith(res);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel an order by ID', async () => {
      const mockUpdatedOrder = { id: 1, name: 'Order 1', status: 'cancelled' };
      req.params.id = '1';
      orderService.cancelOrder.mockResolvedValue(mockUpdatedOrder);

      await orderController.cancelOrder(req, res);

      expect(orderService.cancelOrder).toHaveBeenCalledWith('1');
      expect(SuccessResponse.prototype.send).toHaveBeenCalledWith(res);
    });
  });

  describe('deleteOrder', () => {
    it('should delete an order by ID', async () => {
      req.params.id = '1';
      orderService.delete.mockResolvedValue(1);

      await orderController.deleteOrder(req, res);

      expect(orderService.delete).toHaveBeenCalledWith('1');
      expect(SuccessResponse.prototype.send).toHaveBeenCalledWith(res);
    });

    it('should throw NotFoundError if order is not found', async () => {
      req.params.id = '1';
      orderService.delete.mockResolvedValue(0);

      await expect(orderController.deleteOrder(req, res)).rejects.toThrow(
        NotFoundError
      );
      expect(orderService.delete).toHaveBeenCalledWith('1');
    });
  });
});
