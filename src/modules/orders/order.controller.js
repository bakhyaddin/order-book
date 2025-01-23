// services
import orderService from './order.service';

// http response
import { SuccessResponse } from '../../common/api-response';

// errors
import { NotFoundError } from '../../common/api-error';

class OrderController {
  /**
   * Order service instance
   * @type {orderService}
   */
  orderService = undefined;

  /**
   * Order service instance
   * @param {orderService} orderService
   */
  constructor(orderService) {
    this.orderService = orderService;
  }

  /**
   * List all the orders
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async listOrders(req, res) {
    const orders = await this.orderService.list();
    return new SuccessResponse(undefined, orders).send(res);
  }

  /**
   * Get order by id
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async getOrderById(req, res) {
    const order = await this.orderService.getById(req.params['id']);
    if (!order) throw new NotFoundError('Order not found');
    return new SuccessResponse(undefined, order).send(res);
  }

  /**
   * Create order
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async createOrder(req, res) {
    const newOrder = await this.orderService.createOrder(req.body);
    return new SuccessResponse(undefined, newOrder).send(res);
  }

  /**
   * Cancel order
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async cancelOrder(req, res) {
    const updatedOrder = await this.orderService.cancelOrder(req.params['id']);
    return new SuccessResponse(undefined, updatedOrder).send(res);
  }

  /**
   * Delete order
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async deleteOrder(req, res) {
    const deletedOrderNumber = await this.orderService.delete(req.params['id']);
    if (deletedOrderNumber === 0) throw new NotFoundError('Order not found');
    return new SuccessResponse(undefined).send(res);
  }
}

export default new OrderController(orderService);
