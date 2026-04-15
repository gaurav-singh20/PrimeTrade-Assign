# MERN Backend Internship Assignment

Production-oriented MERN project with backend-first design: secure auth, role-based access control, task CRUD, ownership checks, API docs, and a minimal React client.

This repository uses npm workspaces, so dependencies are installed from the project root and shared across `backend` and `frontend` during local development.

## 1. Folder Structure

```text
PrimeTrade-Assign/
  backend/
    src/
      config/
      controllers/
      docs/
      middleware/
      models/
      routes/
      services/
      utils/
      app.js
      server.js
    .env.example
    package.json
  frontend/
    src/
      api/
      components/
      context/
      pages/
      App.jsx
      main.jsx
      styles.css
    .env.example
    index.html
    package.json
    vite.config.js
  .gitignore
  package.json
  README.md
```

## 2. Backend Highlights

- JWT authentication with access token + rotating refresh token.
- Secure refresh token in HTTP-only cookie.
- Refresh token stored as hash in database for revocation safety.
- RBAC middleware with roles: user, admin.
- Task ownership checks for non-admin users.
- Versioned APIs under /api/v1.
- Validation via express-validator.
- Security hardening:
  - Helmet
  - CORS with credentials
  - Rate limiting
  - Mongo sanitize
- Centralized error handling.
- Swagger docs at /api-docs.

## 3. API Endpoints

### Auth

- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/refresh
- POST /api/v1/auth/logout

### Tasks (Protected)

- **POST /api/v1/tasks** — Create a new task
- **GET /api/v1/tasks** — List tasks with pagination, filtering, and sorting
  - Query Parameters:
    - `page` (optional, default: 1) — Page number for pagination
    - `limit` (optional, default: 10, max: 100) — Tasks per page
    - `status` (optional) — Filter by status: `todo`, `in_progress`, or `done`
    - `sort` (optional, default: `-createdAt`) — Sort field with optional `-` prefix for descending order (e.g., `createdAt`, `-updatedAt`, `title`)
  - Example: `GET /api/v1/tasks?page=1&limit=15&status=done&sort=-updatedAt`
- **GET /api/v1/tasks/:taskId** — Get a specific task
- **PATCH /api/v1/tasks/:taskId** — Update a task
- **DELETE /api/v1/tasks/:taskId** — Delete a task

### Admin (Admin only)

- GET /api/v1/admin/users
- PATCH /api/v1/admin/users/:userId/role

## 3.1 Response Format

All successful API responses follow this standardized format:

```json
{
  "success": true,
  "data": {
    /* ... */
  },
  "message": "Optional success message"
}
```

**Paginated Task List Response Example:**

```json
{
  "success": true,
  "data": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "data": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Complete project",
        "description": "Finish the assignment",
        "status": "done",
        "userId": "507f1f77bcf86cd799439012",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T14:45:00Z"
      }
    ]
  }
}
```

**Error Response Example:**

```json
{
  "success": false,
  "message": "Invalid status filter",
  "error": "Bad Request"
}
```

## 3.2 Pagination & Filtering Examples

```bash
# Get first 10 tasks (default)
curl -H "Authorization: Bearer <token>" http://localhost:5001/api/v1/tasks

# Get tasks on page 2 with 20 per page
curl -H "Authorization: Bearer <token>" http://localhost:5001/api/v1/tasks?page=2&limit=20

# Get only 'done' tasks
curl -H "Authorization: Bearer <token>" http://localhost:5001/api/v1/tasks?status=done

# Get in-progress tasks sorted by creation date (newest first)
curl -H "Authorization: Bearer <token>" http://localhost:5001/api/v1/tasks?status=in_progress&sort=-createdAt

# Get 25 todo items sorted by title (A-Z), page 1
curl -H "Authorization: Bearer <token>" http://localhost:5001/api/v1/tasks?page=1&limit=25&status=todo&sort=title
```

## 4. Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB local instance or Atlas URI

### Install Dependencies

From project root:

```bash
npm install
```

If you want to refresh workspace dependencies explicitly, you can also run:

```bash
npm run install:all
```

### Configure Environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Update backend/.env values, especially:

**MongoDB Connection:**

- **Local MongoDB:** `MONGO_URI=mongodb://127.0.0.1:27017/primetrade_assign`
  - Requires local MongoDB instance running on port 27017
- **MongoDB Atlas (Cloud):** `MONGO_URI=mongodb+srv://username:password@your-cluster.mongodb.net/primetrade_assign?retryWrites=true&w=majority`
  - Get your connection string from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
  - Replace `username`, `password`, and `your-cluster` with your Atlas credentials and cluster name
  - Recommended for production and cloud deployments

**JWT Secrets:**

