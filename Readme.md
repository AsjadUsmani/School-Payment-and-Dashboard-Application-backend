Here is a ✅ fully improved and professional `README.md` for your project, formatted exactly as you requested, including all routes and clear structure 🌟

---

````md
# School Payment & Dashboard Backend

## ✅ Project Description
This is a backend microservice for a School Payment & Dashboard application.  
Built using **Node.js**, **Express**, and **MongoDB Atlas**.  
Handles user authentication, payment creation, webhook handling, and transaction management.

---

## ✅ Tech Stack
- Node.js  
- Express.js  
- MongoDB Atlas  
- JWT Authentication  
- Axios (for Payment API integration)  
- Helmet + CORS (for security)  
- express-validator (for data validation)  

---

## ✅ Setup & Installation

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/school-payment-backend.git
cd school-payment-backend
````

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Create Environment Variables

Create a `.env` file in the project root based on the following template:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret
API_KEY=your_payment_api_key
PG_KEY=your_payment_pg_key
SCHOOL_ID=65b0e6293e9f76a9694d84b4
CLIENT_URL=https://your-frontend-url.com
```

---

### 4️⃣ Start Development Server

```bash
npm run dev
```

Server runs at:

```bash
http://localhost:3000
```

---

## ✅ API Usage Examples

---

### 1️⃣ Register User

* Method: POST
* URL: `/api/auth/register`
* Body (JSON):

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

---

### 2️⃣ Login User

* Method: POST
* URL: `/api/auth/login`
* Body (JSON):

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

---

### 3️⃣ Logout User

* Method: GET
* URL: `/api/auth/logout`

---

### 4️⃣ Create Payment

* Method: POST
* URL: `/create-payment`
* Headers:

  * Cookie: `token=<jwt_token>`
* Body (JSON):

```json
{
  "school_id": "65b0e6293e9f76a9694d84b4",
  "trustee_id": "trustee123",
  "student_info": { "name": "John Doe", "id": "S1234", "email": "john@example.com" },
  "gateway_name": "PhonePe",
  "amount": 20000,
  "callback_url": "https://your-frontend.com/payment-success"
}
```

---

### 5️⃣ Webhook Handling

* Method: POST
* URL: `/webhook`
* Body (JSON):

```json
{
  "status": 200,
  "order_info": {
    "order_id": "<collect_request_id>",
    "order_amount": 20000,
    "transaction_amount": 20000,
    "gateway": "PhonePe",
    "bank_reference": "YESBNK222",
    "status": "success",
    "payment_mode": "upi",
    "payment_details": "success@ybl",
    "payment_message": "payment success",
    "payment_time": "2025-04-23T08:14:21.945+00:00",
    "error_message": "NA"
  }
}
```

---

### 6️⃣ Fetch All Transactions

* Method: GET
* URL:

```
/transactions?limit=10&page=1&sort=payment_time&order=desc
```

---

### 7️⃣ Fetch Transactions by School

* Method: GET
* URL:

```
/transactions/school/:schoolId
```

Example:

```
/transactions/school/65b0e6293e9f76a9694d84b4
```

---

### 8️⃣ Check Transaction Status

* Method: GET
* URL:

```
/transaction-status/:custom_order_id
```

Example:

```
/transaction-status/6808bc4888e4e3c149e757f1
```

---

## ✅ Postman Collection

👉 (Optional: Provide link to the exported Postman Collection for easier testing)

---

## ✅ Deployment URL

After deployment, the live backend URL will be something like:

```
https://school-payment-backend.herokuapp.com
```

---

## ✅ Notes

* Make sure to use proper environment variables in production.
* HTTPS is enabled by default on Heroku.
* Ensure your frontend communicates with the deployed backend domain using `CLIENT_URL`.

---
