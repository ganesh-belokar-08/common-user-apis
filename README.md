# Common User API

## 🚀 Full-Featured User Management & Authentication System

This project is a robust backend API for handling user authentication, profile management, and advanced security features like JWT tokens and Two-Factor Authentication (2FA). It’s built with Node.js, Express.js, and MongoDB, focusing on secure and scalable development practices.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Security:** JWT, Bcrypt
- **Email Service:** Nodemailer with Gmail integration

---

## 🔑 API Features

### Authentication & Token Management
- ✅ Register a new user → `POST /api/register`
- ✅ User login with JWT → `POST /api/login`
- ✅ Logout user → `POST /api/logout`
- ✅ Refresh access token → `POST /api/refresh-token`

### User Profile Management
- ✅ Get user profile → `GET /api/users/:userId`
- ✅ Update user profile → `PUT /api/users/:userId`
- ✅ Delete account → `DELETE /api/users/:userId`

### Password & Account Security
- ✅ Forgot password (Send reset link) → `POST /api/forgot-password`
- ✅ Reset password → `POST /api/reset-password`
- ✅ Change password → `POST /api/change-password`

### Email Verification
- ✅ Send verification email → `POST /api/send-verification-email`
- ✅ Verify email → `POST /api/verify-email`

### Social Authentication
- ✅ Google OAuth login → `POST /api/auth/google`

### Two-Factor Authentication (2FA)
- ✅ Enable 2FA → `POST /api/enable-2fa`
- ✅ Verify 2FA → `POST /api/verify-2fa`
- ✅ Disable 2FA → `POST /api/disable-2fa`

---

## ⚙️ Setup Instructions

1. **Clone the repository:**
```bash
https://github.com/ganesh-belokar-08/common-user-apis.git
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create a `.env` file:**
```
MONGO_URI=mongodb://localhost:27017/User-API-DB
PORT=5000
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
FRONTEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

4. **Start the server:**
```bash
npm start
```

---

## 📘 Learning & Insights

1. Environment variable management for sensitive data
2. Secure token management with JWT & refresh tokens
3. OAuth flow handling for third-party login
4. Strengthening API security with Two-Factor Authentication

---

## 🧑‍💻 About Me

👋 Hi, I'm Ganesh Belokar — a passionate backend developer constantly exploring new technologies and building secure, scalable systems!

🔗 [LinkedIn](https://www.linkedin.com/in/ganesh-belokar-153224232/) | 🐙 [GitHub](https://github.com/ganesh-belokar-08)

---

## 📩 Feedback & Contributions

I’d love to hear your thoughts, suggestions, and ideas for improvements! If you’d like to contribute, feel free to open a pull request or reach out to me. 🚀

---

### 📜 License

This project is licensed under the MIT License.

---

Happy coding! 🚀

