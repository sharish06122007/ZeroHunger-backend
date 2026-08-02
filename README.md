# ZeroHunger Enterprise API & OpenAPI 3.0 Documentation

ZeroHunger is an AI-powered enterprise food redistribution network connecting commercial food donors (hotels, restaurants, bakeries) with verified NGOs, shelters, and volunteer couriers.

---

## 📚 OpenAPI 3.0 & Swagger UI Integration

The ZeroHunger backend includes native **OpenAPI 3.0 (Swagger)** interactive documentation, schemas, and specifications.

### 🌐 Documentation URLs

* **Interactive Swagger UI**: [`http://localhost:3000/api-docs`](http://localhost:3000/api-docs)
* **OpenAPI Specification (JSON)**: [`http://localhost:3000/openapi.json`](http://localhost:3000/openapi.json)
* **OpenAPI Specification (YAML)**: [`http://localhost:3000/openapi.yaml`](http://localhost:3000/openapi.yaml)
* **System & DB Health Check**: [`http://localhost:3000/health`](http://localhost:3000/health)

---

## 🔑 Authenticating in Swagger UI ("Try It Out")

Most endpoint routes (`/api/v1/food`, `/api/v1/requests`, `/api/v1/dashboard`, `/api/v1/auth/me`) require a valid Bearer JWT.

1. Open [`http://localhost:3000/api-docs`](http://localhost:3000/api-docs).
2. Expand the `Authentication` section and execute `POST /api/v1/auth/login` (or `POST /api/v1/auth/register`).
3. Copy the returned `token` string from the JSON response body.
4. Click the green **Authorize 🔓** button at the top right of the Swagger page.
5. Paste the token into the `Value` input field (Swagger automatically prepends `Bearer `).
6. Click **Authorize** and close the modal. You can now execute any protected API directly inside Swagger UI!

---

## 🛠️ Generating Static Spec Files

To generate `openapi.json` and `openapi.yaml` files for build pipelines or API gateways:

```bash
npm run docs:generate
```

Outputs:
* `./openapi.json`
* `./openapi.yaml`

---

## 🚀 Deployment Instructions

### Environment Variables
Set the following environment variables on your cloud hosting platform (Render, Railway, Heroku, Docker):

```env
PORT=3000
NODE_ENV=production
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/zerohunger
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=https://zerohunger.org
BACKEND_URL=https://zerohunger-api.onrender.com
```

### Docker Deployment
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Nginx Reverse Proxy Setup
```nginx
location /api-docs {
    proxy_pass http://localhost:3000/api-docs;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

---

## 📋 Documented API Endpoints Summary

| Tag | Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| **Health Check** | `GET` | `/health` | Heartbeat & DB readiness check | ❌ Public |
| **Health Check** | `GET` | `/api/v1/health` | API version check | ❌ Public |
| **Authentication** | `POST` | `/api/v1/auth/register` | Register new account | ❌ Public |
| **Authentication** | `POST` | `/api/v1/auth/verify-email` | Verify email OTP | ❌ Public |
| **Authentication** | `POST` | `/api/v1/auth/resend-otp` | Resend verification OTP | ❌ Public |
| **Authentication** | `POST` | `/api/v1/auth/login` | Log in & issue JWT | ❌ Public |
| **Authentication** | `POST` | `/api/v1/auth/refresh` | Refresh JWT access token | ❌ Public |
| **Authentication** | `POST` | `/api/v1/auth/logout` | Revoke session tokens | ❌ Public |
| **Authentication** | `POST` | `/api/v1/auth/forgot-password` | Request password reset | ❌ Public |
| **Authentication** | `POST` | `/api/v1/auth/verify-otp` | Verify recovery OTP | ❌ Public |
| **Authentication** | `POST` | `/api/v1/auth/reset-password` | Set new password | ❌ Public |
| **Authentication** | `GET` | `/api/v1/auth/me` | Get current user profile | 🔒 Bearer JWT |
| **Authentication** | `PUT` | `/api/v1/auth/me` | Update profile info | 🔒 Bearer JWT |
| **Authentication** | `PUT` | `/api/v1/auth/me/password` | Change password | 🔒 Bearer JWT |
| **Food Donations** | `GET` | `/api/v1/food` | Search & filter food listings | ❌ Public |
| **Food Donations** | `POST` | `/api/v1/food` | Post new surplus food | 🔒 Bearer JWT (Donor/Admin) |
| **Food Donations** | `GET` | `/api/v1/food/me` | Get my posted listings | 🔒 Bearer JWT |
| **Food Donations** | `GET` | `/api/v1/food/{id}` | Get listing detail | ❌ Public |
| **Food Donations** | `PUT` | `/api/v1/food/{id}` | Update food listing | 🔒 Bearer JWT |
| **Food Donations** | `DELETE` | `/api/v1/food/{id}` | Delete food listing | 🔒 Bearer JWT |
| **Food Requests** | `GET` | `/api/v1/requests` | List user's food claims | 🔒 Bearer JWT |
| **Food Requests** | `POST` | `/api/v1/requests` | Submit food claim request | 🔒 Bearer JWT |
| **Food Requests** | `GET` | `/api/v1/requests/mine` | My submitted requests | 🔒 Bearer JWT |
| **Food Requests** | `GET` | `/api/v1/requests/incoming` | Incoming donor requests | 🔒 Bearer JWT |
| **Food Requests** | `GET` | `/api/v1/requests/admin/all` | Admin all-requests audit | 🔒 Bearer JWT (Admin) |
| **Food Requests** | `GET` | `/api/v1/requests/{id}` | Single request details | 🔒 Bearer JWT |
| **Food Requests** | `PUT` | `/api/v1/requests/{id}/status` | Update fulfillment status | 🔒 Bearer JWT |
| **Dashboard** | `GET` | `/api/v1/dashboard/stats` | Executive metrics summary | 🔒 Bearer JWT |
| **Dashboard** | `GET` | `/api/v1/dashboard/activity` | Recent activity stream | 🔒 Bearer JWT |
| **Dashboard** | `GET` | `/api/v1/dashboard/charts` | Weekly SVG chart dataset | 🔒 Bearer JWT |
| **Admin Control** | `GET` | `/api/v1/dashboard/users` | Manage platform accounts | 🔒 Bearer JWT (Admin) |
| **Admin Control** | `PUT` | `/api/v1/dashboard/users/{id}` | Update role / verification | 🔒 Bearer JWT (Admin) |
| **Admin Control** | `DELETE` | `/api/v1/dashboard/users/{id}` | Delete user account | 🔒 Bearer JWT (Admin) |
