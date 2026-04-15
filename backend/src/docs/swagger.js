const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PrimeTrade MERN Assignment API',
      version: '1.0.0',
      description: 'REST API with JWT auth, RBAC, and Task CRUD with pagination and filtering'
    },
    servers: [
      { url: 'http://localhost:5001', description: 'Local development (macOS: port 5001 due to AirTunes on 5000)' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            password: { type: 'string', example: 'SecurePass123' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'john@example.com' },
            password: { type: 'string', example: 'SecurePass123' }
          }
        },
        Task: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
            userId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        PaginatedTasksResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                total: { type: 'integer', description: 'Total number of tasks matching filter', example: 25 },
                page: { type: 'integer', description: 'Current page number', example: 1 },
                limit: { type: 'integer', description: 'Number of tasks per page', example: 10 },
                data: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Task' }
                }
              }
            }
          }
        }
      }
    },
    paths: {
      '/api/v1/auth/register': {
        post: {
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterRequest' }
              }
            }
          },
          responses: {
            201: { description: 'User registered' },
            409: { description: 'Email already exists' }
          }
        }
      },
      '/api/v1/auth/login': {
        post: {
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' }
              }
            }
          },
          responses: {
            200: { description: 'Login successful' },
            401: { description: 'Invalid credentials' }
          }
        }
      },
      '/api/v1/auth/refresh': {
        post: {
          tags: ['Auth'],
          responses: {
            200: { description: 'Token refreshed' }
          }
        }
      },
      '/api/v1/tasks': {
        get: {
          tags: ['Tasks'],
          summary: 'Get paginated, filterable, and sortable list of tasks',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'query',
              name: 'page',
              schema: { type: 'integer', minimum: 1, default: 1 },
              description: 'Page number (1-indexed) for pagination'
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
              description: 'Number of tasks to return per page'
            },
            {
              in: 'query',
              name: 'status',
              schema: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
              description: 'Filter tasks by status'
            },
            {
              in: 'query',
              name: 'sort',
              schema: { type: 'string', default: '-createdAt' },
              description: 'Sort field with optional - prefix for descending order. Examples: createdAt, -updatedAt, title, -title'
            }
          ],
          responses: {
            200: {
              description: 'Successfully retrieved paginated tasks',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PaginatedTasksResponse' }
                }
              }
            },
            401: { description: 'Unauthorized' }
          }
        },
        post: {
          tags: ['Tasks'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title'],
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    status: { type: 'string', enum: ['todo', 'in_progress', 'done'] }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Task created' }
          }
        }
      },
      '/api/v1/tasks/{taskId}': {
        get: {
          tags: ['Tasks'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'taskId', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Task fetched' },
            403: { description: 'Forbidden' }
          }
        },
        patch: {
          tags: ['Tasks'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'taskId', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Task updated' }
          }
        },
        delete: {
          tags: ['Tasks'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'taskId', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Task deleted' }
          }
        }
      },
      '/api/v1/admin/users': {
        get: {
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'List users (admin only)' },
            403: { description: 'Forbidden' }
          }
        }
      },
      '/api/v1/admin/users/{userId}/role': {
        patch: {
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'userId', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'User role updated' }
          }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
