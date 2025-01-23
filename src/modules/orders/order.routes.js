import express from 'express';

// common
import { AsyncHandler } from '../../common/async-handler';

// middlewares
import { ValidationMiddleware } from '../../middlewares/validation.middleware';

// controller
import orderController from './order.controller';

// dtos
import { createOrderValidationRules } from './dto/create-order.dto';

const router = express.Router();

router.get(
  '/orders',
  AsyncHandler.handle(orderController.listOrders.bind(orderController))
);
router.get(
  '/order/:id',
  AsyncHandler.handle(orderController.getOrderById.bind(orderController))
);
router.post(
  '/order',
  ValidationMiddleware.handle(createOrderValidationRules),
  AsyncHandler.handle(orderController.createOrder.bind(orderController))
);
router.post(
  '/order/cancel/:id',
  AsyncHandler.handle(orderController.cancelOrder.bind(orderController))
);
router.delete(
  '/order/:id',
  AsyncHandler.handle(orderController.deleteOrder.bind(orderController))
);

export default router;
