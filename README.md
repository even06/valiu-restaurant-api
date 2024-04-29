# Valiu Restaurant Reservation API

This backend API manages the booking of restaurant tables. It supports checking the availability of tables and booking them based on defined criteria.

## Getting Started

These instructions will get the API up and running on your local machine for development and testing purposes.

### Prerequisites

You will need Node.js, npm, and MySQL installed on your machine.

### Installation

1. **Install Dependencies**
   Navigate to the project directory and run:
   ```bash
   npm install
   ```

2. **Environment Setup**

Create a .env file in the root of your project with the following content:

    ```bash
    DB_HOST=localhost
    DB_USER=yourDatabaseUser
    DB_PASS=yourDatabasePassword
    DB_NAME=valiu_restaurant
    PORT=3000
    ```

3. **Import Database Schema**

Import valiu_restaurant.sql into your database.


### Running the Server

To start the server, run:
   ```bash
   npx ts-node app.ts
   ```

### API Endpoints

- **GET /restaurants** - Retrieves available restaurants based on date and party size.
- **GET /availability/:restaurantId** - Checks table availability for a specific restaurant.
- **POST /book** - Books one or more tables for a specified date at a restaurant.


### Assumptions and Logic

- **Single Timeslot per Day**: Each restaurant only has one timeslot per day for bookings.
- **Table Grouping**: The system allows grouping of smaller tables to accommodate larger parties. If a restaurant has two tables of 2 guests each and a reservation is requested for 4 guests, both tables will be grouped and shown as available.
- **Error Handling**: Basic error handling is implemented on both the frontend and backend. More complex error management is planned for future releases.
- **Dynamic Updates**: After booking, the system requires a refresh to show new availability due to the current state management setup.

### Future Enhancements

- **Multiple Timeslots**: Plan to support multiple booking timeslots per day.
- **Enhanced Table Grouping Controls**: Future versions may allow restrictions on which tables can be grouped.
- **Real-time Data Updates**: Aim to implement WebSocket or similar technology for real-time availability updates.
