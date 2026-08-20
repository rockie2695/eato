# API Reference

## Base URL

```
Development: http://localhost:5000/api/v1
Production:  https://your-backend.onrender.com/api/v1
```

## Swagger Documentation

Interactive API documentation is available via Swagger UI:

- **Swagger UI**: http://localhost:5000/api/docs
- **JSON Spec**: http://localhost:5000/api/docs.json

The Swagger docs include:
- Full endpoint documentation for all routes
- Request/response schemas (OpenAPI 3.0)
- Authentication setup (Bearer token)
- Example requests and responses
- Error response formats

## Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Response Format

### Success

```json
{
  "data": { ... },
  "message": "Optional success message"
}
```

### Paginated

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

### Error

```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "statusCode": 400,
  "details": {
    "field": ["Validation error message"]
  }
}
```

---

## Authentication

### POST /auth/register

Register a new customer account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "John Doe",
  "phone": "+1234567890"
}
```

**Response (201):**
```json
{
  "data": {
    "user": { "id": "...", "email": "...", "name": "...", "role": "customer" },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### POST /auth/login

Authenticate with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "data": {
    "user": { "id": "...", "email": "...", "name": "...", "role": "customer" },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### POST /auth/refresh

Get new access token using refresh token.

**Request:**
```json
{
  "refreshToken": "..."
}
```

### POST /auth/logout

Blacklist the refresh token.

**Request:**
```json
{
  "refreshToken": "..."
}
```

### GET /auth/me

Get current authenticated user profile.

**Headers:** `Authorization: Bearer <token>`

---

## Menu

### GET /menu/categories

Get all active menu categories.

**Response (200):**
```json
{
  "data": [
    {
      "id": "cat-appetizers",
      "name": "Appetizers",
      "description": "Start your meal with our delicious starters",
      "sortOrder": 1,
      "isActive": true
    }
  ]
}
```

### GET /menu/items

Get menu items with pagination and filters.

**Query Parameters:**
- `categoryId` - Filter by category
- `search` - Search by name/description
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response (200):**
```json
{
  "data": [
    {
      "id": "...",
      "name": "Spring Rolls",
      "description": "Crispy vegetable spring rolls",
      "price": 899,
      "isAvailable": true,
      "isFeatured": true,
      "tags": ["vegetarian", "crispy"],
      "preparationTime": 10,
      "category": { "id": "...", "name": "Appetizers" }
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### GET /menu/items/:id

Get a single menu item by ID.

### GET /menu/featured

Get featured menu items for homepage display.

---

## Cart

All cart routes require authentication.

### GET /cart

Get current user's cart.

**Response (200):**
```json
{
  "data": {
    "id": "...",
    "userId": "...",
    "items": [
      {
        "id": "...",
        "menuItemId": "...",
        "quantity": 2,
        "price": 899,
        "specialInstructions": "Extra sauce",
        "menuItem": { "id": "...", "name": "Spring Rolls", "price": 899 }
      }
    ],
    "totalAmount": 1798,
    "itemCount": 2
  }
}
```

### POST /cart/items

Add an item to the cart.

**Request:**
```json
{
  "menuItemId": "...",
  "quantity": 2,
  "specialInstructions": "Extra sauce"
}
```

### PUT /cart/items/:id

Update a cart item's quantity or instructions.

**Request:**
```json
{
  "quantity": 3,
  "specialInstructions": "No onions"
}
```

### DELETE /cart/items/:id

Remove an item from the cart.

### DELETE /cart

Clear all items from the cart.

---

## Orders

All order routes require authentication.

### POST /orders

Create a new order.

**Request:**
```json
{
  "tableNumber": 5,
  "paymentMethod": "cash",
  "notes": "Birthday celebration",
  "items": [
    {
      "menuItemId": "...",
      "quantity": 2,
      "specialInstructions": "Extra sauce"
    }
  ]
}
```

**Response (201):**
```json
{
  "data": {
    "id": "...",
    "status": "pending",
    "paymentMethod": "cash",
    "paymentStatus": "pending",
    "totalAmount": 1798,
    "items": [...]
  }
}
```

For `paymentMethod: "online"`, the response includes `stripeSessionId` for redirect.

### GET /orders/my

Get current user's orders.

**Query Parameters:**
- `status` - Filter by status
- `page` - Page number
- `limit` - Items per page

### GET /orders

Get all orders (staff/admin only).

### GET /orders/:id

Get order by ID.

### PATCH /orders/:id/status

Update order status (staff/admin only).

**Request:**
```json
{
  "status": "confirmed"
}
```

**Valid status transitions:**
- `pending` → `confirmed`, `cancelled`
- `confirmed` → `preparing`, `cancelled`
- `preparing` → `ready`
- `ready` → `served`
- `served` → `completed`

### POST /orders/:id/cancel

Cancel an order (customer only, before confirmed).

---

## Staff (Admin only)

### GET /staff

Get all staff users.

### POST /staff

Create a new staff account.

**Request:**
```json
{
  "email": "newstaff@eato.com",
  "password": "Staff123!",
  "name": "New Staff",
  "role": "staff"
}
```

### PUT /staff/:id

Update a staff member.

### DELETE /staff/:id

Delete a staff member.

---

## Payments (Stripe Webhook)

### POST /payments/webhook

Stripe webhook endpoint for payment status updates.

**Important:** This endpoint requires raw body parsing (not JSON).

**Handled Events:**
- `checkout.session.completed` - Mark order as paid
- `payment_intent.payment_failed` - Mark payment as failed

---

## Socket.io Events

### Client → Server

- `order:subscribe(orderId)` - Subscribe to order updates
- `order:unsubscribe(orderId)` - Unsubscribe from order updates
- `table:join(tableNumber)` - Join table-specific room

### Server → Client

- `order:new` - New order created (staff/kitchen)
- `order:statusUpdate` - Order status changed
  ```json
  {
    "orderId": "...",
    "status": "preparing",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
  ```

---

## Error Monitoring (Sentry)

Sentry is integrated for error tracking and performance monitoring:

- **Backend**: Captures unhandled exceptions, performance traces
- **Frontend**: Captures React errors, browser performance, replays on error

Errors are reported to Sentry when `SENTRY_DSN` (backend) or `VITE_SENTRY_DSN` (frontend) is configured.

Free tier limits:
- 5,000 transactions/month
- 10,000 errors/month
- 30-day retention
