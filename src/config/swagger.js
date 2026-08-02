const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'ZeroHunger Enterprise SaaS API',
    version: '2.0.0',
    description: `
## ZeroHunger Enterprise Food Rescue & Redistribution Network API

ZeroHunger is an AI-powered logistics platform connecting commercial food donors (hotels, restaurants, bakeries) with verified NGOs, shelters, and volunteer couriers to eliminate food waste and hunger.

### Key Capabilities
* **Authentication & Identity**: JWT bearer auth, role-based access control, OTP verification, self-service profile setup.
* **Food Rescue Listings**: Post surplus food, category classification, expiration window tracking, geolocation pickup bounds.
* **Fulfillment & Dispatch**: Bulk request placement by NGOs, volunteer task allocation, delivery status pipeline.
* **Enterprise Analytics**: Real-time stats, weekly trends, environmental CO₂ impact metrics, and administrative audit logs.

### Security
All protected endpoints require an HTTP Authorization header formatted as:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`
    `,
    termsOfService: 'https://zerohunger.org/terms',
    contact: {
      name: 'ZeroHunger API Support Team',
      email: 'api-support@zerohunger.org',
      url: 'https://zerohunger.org',
    },
    license: {
      name: 'MIT License',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  externalDocs: {
    description: 'ZeroHunger Architecture & Developer Guide',
    url: 'https://zerohunger.org/docs',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local Development Server',
    },
    {
      url: process.env.BACKEND_URL || 'https://zerohunger-api.onrender.com',
      description: 'Production Cloud Instance',
    },
  ],
  tags: [
    { name: 'Health Check', description: 'System status & database heartbeat ping' },
    { name: 'Authentication', description: 'User registration, login, OTP verification, and JWT session handling' },
    { name: 'Food Donations', description: 'Surplus food listing publication, discovery, reservation, and status tracking' },
    { name: 'Food Requests', description: 'NGO bulk food requirements, claim approvals, and fulfillment status' },
    { name: 'Dashboard & Analytics', description: 'Executive metrics, trend lines, and user activity streams' },
    { name: 'Admin Control', description: 'System user management, role assignments, and security audit' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide a valid JWT token obtained from `/api/v1/auth/login` or `/api/v1/auth/register`.',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66a9b12c8f413d29a01048b1' },
          fullName: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane.doe@grandhyatt.com' },
          role: { type: 'string', enum: ['restaurant', 'donor', 'ngo', 'volunteer', 'admin'], example: 'restaurant' },
          city: { type: 'string', example: 'San Francisco' },
          address: { type: 'string', example: '123 Market St, Dock 4' },
          phone: { type: 'string', example: '+14155552671' },
          organizationName: { type: 'string', example: 'Grand Hyatt Kitchens' },
          bio: { type: 'string', example: 'Executive culinary team dedicated to zero food waste.' },
          isVerified: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time', example: '2026-08-01T10:00:00.000Z' },
        },
      },
      Food: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66a9c80f8f413d29a01049c5' },
          title: { type: 'string', example: '50 Fresh Gourmet Prepared Meals' },
          category: { type: 'string', enum: ['cooked', 'raw', 'packaged', 'beverage', 'bakery', 'dairy', 'other'], example: 'cooked' },
          quantity: { type: 'string', example: '50 boxes' },
          status: { type: 'string', enum: ['available', 'reserved', 'collected', 'expired'], example: 'available' },
          expiryTime: { type: 'string', format: 'date-time', example: '2026-08-03T18:00:00.000Z' },
          pickupTime: { type: 'string', example: 'Today between 5 PM - 8 PM' },
          city: { type: 'string', example: 'San Francisco' },
          pickupAddress: { type: 'string', example: '123 Market St, Dock 4' },
          description: { type: 'string', example: 'Surplus dinner meals packaged in thermal containers.' },
          donatedBy: { $ref: '#/components/schemas/User' },
          claimedBy: { $ref: '#/components/schemas/User' },
          images: { type: 'array', items: { type: 'string' }, example: ['/uploads/food-102.jpg'] },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time', example: '2026-08-02T01:00:00.000Z' },
        },
      },
      Request: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66a9d90e8f413d29a01050d2' },
          foodTitle: { type: 'string', example: '50 Cooked Dinner Boxes' },
          quantityRequested: { type: 'string', example: '50 boxes' },
          status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'], example: 'pending' },
          requestedBy: { type: 'string', example: 'St. Jude Shelter' },
          organization: { type: 'string', example: 'St. Jude Foundation' },
          notes: { type: 'string', example: 'Requires refrigerated transport if possible.' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-08-02T02:15:00.000Z' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@zerohunger.org' },
          password: { type: 'string', format: 'password', example: 'Password123!' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['fullName', 'email', 'password', 'role'],
        properties: {
          fullName: { type: 'string', example: 'Sarah Connor' },
          email: { type: 'string', format: 'email', example: 'sarah.c@sheltercare.org' },
          password: { type: 'string', format: 'password', example: 'SecurePass2026!' },
          role: { type: 'string', enum: ['restaurant', 'donor', 'ngo', 'volunteer', 'admin'], example: 'ngo' },
          city: { type: 'string', example: 'San Francisco' },
          organizationName: { type: 'string', example: 'ShelterCare Foundation' },
          phone: { type: 'string', example: '+14155550199' },
        },
      },
      JWTResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Authentication successful' },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          refreshToken: { type: 'string', example: 'd9f0e1a2b3c4...' },
          data: { $ref: '#/components/schemas/User' },
        },
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Resource not found or unauthorized' },
          errors: { type: 'array', items: { type: 'string' }, example: ['Invalid resource identifier'] },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Must be a valid email address' },
              },
            },
          },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 45 },
          totalPages: { type: 'integer', example: 5 },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication token is missing or invalid (401)',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, message: 'Authentication required. Token missing or expired.' },
          },
        },
      },
      ForbiddenError: {
        description: 'Insufficient role permissions (403)',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, message: 'Access forbidden. Required role permission missing.' },
          },
        },
      },
      NotFoundError: {
        description: 'Requested endpoint or resource not found (404)',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, message: 'Resource not found' },
          },
        },
      },
      ValidationError: {
        description: 'Request payload validation errors (400 / 422)',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ValidationError' },
          },
        },
      },
      RateLimitError: {
        description: 'Too many requests sent within rate limit window (429)',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, message: 'Too many requests from this IP, please try again later.' },
          },
        },
      },
      InternalServerError: {
        description: 'Internal Server Error (500)',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, message: 'Internal server error occurred.' },
          },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: [
    './src/routes/*.js',
    './src/app.js',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerSpec, swaggerJSDoc };
