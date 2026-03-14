# 🍽️ Bhojan QR

**Bhojan QR** is a QR-based digital restaurant ordering system that allows customers to scan a QR code on the table, browse the menu, place orders, and pay digitally without waiting for a waiter.

The platform helps restaurants automate operations, reduce order errors, and improve the overall dining experience.

---

# 🌐 Live Demo

Try the live application here:

👉 https://bhojanqr-1-client.onrender.com/

---

# 🚀 Features

- 📱 QR Based Menu Access
- 🍔 Digital Menu Browsing
- 🧾 Real-time Order Placement
- 👨‍🍳 Kitchen Dashboard
- 💳 Digital Billing & Payment
- 📊 Restaurant Analytics
- ⚙️ Admin Panel for Restaurant Management

---

# 🏗️ System Architecture

```
Customer Phone (QR Scan)
        │
        ▼
   React Frontend
        │
        ▼
 Node.js / Express API
        │
        ▼
     MongoDB Database
        │
        ▼
 Kitchen & Admin Dashboard
```

---

# 🛠️ Tech Stack

## Frontend

- React.js
- HTML5
- CSS3
- JavaScript
- Chart.js

## Backend

- Node.js
- Express.js

## Database

- MongoDB

## Search & Optimization

- Elasticsearch

## Tools

- Git
- npm
- Postman
- Docker (optional)

---

# 📦 Installation Guide

Follow these steps to run the project on your local machine.

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/bhojan-qr.git
cd bhojan-qr
```

## 2️⃣ Install Dependencies

### Frontend

```bash
cd frontend
npm install
```

### Backend

```bash
cd backend
npm install
```

---

## 3️⃣ Environment Variables

Create a `.env` file inside the **backend folder**

Example:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/bhojanqr
JWT_SECRET=your_secret_key
ELASTICSEARCH_URL=http://localhost:9200
```

---

## 4️⃣ Run MongoDB

Make sure MongoDB is running locally.

```bash
mongod
```

---

## 5️⃣ Start Backend Server

```bash
cd backend
npm start
```

Backend will run on:

```
http://localhost:5000
```

---

## 6️⃣ Start Frontend

```bash
cd frontend
npm start
```

Frontend will run on:

```
http://localhost:3000
```

---

# 📲 How Bhojan QR Works

1. Customer scans QR code on the table
2. Digital menu opens on their phone
3. Customer selects food items
4. Order is sent directly to the kitchen dashboard
5. Restaurant processes the order
6. Customer pays digitally

---

# 📂 Project Structure

```
bhojan-qr
│
├── frontend
│   ├── src
│   ├── components
│   ├── pages
│   └── utils
│
├── backend
│   ├── controllers
│   ├── routes
│   ├── models
│   ├── middleware
│   └── server.js
│
├── database
├── docs
└── README.md
```

---

# 📊 Future Enhancements

- AI Food Recommendation
- Table Reservation System
- Inventory Management
- Multi-restaurant Support
- Advanced Sales Analytics
- Mobile App Integration

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature-new-feature
```

3. Commit your changes

```bash
git commit -m "Added new feature"
```

4. Push to branch

```bash
git push origin feature-new-feature
```

5. Open a Pull Request

---

# 📜 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

**Bishwa Bandhu Parmar**

If you like this project, please ⭐ the repository.
