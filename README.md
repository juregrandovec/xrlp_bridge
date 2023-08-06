# XRPL bridge


This is a simple Wallet API that allows users to manage their wallets, track incoming and outcoming transactions and perform transactions on the XRP Ledger.

## Prerequisites

Before running the API, ensure you have the following installed on your system:

- Node.js (v14 or higher)
- Docker and Docker Compose (optional, required if you want to run the API with Docker)

To use and test this API the api requires you to use a XRPL wallet credentials which you can generate [HERE](https://xrpl.org/xrp-testnet-faucet.html).

By default in .env.example file the `XRPL_WSS_URL` points to XRPL Testnet url. 

## Getting Started

1. Install dependencies:
   * `npm install`

## Running with Docker

If you want to run the API using Docker, follow these steps:

1. Build the Docker image:
   * `docker-compose build`
  
2. Start the Docker image services:
   * `docker-compose up`

3. Keep an eye out for console output logs as they should be usefull when testing the application

 The API should now be running at `http://localhost:3000`.

## Running Tests

To run the tests, execute the following command:
   * `npm test`


# API

## Postman Collection

### [Postman Collection](https://api.postman.com/collections/13468044-a1ab7a04-96f9-43bc-9145-c1eb41617229?access_key=PMAT-01H75D9TH47ASG4X8XAMXDKDTY)

The API tesing environment is available in Postman. You can import the provided Postman collection to explore and interact with the API.

Before starting:
1. run `/auth/login` first, to programatically set the `{{AUTH_TOKEN}}` variable with the value from the response.



## Authentication

The API uses JSON Web Tokens (JWT) for authentication. To access protected endpoints, you need to obtain a JWT token by making a `POST` request to `/auth/login` with valid credentials. The token will be returned in the response, and you should include it in the `Authorization` header of subsequent requests.

  * ### Login credentials are irrelevant as /auth/login will mock a user and return a JWT token.

## Endpoints

### 1. Login

* URL: `POST /auth/login`
* Any login credentials will be accepted.

Request Body:

```json
{
    "username": "admin",
    "password": "password"
}
```
Response:
```json
{
  "token": "your-access-token"
}
```

### 2. Get All Wallets
* URL: `GET /wallets`
* Authentication: Required
* Description: Returns an array of all wallets associated with the authenticated user.

### 3. Get Wallet by ID
* URL: `GET /wallets/:id`
* Authentication: Required
* Description: Returns the wallet with the specified ID.

### 4. Create Wallet
* URL: `POST /wallets`
* Authentication: Required
* Description: Creates a new wallet for the authenticated user.
  
Request Body:
```json
{
  "address": "your-wallet-address",
  "seed": "your-wallet-seed"
}
```

### 5. Update Wallet
* URL: `PUT /wallets/:id`
* Authentication: Required
* Description: Updates the wallet with the specified ID.
  
Request Body:
```json
{
  "address": "new-wallet-address",
  "seed": "new-wallet-seed"
}
```

### 6. Delete Wallet
* URL: `DELETE /wallets/:id`
* Authentication: Required
* Description: Deletes the wallet with the specified ID.

### 7. Create Payment
* URL: `POST /wallets/:id/payment`
* Authentication: Required
* Description: Creates a payment from the wallet with the specified ID to the provided destination address.
  
Request Body:
```json
{
  "destinationAddress": "recipient-address",
  "xrpAmount": 10
}
```


## License
This project is licensed under the MIT License.