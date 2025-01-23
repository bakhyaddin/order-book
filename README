# Order Book Service

## Overview

This project delivers a robust, real-time order book management system tailored for cryptocurrency exchanges. Designed with performance, scalability, and maintainability in mind, the system enables users to manage and subscribe to updates for specific cryptocurrency pairs via WebSocket connections. By leveraging Redis for caching and persistence, the platform ensures efficient data handling and high availability. The application follows strict Object-Oriented Programming (OOP) principles, employs modular design patterns, and includes comprehensive test coverage using Jest to ensure code reliability.

- **NOTE:** For simplicity, this service does not support partial order fulfillment. Both the price and quantity of buy and sell orders must match exactly for a trade to be executed.

## Key Features

- Order Book Management: Separate, real-time order books are maintained for multiple cryptocurrency pairs, with bids sorted in descending order and asks sorted in ascending order.
- WebSocket Communication: Users can connect to the platform and subscribe to specific cryptocurrency pairs, receiving real-time updates on new orders, cancellations, and trades.
- Order Actions: The system supports essential order functionalities, including:
  - Adding buy/sell orders.
  - Cancelling existing orders.
  - Executing trades between matching orders.
- Redis Integration: Redis is used for caching and persistence, ensuring fast access and reliability across operations.
- REST API: Users interact with the system primarily through a REST API for creating and managing orders.

## Entities

### User

- **id** (Primary Key)
- createdAt
- BTC
- ETH
- LTC
- XRP
- BCH
- USD

### Order

- **id** (Primary Key)
- createdAt
- userId
- pair (BTC-USD, ETH-USD...)
- type (buy or sell)
- price (amount in USD)
- quantity (quantity of crypto currency)
- status (open, cancelled, filled)

### Order Book (Redis Sordet Set)

| **Key**              | **Score (Price)** | **Member (Order ID)** |
| -------------------- | ----------------- | --------------------- |
| `orderbook:BTC:asks` | 20000.50          | `order1`              |
| `orderbook:BTC:bids` | 19999.00          | `order2`              |
| `orderbook:ETH:asks` | 1500.75           | `order3`              |
| `orderbook:LTC:asks` | 75.25             | `order4`              |

## Order Book Flow

```mermaid
flowchart TD
    A[Start: Create Order] --> B{Order Type}
    B -- Buy --> C[Add BID: orderId, price, pair]
    B -- Sell --> D[Add ASK: orderId, price, pair]
    C --> E[Execute Trade for Pair]
    D --> E
    E --> F{Best Bid & Best Ask Available?}
    F -- No --> G[End]
    F -- Yes --> H{Do Prices Match?}
    H -- No --> G
    H -- Yes --> I{Do Quantities Match?}
    I -- No --> G
    I -- Yes --> J[Remove Orders from Order Book]
    J --> K[Update Orders to Filled]
    K --> L[Save Updated Orders]
    L --> M[Update User Balances]
    M --> N[Emit Trade Event]
    N --> G

```

## Instructions

### Bringing up Docker containers

1. Ensure that Docker and Docker Compose are installed on your local machine.
2. In the root directory of the project run the following commands in the terminal to bring up the Docker containers:

```bash
docker-compose build
docker-compose up
```

These commands will initialize and start the containers defined in the `docker-compose.yml` file.

### Connect to the WebSocket server

- Run `node ./src/ws-client.js` as many connections as you would like.

### Using the API

1. Import the attached postman collection `./postman_collection.json`.
2. Locate the `POST` user endpoint and create users more than one.
3. Locate the `POST` order endpoint and create orders according to the given example as the following.
4. If the conditions match, the trade will happen and subscribed users will be notified via WebSocket.

#### Create Order Body

```json
{
  "userId": "63351cac-1c71-4f64-bb67-7ee88d7f3d05", // this ID must correspond to a valid user entry stored in Redis.
  "pair": "BTC-USD",
  "type": "buy", // buy or sell
  "price": 1000,
  "quantity": 1
}
```

## Folder Structure

- src/

  - common/
    - database
    - enums
    - services
    - api-error.js
    - api-response.js
    - ...
  - config/
    - app.config.js
    - redis.config.js
  - middlewares
    - api-logger.middleware.js
    - ...
  - modules/
    - order/
      - order.entity.js
      - order.repository.js
      - order.controller.js
      - order.service.js
      - dto
        - create-order.dto.js
    - order-book
      - order-book.repository.js
      - order-book.service.js
    - user
      - ...
  - providers/
    - event-bus.provider.js
    - redis-client.provider.js
    - web-socket.provider.js

- **Common**: This directory contains common utilities and functionalities used across the application. It promotes code reusability and follows the DRY (Don't Repeat Yourself) principle. Organizing enums, constants, and services here helps in maintaining consistency and reducing duplication of code.

- **Config**: Configuration files are centralized in this directory, making it easier to manage application settings. Separating configuration concerns from the rest of the codebase allows for easier modification and customization of settings without altering application logic. Additionally, having separate configuration files for different aspects of the application, such as database and application, promotes modularity and clarity.

- **Middlewares**: This directory holds middleware files such as api-logger, error interceptor.

- **Modules**: Entities are organized into separate folders within the modules directory, following a modular structure. Each entity folder contains files responsible for handling busines related operations for that entity: entity definition, repository, service, and controller. This organization pattern promotes separation of concerns and enhances maintainability by encapsulating related functionality within each entity.

- **Providers**: Connection-related logic, such as database connection handling, is centralized in this directory. Providers abstract away the details of establishing connections and managing configurations, making it easier to switch between different providers or configurations. This pattern follows the Dependency Injection principle, allowing for loose coupling and improved testability.

## Testing Approach

### Purpose

The primary goal of the testing phase was to ensure that individual components and functionalities of the system operate as expected in isolation and when integrated. The focus was on validating both the WebSocket connection and the trading flow to ensure seamless real-time updates and accurate order matching.

### Scope

- **WebSocket Connection Tests**:

  - Validated the system's ability to handle client subscriptions and unsubscriptions to cryptocurrency pairs.
  - Ensured that real-time updates, such as new orders or trades, were successfully broadcast to subscribed clients.
  - Tested the end-to-end flow of message broadcasting and event handling via WebSocket.

- **Trade Flow Tests**:
  - Ensured that orders were correctly created, saved, and updated within the system.
  - Validated the execution of trades, including matching bids and asks, removing orders from the order book, and marking them as "filled."
  - Verified that user balances were updated correctly upon successful trade execution.
  - Tested the handling of edge cases, such as orders with mismatched prices or quantities.

### Implementation

- **Tools**:

  - Used **Jest** as the testing framework to perform unit and integration tests.
  - Mocked dependencies like repositories, services, and event emitters to isolate components during testing.

- **WebSocket Tests**:

  - Simulated client connections using the `socket.io-client` library.
  - Tested broadcasting mechanisms by emitting events on the event bus and verifying message delivery to subscribed clients.

- **Order Service Tests**:
  - Mocked dependencies such as the order book service, user service, and repository to test order creation, cancellation, and trade execution.
  - Verified correct event emissions, such as `order.created`, `order.cancelled`, and `order.traded`.
  - Tested error handling for cases like invalid orders or attempts to cancel already filled orders.

### Examples

- **WebSocket Broadcasting**:

  - Clients subscribing to specific pairs received relevant updates when a new order was created.
  - Subscriptions and unsubscriptions were handled gracefully, ensuring that only active clients received updates.

- **Trade Execution**:
  - Successfully matched orders based on price and quantity.
  - Updated the statuses of matched orders and removed them from the order book.
  - Verified accurate balance updates for the buyer and seller.
