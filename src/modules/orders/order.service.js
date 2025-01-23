import eventBus from '../../providers/event-bus.provider';
import { Logger } from '../../common/logger';
import { CrudService } from '../../common/services/crud.service';

// entities
import { OrderEntity } from './order.entity';

// repositories
import orderRepository from './order.repository';

// services
import orderBookService from '../order-books/order-book.service';
import userService from '../users/user.service';

// dto
import { CreateOrderDTO } from './dto/create-order.dto';

// enums
import {
  OrderBookingType,
  OrderStatus,
  OrderType,
} from '../../common/enums/order.enum';

// errors
import { BadRequestError, NotFoundError } from '../../common/api-error';

export class OrderService extends CrudService {
  /**
   * Order repository instance
   * @type {orderBookService}
   */
  orderBookService = undefined;

  /**
   * User service instance
   * @type {userService}
   */
  userService = undefined;

  /**
   * @param {orderRepository} orderRepository
   * @param {orderBookService} orderBookService
   * @param {userService} userService
   */
  constructor(orderRepository, orderBookService, userService) {
    super(orderRepository);
    this.orderBookService = orderBookService;
    this.userService = userService;
  }

  /**
   * Create order
   * @param {CreateOrderDTO} order
   * @returns {Promise<OrderEntity>}
   */
  async createOrder({ userId, pair, type, price, quantity }) {
    const newOrder = new OrderEntity({
      userId,
      pair,
      type,
      price,
      quantity,
    });
    await this.repository.save(newOrder.id, newOrder);

    if (type === OrderType.BUY) {
      await this.orderBookService.addBid(newOrder.id, price, pair);
    } else {
      await this.orderBookService.addAsk(newOrder.id, price, pair);
    }

    Logger.info(
      `New order is created with the type of ${type} for the pair of ${pair}`
    );

    this.executeTrade(pair);

    eventBus.emit('order.created', {
      pair,
      event: 'newOrder',
      data: newOrder,
    });

    return newOrder;
  }

  /**
   * Cancel order
   * @param {string} id
   * @returns {Promise<OrderEntity>}
   */
  async cancelOrder(id) {
    const existingOrder = await this.repository.getById(id);
    if (!existingOrder) throw new NotFoundError('Order not found');
    if (existingOrder.status === OrderStatus.CANCELLED)
      throw new BadRequestError('Order is already cancelled');

    // update the original order
    const updatedOrder = await this.repository.save(existingOrder.id, {
      ...existingOrder,
      status: OrderStatus.CANCELLED,
    });

    // remove the order from the orderbook cache
    await this.orderBookService.removeOrder(
      updatedOrder.id,
      updatedOrder.pair,
      [
        existingOrder.type === OrderType.BUY
          ? OrderBookingType.BIDS
          : OrderBookingType.ASKS,
      ]
    );

    Logger.info(`Order is cancelled \n -id: ${id}`);

    eventBus.emit('order.cancelled', {
      pair: existingOrder.pair,
      event: 'cancelOrder',
      data: updatedOrder,
    });

    return updatedOrder;
  }

  /**
   * Handles everything if purchase happens
   * @param {string} pair
   */
  async executeTrade(pair) {
    const bestBid = await this.orderBookService.getBestBid(pair);
    const bestAsk = await this.orderBookService.getBestAsk(pair);

    if (!bestBid || !bestAsk) {
      Logger.info(`No best bid or ask for pair ${pair}`);
      return;
    }

    Logger.info(`Best Bid: ${JSON.stringify(bestBid)}`);
    Logger.info(`Best Ask: ${JSON.stringify(bestAsk)}`);

    if (
      bestBid.price >= bestAsk.price &&
      bestBid.quantity === bestAsk.quantity
    ) {
      Logger.info(`Orders matched! bid=${bestBid.price}, ask=${bestAsk.price}`);

      // remove them from the order book
      await this.orderBookService.removeOrder(bestBid.orderId, pair);
      await this.orderBookService.removeOrder(bestAsk.orderId, pair);
      Logger.info('Both order books removed from the cache');

      // update statuses of the original orders
      const buyOrder = await this.repository.getById(bestBid.orderId);
      const sellOrder = await this.repository.getById(bestAsk.orderId);

      buyOrder.status = OrderStatus.FILLED;
      sellOrder.status = OrderStatus.FILLED;

      await this.repository.save(buyOrder.id, buyOrder);
      await this.repository.save(sellOrder.id, sellOrder);
      Logger.info('Both orders marked as "filled"');

      // update user balances
      const tradePrice = buyOrder.price;
      const tradeQuantity = buyOrder.quantity;
      await this.userService.updateUserBalances(
        buyOrder.userId,
        sellOrder.userId,
        pair,
        tradePrice,
        tradeQuantity
      );

      eventBus.emit('order.traded', {
        pair: buyOrder.pair,
        event: 'tradeExecuted',
        data: {
          buyOrderId: buyOrder.id,
          sellOrderId: sellOrder.id,
          tradePrice,
          tradeQuantity,
        },
      });
    } else {
      Logger.info(
        `Orders did match! bid=${bestBid.price}, ask=${bestAsk.price}`
      );
    }
  }
}

export default new OrderService(orderRepository, orderBookService, userService);
