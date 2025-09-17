# sayakahwin Merchant UI

This is the merchant UI for sayakahwin.

## Local Development

To get started with local development, follow these steps:

1.  Install the dependencies:
    ```bash
    npm install
    ```

2.  Start the development server:
    ```bash
    npm start
    ```

The application will be available at `http://localhost:5173`.

## Running in Production (Docker)

To run the application in a production environment using Docker, follow these steps:

1.  Build and start the services:
    ```bash
    docker-compose up -d --build
    ```

The application will be available at `http://localhost:3005`.
To stop the services, run:
    ```bash
    docker-compose down
    ```