- `JWT_ACCESS_SECRET` — Random 32+ character string for access token signing
- `JWT_REFRESH_SECRET` — Different random 32+ character string for refresh token signing

**Port & Frontend URL:**

- Default backend port is `5001` (updated from 5000 due to macOS AirTunes compatibility)
- Ensure `frontend/.env` has `VITE_API_URL=http://localhost:5001/api/v1`

### Run Development (Backend + Frontend)

```bash
npm run dev
```

- Backend: http://localhost:5000, or http://localhost:5001 if you changed the port in `.env`
- Frontend: http://localhost:5173
- Swagger: http://localhost:5000/api-docs, or `http://localhost:5001/api-docs` if you changed the port

### Run Individually

```bash
npm run dev:backend
npm run dev:frontend
```

### Production Deployment Notes

- Deploy the frontend and backend independently if needed; each app should run its own install/build step in its target environment.
- Ensure the frontend `VITE_API_URL` points to the deployed backend URL, not `localhost`.
- Ensure backend environment variables are configured in production, especially `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `CLIENT_ORIGIN`.

## 5. Frontend Features

- Register and Login pages.
- Protected Dashboard route.
- **Access token stored in React state (memory)** — mitigates XSS vulnerability surface.
- Refresh token persisted in HTTP-only cookie — resistant to JavaScript-based attacks.
- Uses refresh endpoint when access token expires.
- Create, read, update, delete tasks with pagination support.
- Displays API success and error messages.

## 6. Security Notes

### Authentication & Tokens

- **Password hashing:** bcrypt with salt rounds of 10.
- **Access tokens:** Short-lived JWT (15 minutes default), stored in React state (memory) to minimize XSS vulnerability surface.
- **Refresh tokens:** Long-lived JWT (7 days default), stored in secure HTTP-only cookies, not accessible to JavaScript, rotated on each refresh for added security.
- **Refresh token storage:** Hashed in database and invalidated on logout, preventing token replay attacks.
- **Token refresh flow:** When access token expires, frontend uses refresh endpoint with HTTP-only cookie to obtain a new access token.

### API Security

- **Input validation:** All POST, PATCH, DELETE endpoints validate request body and query parameters using express-validator.
- **Request sanitization:** NoSQL injection protection via mongo-sanitize middleware.
- **Rate limiting:** Global rate limit of 200 requests per 15 minutes per IP.
- **CORS:** Enabled with credentials support for frontend localhost:5173, restricts cross-origin requests.
- **Security headers:** Helmet middleware sets CSP, X-Frame-Options, X-Content-Type-Options, and other protective headers.
- **Authorization:** Role-based access control (RBAC) with user and admin roles; ownership checks for user-owned resources.
- **Ownership validation:** Non-admin users can only read/update/delete their own tasks.

### Environment Variables

Store sensitive data in .env files (never commit to git):

- `JWT_ACCESS_SECRET` — Random 32+ character string
- `JWT_REFRESH_SECRET` — Different random 32+ character string
- `MONGO_URI` — MongoDB connection string
- `CLIENT_ORIGIN` — Frontend URL for CORS validation

### Recommendations for Production

1. Use HTTPS only (TLS/SSL certificates).
2. Set `NODE_ENV=production`.
3. Increase access token expiry assessment (consider 10-30 minutes vs 15 minutes).
4. Rotate JWT secrets periodically.
5. Implement additional logging and monitoring.
6. Use environment variable management tools (e.g., AWS Secrets Manager, HashiCorp Vault).
7. **Use MongoDB Atlas or secured MongoDB instance:**
   - MongoDB Atlas: Set up cluster, enable network access whitelist, use strong passwords
   - Self-hosted: Enable authentication, restrict IP access, use TLS encryption for connections

## 7. Scripts

### Root

- npm run dev
- npm run dev:backend
- npm run dev:frontend
- npm run build

### Backend

- npm run dev --workspace backend
- npm run start --workspace backend

### Frontend

- npm run dev --workspace frontend
- npm run build --workspace frontend
- npm run preview --workspace frontend

## 8. Optional Enhancements (Not Implemented)

- Redis caching for heavy read endpoints.
- Winston structured logging with file transport.
- Docker and docker-compose for full stack runtime.
- Unit and integration tests (Jest + Supertest).

## 9. Scalability Considerations

This system is designed to scale with the following improvements:

- Horizontal scaling using load balancers (multiple backend instances)
- Stateless authentication using JWT enables easy scaling
- Redis caching can be introduced for frequently accessed data
- Microservices architecture can separate auth, user, and task services
- Database scaling via sharding and read replicas

## API Documentation

Postman collection is included in the repository.

Steps to use:
1. Import `docs/postman_collection.json` into Postman
2. Run Login API
3. Copy access_token from response
4. Set it in collection variable `access_token`
5. Use other APIs