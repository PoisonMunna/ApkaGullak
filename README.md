# ApkaGullak — Modern Bank Management System

ApkaGullak is a fully-featured, full-stack conceptual banking application featuring a dynamic user experience, an administrative backend, and a unique offline-fallback capability that synchronizes with a MySQL database. It smoothly simulates the real-world flow of a banking environment while offering a highly responsive, premium UI.

## 🚀 Features  

- **Dual-Mode Architecture:** Operates online directly with a MySQL Express backend, and cleanly falls back to a highly reliable `localStorage` structure if the server goes offline.
- **Admin Dashboard:** Access detailed transaction charts, grant loans, review account ledgers, securely freeze/unfreeze accounts, and credit/debit customer balances directly.
- **Customer Portal:** Minimalist design to cleanly manage personal finances. Review transaction history, manage loans, execute instant P2P transfers, and update personal profiles.
- **Automated Fraud Detection:** Identifies suspicious account actions or abnormally large transactions in real time, automatically flagging them for admin review.
- **Smart Theming:** Automatically switches between curated Dark and Light modes based on personal preference, leveraging pure CSS variables seamlessly.
- **Elegant Interactions:** Polished, lightweight micro-animations built entirely with CSS to ensure a tactile, responsive user journey.

## 🛠️ Technology Stack

- **Frontend:** Vanilla JavaScript, HTML5, Custom pure CSS (Responsive design), [Lucide Icons](https://lucide.dev/), and [Chart.js](https://www.chartjs.org/) for data dashboarding.
- **Backend:** Node.js framework utilizing [Express.js](https://expressjs.com/) and CORS middleware.
- **Database:** Standard SQL using [MySQL2](https://www.npmjs.com/package/mysql2) with managed connection pooling.

## 📦 Getting Started

### 1. Prerequisites 
Ensure you have Node.js and a MySQL database server installed on your machine.

### 2. Setup
Clone the repository to your machine, jump into the directory, and install dependencies:

```bash
git clone <your-repository-url>
cd bank-management-system
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root folder to house your database and admin configurations:

```env
PORT=5000

# Provide your Database credentials
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=securebank

```

### 4. Boot Up the Application
With the database running, launch both the Node.js server and API:

```bash
npm run dev
```
Navigate to `http://localhost:5000` to interact with ApkaGullak! 

## 🛡️ License & Security Disclaimer
This system is an educational simulation. It relies on simplified `localStorage` fallback flows rather than robust JWT hashing algorithms for user validation. It is strictly meant as an open-source development portfolio project and should not be rapidly deployed into financial production.

## 👤 Author 
[Vivek Belwal](https://github.com/vivek-belwal)   
    
[Mayank Raj](https://github.com/poisonmunna)
