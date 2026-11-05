# 🏥 Doctor Tracker — Backend API Server (`doctorTrackerServer`)

> High-performance Node.js & Express REST API server for Doctor Tracker with MongoDB Atlas integration, compound indexing, aggregation pipelines, and JWT authentication.

## Quick Start
```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Seed 500+ records (60 USA doctors, 450+ patients, superAdmin)
npm run seed:500

# Start development server
npm run server

# Run ESLint
npm run lint
```

## Tech Stack & Reasoning
- **Node.js (ES Modules)**: Modern, non-blocking asynchronous JavaScript runtime.
- **Express 4**: Flexible, robust HTTP routing engine with modular endpoint architecture.
- **Mongoose 7**: Schema validation, compound indexing, and aggregation pipelines.
- **jsonwebtoken (JWT)**: Stateless Bearer token security with RBAC authorization.
- **bcryptjs**: Salted password hashing (10 salt rounds).
- **express-validator**: Payload sanitization and schema verification.

*For complete architecture and endpoint documentation, refer to the [Root README](../README.md).*

