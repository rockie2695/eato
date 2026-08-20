/**
 * Swagger Configuration.
 *
 * Defines the OpenAPI specification for the Eato REST API.
 * Includes all schema definitions, security schemes, and route documentation.
 */

import swaggerJsdoc from 'swagger-jsdoc';
import type { Options } from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Eato API',
      version: '1.0.0',
      description: `
# Eato - Smart Restaurant Ordering System API

A cross-platform restaurant ordering system with real-time updates.

## Features
- 🔐 JWT Authentication (Access + Refresh tokens)
- 🍽️ Menu management with categories
- 🛒 Shopping cart with Redis caching
- 📦 Order tracking with real-time Socket.io updates
- 💳 Stripe payment integration
- 👥 Staff management (Admin only)

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
\`\`\`
Authorization: Bearer <access_token>
\`\`\`

## Rate Limiting
- Auth endpoints: 10 requests/minute
- API endpoints: 100 requests/minute
- Order creation: 5 requests/minute
      `,
      contact: {
        name: 'Eato Support',
        email: 'support@eato.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://your-backend.onrender.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      schemas: {
        // ── User Schemas ─────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            phone: { type: 'string', nullable: true },
            role: {
              type: 'string',
              enum: ['customer', 'staff', 'kitchen', 'admin'],
            },
            avatar: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 1 },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: {
              type: 'string',
              minLength: 8,
              description: 'Must contain uppercase, lowercase, and number',
            },
            name: { type: 'string', minLength: 2 },
            phone: { type: 'string' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        RefreshRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
          },
        },

        // ── Menu Schemas ─────────────────────────────────────
        MenuCategory: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            image: { type: 'string', nullable: true },
            sortOrder: { type: 'integer' },
            isActive: { type: 'boolean' },
          },
        },
        MenuItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            categoryId: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            price: { type: 'integer', description: 'Price in cents' },
            image: { type: 'string', nullable: true },
            isAvailable: { type: 'boolean' },
            isFeatured: { type: 'boolean' },
            tags: {
              type: 'array',
              items: { type: 'string' },
            },
            preparationTime: {
              type: 'integer',
              nullable: true,
              description: 'Preparation time in minutes',
            },
            category: { $ref: '#/components/schemas/MenuCategory' },
          },
        },
        CreateCategoryRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            image: { type: 'string', format: 'uri' },
            sortOrder: { type: 'integer', default: 0 },
          },
        },
        CreateMenuItemRequest: {
          type: 'object',
          required: ['categoryId', 'name', 'price'],
          properties: {
            categoryId: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'integer', minimum: 0 },
            image: { type: 'string', format: 'uri' },
            isAvailable: { type: 'boolean', default: true },
            isFeatured: { type: 'boolean', default: false },
            tags: {
              type: 'array',
              items: { type: 'string' },
            },
            preparationTime: { type: 'integer', minimum: 0 },
          },
        },

        // ── Cart Schemas ─────────────────────────────────────
        Cart: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/CartItem' },
            },
            totalAmount: { type: 'integer', description: 'Total in cents' },
            itemCount: { type: 'integer' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CartItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            menuItemId: { type: 'string', format: 'uuid' },
            quantity: { type: 'integer' },
            price: { type: 'integer' },
            specialInstructions: { type: 'string', nullable: true },
            menuItem: { $ref: '#/components/schemas/MenuItem' },
          },
        },
        AddToCartRequest: {
          type: 'object',
          required: ['menuItemId'],
          properties: {
            menuItemId: { type: 'string', format: 'uuid' },
            quantity: { type: 'integer', minimum: 1, default: 1 },
            specialInstructions: { type: 'string' },
          },
        },
        UpdateCartItemRequest: {
          type: 'object',
          properties: {
            quantity: { type: 'integer', minimum: 1 },
            specialInstructions: { type: 'string' },
          },
        },

        // ── Order Schemas ────────────────────────────────────
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            tableNumber: { type: 'integer', nullable: true },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
            },
            paymentMethod: {
              type: 'string',
              enum: ['cash', 'online', 'card'],
            },
            paymentStatus: {
              type: 'string',
              enum: ['pending', 'paid', 'failed', 'refunded'],
            },
            totalAmount: { type: 'integer', description: 'Total in cents' },
            notes: { type: 'string', nullable: true },
            stripeSessionId: { type: 'string', nullable: true },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/OrderItem' },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        OrderItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            orderId: { type: 'string', format: 'uuid' },
            menuItemId: { type: 'string', format: 'uuid' },
            quantity: { type: 'integer' },
            price: { type: 'integer' },
            specialInstructions: { type: 'string', nullable: true },
            menuItem: { $ref: '#/components/schemas/MenuItem' },
          },
        },
        CreateOrderRequest: {
          type: 'object',
          required: ['paymentMethod', 'items'],
          properties: {
            tableNumber: { type: 'integer', minimum: 1 },
            paymentMethod: {
              type: 'string',
              enum: ['cash', 'online', 'card'],
            },
            notes: { type: 'string', maxLength: 500 },
            items: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['menuItemId', 'quantity'],
                properties: {
                  menuItemId: { type: 'string', format: 'uuid' },
                  quantity: { type: 'integer', minimum: 1, maximum: 99 },
                  specialInstructions: { type: 'string', maxLength: 200 },
                },
              },
            },
          },
        },
        UpdateOrderStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
            },
          },
        },

        // ── Table Schema ─────────────────────────────────────
        Table: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            number: { type: 'integer' },
            capacity: { type: 'integer' },
            isOccupied: { type: 'boolean' },
            qrCode: { type: 'string', nullable: true },
          },
        },

        // ── Error Schema ─────────────────────────────────────
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            code: { type: 'string' },
            statusCode: { type: 'integer' },
            details: {
              type: 'object',
              additionalProperties: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },

        // ── Paginated Response ───────────────────────────────
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: { type: 'array', items: {} },
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
        // ── Analytics Schemas ──────────────────────────────
        ReportOverview: {
          type: 'object',
          properties: {
            period: { type: 'string', enum: ['daily', 'weekly', 'monthly'] },
            dateRange: {
              type: 'object',
              properties: {
                start: { type: 'string', format: 'date-time' },
                end: { type: 'string', format: 'date-time' },
              },
            },
            totalOrders: { type: 'integer' },
            totalRevenue: { type: 'integer', description: 'Revenue in cents' },
            avgOrderValue: { type: 'integer', description: 'Average order value in cents' },
            newCustomers: { type: 'integer' },
          },
        },
        RevenueTrendPoint: {
          type: 'object',
          properties: {
            date: { type: 'string', format: 'date' },
            revenue: { type: 'integer', description: 'Revenue in cents' },
            orders: { type: 'integer' },
          },
        },
        PopularItem: {
          type: 'object',
          properties: {
            menuItem: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                price: { type: 'integer' },
                image: { type: 'string', nullable: true },
              },
            },
            totalQuantity: { type: 'integer' },
            totalRevenue: { type: 'integer' },
            orderCount: { type: 'integer' },
          },
        },
        StatusDistribution: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            count: { type: 'integer' },
          },
        },
        PaymentBreakdown: {
          type: 'object',
          properties: {
            method: { type: 'string' },
            count: { type: 'integer' },
            total: { type: 'integer', description: 'Total in cents' },
          },
        },
        PeakHour: {
          type: 'object',
          properties: {
            hour: { type: 'integer', minimum: 0, maximum: 23 },
            orders: { type: 'integer' },
          },
        },
        // ── Notification Schemas ───────────────────────────
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            type: {
              type: 'string',
              enum: ['ticker', 'popup'],
              description: 'ticker = scrolling banner, popup = modal dialog',
            },
            title: { type: 'string' },
            message: { type: 'string' },
            image: { type: 'string', nullable: true },
            link: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
            priority: { type: 'integer', description: 'Higher = shown first (0-100)' },
            startsAt: { type: 'string', format: 'date-time', nullable: true },
            expiresAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateNotificationRequest: {
          type: 'object',
          required: ['type', 'title', 'message'],
          properties: {
            type: {
              type: 'string',
              enum: ['ticker', 'popup'],
            },
            title: { type: 'string', maxLength: 200 },
            message: { type: 'string', maxLength: 2000 },
            image: { type: 'string', format: 'uri' },
            link: { type: 'string', format: 'uri' },
            isActive: { type: 'boolean', default: true },
            priority: { type: 'integer', minimum: 0, maximum: 100, default: 0 },
            startsAt: { type: 'string', format: 'date-time' },
            expiresAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/modules/*/routes.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
