# Vehicle Rental Management System

A backend api service for vehicle rental management system

- [**Live URL**](https://rental-system-blush.vercel.app)
- [**Github URL**](https://github.com/uday-hasan/PH-L2-A2)

## Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- bcryptjs
- jsonwebtoken

## Features

- **User Authentication**: Secure signin and signup with JWT and bcryptjs
- **Vehicle Management**: Add, update, delete and get vehicles and vehicle details
- **Booking Management**: Add, update, delete and get bookings
- **User Management**: Role based management using middleware

## Setup & Usage

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/uday-hasan/PH-L2-A2.git
    cd PH-L2-A2
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configuration:**
    Create a **.env** file in the root directory and add your environment variables (`PORT`, `DATABASE_URL`, `JWT_SECRET`).

4.  **Run the application:**

    ```bash
    # Development
    npm run dev

    # Production
    npm run build
    npm start
    ```

## API Documentation

You can import the [PH-L2-A2.postman_collection.json](https://github.com/uday-hasan/PH-L2-A2/blob/main/PH-L2-A2.postman_collection.json) to check api endpoints.
