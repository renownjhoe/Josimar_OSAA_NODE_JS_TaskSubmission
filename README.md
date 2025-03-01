# Josimar_OSAA_NODE_JS_TaskSubmission
 The purpose of this enhanced Node.js test task is to rigorously evaluate your technical expertise in backend development, security protocol integration, and API design for an authentication-based system. Recognizing the potential for external assistance or shortcuts, we have introduced Counter-Proofing measures designed to highlight your original problem-solving skills, reinforce accountability, and ensure the submission reflects your genuine capabilities.

```markdown
# Secure Authentication System (SAS)

A Node.js-based authentication system with Multi-Factor Authentication (MFA), Role-Based Access Control (RBAC), and secure session management.

## Features

- User registration with phone/username
- OTP-based MFA via WhatsApp/Telegram
- JWT token management with refresh
- Role-based access control (User/Admin)
- Request validation and rate limiting
- Comprehensive logging and error handling
- Swagger API documentation

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Testing](#testing-with-postman)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Prerequisites

- Node.js v18+
- npm v9+
- MongoDB (Local/Atlas)
- Postman (Recommended for testing)
- Twilio Account (For WhatsApp OTP - Optional)
- Telegram API Key (For Telegram OTP - Optional)

---

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/renownjhoe/Josimar_OSAA_NODE_JS_TaskSubmission.git
   cd secure-auth-system
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create `.env` file:
   ```env
   # .env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/sas
   JWT_SECRET=your_jwt_secret_key
   JWT_REFRESH_SECRET=your_refresh_secret_key

   # Optional (For production):
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   TELEGRAM_API_KEY=bot<your_telegram_bot_token>
   ```

4. **Start the server**:
   ```bash
   npm run dev
   ```

---

## Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/sas` |
| `JWT_SECRET` | JWT signing key | `secret123!` |
| `TWILIO_*` | WhatsApp OTP credentials | (From Twilio Console) |
| `TELEGRAM_API_KEY` | Telegram bot token | `bot123456:ABC-DEF...` |

---

## Usage

### API Endpoints

#### 1. User Registration
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "passcode": "Secure@123",
  "phone": "+1234567890",
  "role": "user"
}
```

#### 2. Login & OTP Request
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "passcode": "Secure@123"
}
```

#### 3. OTP Verification
```bash
POST /api/auth/verify-otp
Content-Type: application/json

{
  "userId": "507f1f77bcf86cd799439011",
  "code": "123456"
}
```

#### 4. Access Protected Route (Admin)
```bash
GET /api/auth/admin/users
Authorization: Bearer <JWT_TOKEN>
```

---

## Testing with Postman

1. **Import Collection**:  
   [Download Postman Collection](https://example.com/sas-postman-collection.json)

2. **Set Environment Variables**:
   ```json
   {
     "base_url": "http://localhost:3000",
     "jwt_token": "your_token_here"
   }
   ```

3. **Test Flow**:
   1. Register User → Get OTP from server logs
   2. Verify OTP → Get JWT token
   3. Access protected routes with token

---

## Project Structure

```
sas/
├── config/          # DB and environment configs
├── controllers/     # Route handlers
├── middleware/      # Auth, RBAC, rate-limiting
├── models/          # MongoDB schemas
├── routes/          # API endpoints
├── services/        # OTP, token services
├── utils/           # Logging, error handling
├── swagger/         # API documentation
├── app.js           # Main application
└── .env.example     # Environment template
```

---

## Troubleshooting

**1. MongoDB Connection Failed**  
- Ensure MongoDB service is running  
- Check `MONGO_URI` in `.env`  

**2. OTP Not Received**  
- Verify Twilio/Telegram credentials  
- Check server logs for delivery errors  

**3. JWT Token Invalid**  
- Confirm token expiration (15 minutes)  
- Validate `JWT_SECRET` matches signing key  

**4. Role-Based Access Denied**  
- Check user role in JWT payload  
- Verify admin routes use `requireRole('admin')`

---

**5. Api Documentation**:  

   [Download Api Documentation](https://example.com/api-docs) after starting your server.
   ```

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## Acknowledgments

- **bcrypt**: Secure password hashing
- **JWT**: Token-based authentication
- **Mongoose**: MongoDB object modeling
- **Winston**: Advanced logging
- **Twilio**: WhatsApp OTP delivery

---

**Happy Coding!** 🚀  
For support: renownjosimar@gmail.com  
[Project Repository](https://github.com/renownjhoe/Josimar_OSAA_NODE_JS_TaskSubmission.git)