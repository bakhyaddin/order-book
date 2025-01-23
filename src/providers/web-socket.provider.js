import { Server as SocketIOServer } from 'socket.io';

import { Logger } from '../common/logger';

export class WebSocketProvider {
  /**
   * @type {SocketIOServer}
   */
  io = null;

  /**
   * Creates a new WebSocketProvider
   * @param {import('http').Server} server
   * @param {import('./event-bus.provider')} eventBus
   */
  constructor(server, eventBus) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
    Logger.info('Socket.IO server initialized.');

    this.io.on('connection', (socket) => this.handleConnection(socket));

    // listen to events from the event bus
    eventBus.on('order.created', (message) => {
      this.handleEvent(message);
    });
    eventBus.on('order.cancelled', (message) => {
      this.handleEvent(message);
    });
    eventBus.on('order.traded', (message) => {
      this.handleEvent(message);
    });
  }

  /**
   * Handle events received from the event bus
   * @param {Object} message - The event message
   */
  handleEvent(message) {
    const { pair, event, data } = message;
    this.io.to(pair).emit(event, { data, timestamp: Date.now() });
  }

  /**
   * Handles a new client connection
   * @param {SocketIO.Socket} socket
   */
  handleConnection(socket) {
    Logger.info('New client connected:', socket.id);

    socket.on('subscribe', (pair) => {
      this.subscribeClient(socket, pair);
    });

    socket.on('unsubscribe', (pair) => {
      this.unsubscribeClient(socket, pair);
    });

    socket.on('disconnect', () => {
      Logger.info(`Client disconnected: ${socket.id}`);
    });
  }

  /**
   * Subscribes a client to a specific pair (room)
   * @param {SocketIO.Socket} socket
   * @param {string} pair
   */
  subscribeClient(socket, pair) {
    socket.join(pair);
    Logger.info(`Client ${socket.id} subscribed to ${pair}`);
    socket.emit('subscribed', { pair });
  }

  /**
   * Unsubscribes a client from a specific pair (room)
   * @param {SocketIO.Socket} socket
   * @param {string} pair
   */
  unsubscribeClient(socket, pair) {
    socket.leave(pair);
    Logger.info(`Client ${socket.id} unsubscribed from ${pair}`);
    socket.emit('unsubscribed', { pair });
  }
}
