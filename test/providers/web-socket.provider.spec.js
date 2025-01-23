import { Server as HttpServer } from 'http';
import Client from 'socket.io-client';
import { EventEmitter } from 'events';

import { WebSocketProvider } from '../../src/providers/web-socket.provider';

describe('WebSocketProvider', () => {
  /**
   * @type {HttpServer}
   */
  let httpServer;
  /**
   * @type {EventEmitter.EventEmitter}
   */
  let eventBus;
  /**
   * @type {import('socket.io').Server";}
   */
  let ioServer;
  /**
   * @type {WebSocketProvider}
   */
  let webSocketProvider;

  const serverPort = 5555;

  beforeAll((done) => {
    httpServer = new HttpServer();
    eventBus = new EventEmitter();

    webSocketProvider = new WebSocketProvider(httpServer, eventBus);

    ioServer = webSocketProvider.io;
    httpServer.listen(serverPort, done);
  });

  afterAll(() => {
    ioServer.close();
    httpServer.close();
    eventBus.removeAllListeners();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should broadcast a message to subscribed clients', (done) => {
    const testPair = 'BTC-USD';
    const testEvent = 'order.created';
    const testData = { orderId: '123', price: 50000 };

    const clientSocket = Client(`http://localhost:${serverPort}`);
    clientSocket.on('connect', () => {
      clientSocket.emit('subscribe', testPair);

      clientSocket.on('subscribed', (message) => {
        expect(message.pair).toBe(testPair);

        eventBus.emit(testEvent, {
          pair: testPair,
          event: testEvent,
          data: testData,
        });
      });

      clientSocket.on(testEvent, (message) => {
        expect(message.data).toEqual(testData);
        expect(message.timestamp).toBeDefined();
        clientSocket.close();
        done();
      });
    });
  });

  it('should allow clients to subscribe and unsubscribe from rooms', (done) => {
    const testPair = 'ETH-USD';

    const clientSocket = Client(`http://localhost:${serverPort}`);
    clientSocket.on('connect', () => {
      clientSocket.emit('subscribe', testPair);

      clientSocket.on('subscribed', (message) => {
        expect(message.pair).toBe(testPair);

        clientSocket.emit('unsubscribe', testPair);

        clientSocket.on('unsubscribed', (unsubMessage) => {
          expect(unsubMessage.pair).toBe(testPair);
          clientSocket.close();
          done();
        });
      });
    });
  });
});
