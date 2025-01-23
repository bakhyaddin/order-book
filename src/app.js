import express from 'express';
import { createServer } from 'http';

// providers
import eventBus from './providers/event-bus.provider';
import { WebSocketProvider } from './providers/web-socket.provider';

// middlewares
import { ApiLogger } from './middlewares/api-logger.middleware';
import { ErrorHandler } from './middlewares/error-handler.middleware';

// routes
import userRoutes from './modules/users/user.routes';
import orderRoutes from './modules/orders/order.routes';

// errors
import { NotFoundError } from './common/api-error';

export class App {
  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandler();
  }

  setupMiddlewares() {
    this.app.use(express.json());
    this.app.use(ApiLogger.requestLogger);
    this.app.use(ApiLogger.responseLogger);
  }

  setupRoutes() {
    this.app.use(userRoutes, orderRoutes);

    // catch 404 and forward to error handler
    this.app.use((req, res, next) =>
      next(new NotFoundError(`${req.path} path is not found`))
    );
  }

  setupErrorHandler() {
    this.app.use(ErrorHandler.handle);
  }

  start(port) {
    const server = createServer(this.app);
    new WebSocketProvider(server, eventBus);

    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }
}
