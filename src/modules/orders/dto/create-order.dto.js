import { body } from 'express-validator';

import { OrderPair, OrderType } from '../../../common/enums/order.enum';

export class CreateOrderDTO {
  userId;
  pair;
  type;
  price;
  quantity;
}

export const createOrderValidationRules = [
  body('userId')
    .isUUID()
    .withMessage('userId must be a valid UUID')
    .notEmpty()
    .withMessage('userId is required'),

  body('pair')
    .isIn(Object.values(OrderPair))
    .withMessage(`pair must be one of ${Object.values(OrderPair)}`)
    .notEmpty()
    .withMessage('pair is required'),

  body('type')
    .isIn(Object.values(OrderType))
    .withMessage(`type must be one of ${Object.values(OrderType)}`)
    .notEmpty()
    .withMessage('type is required'),

  body('price')
    .isFloat({ gt: 0 })
    .withMessage('price must be a positive number')
    .notEmpty()
    .withMessage('price is required'),

  body('quantity')
    .isFloat({ gt: 0 })
    .withMessage('quantity must be a positive number')
    .notEmpty()
    .withMessage('quantity is required'),
];
