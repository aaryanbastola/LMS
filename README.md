# 📚 Full-Stack Library Management System (LMS)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

A comprehensive, full-stack library management application designed to handle the complex workflows of a modern digital or physical library. Built with a robust Node.js/Express backend and a responsive React (Vite) frontend, this system features strict Role-Based Access Control (RBAC), automated fine calculations, and secure JWT authentication.

---

## ✨ Key Features

*   **Role-Based Access Control (RBAC):** Distinct dashboards and permissions for Admins, Librarians, and Lenders.
*   **Secure Authentication:** JWT-based sessions with `bcrypt` password hashing.
*   **Catalog Management:** Full CRUD capabilities for library inventory.
*   **Circulation Engine:** Track checkouts, returns, reservations, and renewals.
*   **Automated Fines:** System calculates penalties based on overdue return dates.
*   **Zero-Config Database:** Utilizes SQLite via Sequelize ORM for immediate local setup without complex database server configurations.

---

## 🛠️ Tech Stack

### Frontend (Client)
*   **Framework:** React 18 + Vite
*   **Routing:** React Router v6
*   **HTTP Client:** Axios (with interceptors for JWT)
*   **Styling:** Tailwind CSS

### Backend (Server)
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **ORM:** Sequelize
*   **Database:** SQLite
*   **Security:** JSON Web Tokens (JWT), bcryptjs

---

## 🔐 Role & Permission Matrix

The system enforces strict access control. Attempting to access unauthorized routes will result in a 403 Forbidden response.

| Capability | Admin | Librarian | Lender (Member) |
| :--- | :---: | :---: | :---: |
| **Browse Catalog** | ✅ | ✅ | ✅ |
| **Borrow / Return Books** | ✅ | ✅ | ✅ |
| **Renew / Reserve Books**| ❌ | ❌ | ✅ |
| **Add / Edit Books** | ✅ | ✅ | ❌ |
| **Delete Books** | ✅ | ❌ | ❌ |
| **Manage Fines** | ✅ | ✅ | ❌ |
| **Suspend / Delete Users**| ✅ | ❌ | ❌ |

---

## 🚀 Getting Started

### Prerequisites
Ensure you have the following installed on your local machine:
*   [Node.js](https://nodejs.org/en/) (v18 or higher)
*   npm (comes with Node.js)

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/lms-project.git](https://github.com/yourusername/lms-project.git)
cd lms-project
