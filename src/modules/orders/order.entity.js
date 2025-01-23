import { AbstractEntity } from '../../common/database/entity.abstract';
import { OrderStatus } from '../../common/enums/order.enum';

export class OrderEntity extends AbstractEntity {
  userId = null;
  pair = null;
  type = null;
  price = null;
  quantity = null;
  status = OrderStatus.OPEN;

  /**
   * @param {OrderEntity} order
   */
  constructor(order) {
    super();
    Object.assign(this, order);
  }
}
