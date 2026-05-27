const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` })
const arrayOf = (schema: object) => ({ type: 'array', items: schema })

const jsonResponse = (description: string, schema: object) => ({
  description,
  content: {
    'application/json': { schema },
  },
})

const emptyResponse = { description: 'No content' }

const errorResponses = {
  BadRequest: jsonResponse('Bad request', ref('ErrorResponse')),
  Unauthorized: jsonResponse('Unauthorized', ref('ErrorResponse')),
  Forbidden: jsonResponse('Forbidden', ref('ErrorResponse')),
  NotFound: jsonResponse('Not found', ref('ErrorResponse')),
  Conflict: jsonResponse('Conflict', ref('ErrorResponse')),
}

const bearerSecurity = [{ bearerAuth: [] }]

const uuidParam = (name: string, description: string) => ({
  name,
  in: 'path',
  required: true,
  description,
  schema: { type: 'string', format: 'uuid' },
})

const intParam = (name: string, description: string) => ({
  name,
  in: 'path',
  required: true,
  description,
  schema: { type: 'integer', minimum: 1 },
})

const pageParams = [
  {
    name: 'page',
    in: 'query',
    description: 'Page number. Defaults to 1.',
    schema: { type: 'integer', minimum: 1, default: 1 },
  },
  {
    name: 'limit',
    in: 'query',
    description: 'Items per page. The backend caps this value to 20.',
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
  },
]

const requestBody = (schema: object, required = true) => ({
  required,
  content: {
    'application/json': { schema },
  },
})

const paginated = (itemSchema: object) => ({
  allOf: [
    ref('Pagination'),
    {
      type: 'object',
      required: ['data'],
      properties: {
        data: arrayOf(itemSchema),
      },
    },
  ],
})

export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'CIMarket Backend API',
    version: '1.0.0',
    description:
      'Documentacion OpenAPI para el backend de CIMarket. Los endpoints protegidos usan JWT en Authorization: Bearer <token>.',
  },
  servers: [
    {
      url: 'http://localhost:8000',
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'Health', description: 'Basic service checks' },
    { name: 'Auth', description: 'Google sign-in and current user session' },
    { name: 'Users', description: 'User profiles, preferences and related data' },
    { name: 'Products', description: 'Marketplace products' },
    { name: 'Reviews', description: 'Legacy seller reviews' },
    { name: 'Favorites', description: 'Favorite products' },
    { name: 'Categories', description: 'Product categories' },
    { name: 'Campuses', description: 'Campus catalog' },
    { name: 'Conversations', description: 'Buyer and seller messaging' },
    { name: 'Notifications', description: 'In-app notifications' },
    { name: 'Push', description: 'Web push subscription management' },
    { name: 'Transactions', description: 'Sales and post-sale reviews' },
  ],
  paths: {
    '/': {
      get: {
        tags: ['Health'],
        summary: 'Basic API greeting',
        operationId: 'getRoot',
        responses: {
          '200': {
            description: 'Plain text greeting',
            content: {
              'text/plain': { schema: { type: 'string', example: 'Hello, World!' } },
            },
          },
        },
      },
    },
    '/auth/google': {
      post: {
        tags: ['Auth'],
        summary: 'Sign in or create a user with Google',
        operationId: 'signInWithGoogle',
        requestBody: requestBody(ref('GoogleAuthRequest')),
        responses: {
          '200': jsonResponse('Authenticated user and JWT', ref('GoogleAuthResponse')),
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
          '403': errorResponses.Forbidden,
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get the authenticated user',
        operationId: 'getAuthenticatedUser',
        security: bearerSecurity,
        responses: {
          '200': jsonResponse('Authenticated user profile', ref('UserPrivateProfile')),
          '401': errorResponses.Unauthorized,
          '404': errorResponses.NotFound,
        },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'List users',
        operationId: 'listUsers',
        parameters: [
          ...pageParams,
          { name: 'search', in: 'query', schema: { type: 'string', maxLength: 100 } },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', example: 'ACTIVE,BANNED' },
          },
          { name: 'rol', in: 'query', schema: { type: 'string', example: 'USER,ADMIN' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string', enum: ['name', 'email', 'createdAt'] },
          },
        ],
        responses: {
          '200': jsonResponse('Paginated users', paginated(ref('UserListItem'))),
          '400': errorResponses.BadRequest,
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Create a user',
        operationId: 'createUser',
        requestBody: requestBody(ref('UserCreateRequest')),
        responses: {
          '201': jsonResponse('Created user', ref('User')),
          '400': errorResponses.BadRequest,
          '409': errorResponses.Conflict,
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get a user profile',
        description:
          'Returns a private profile when the bearer token belongs to the same user; otherwise returns the public profile.',
        operationId: 'getUserById',
        security: bearerSecurity,
        parameters: [uuidParam('id', 'User ID')],
        responses: {
          '200': jsonResponse('User profile', {
            oneOf: [ref('UserPrivateProfile'), ref('UserPublicProfile')],
          }),
          '400': errorResponses.BadRequest,
          '404': errorResponses.NotFound,
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update the authenticated user profile',
        operationId: 'updateUser',
        security: bearerSecurity,
        parameters: [uuidParam('id', 'User ID')],
        requestBody: requestBody(ref('UserUpdateRequest')),
        responses: {
          '200': jsonResponse('Updated user', ref('User')),
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
          '403': errorResponses.Forbidden,
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete the authenticated user account',
        operationId: 'deleteUser',
        security: bearerSecurity,
        parameters: [uuidParam('id', 'User ID')],
        responses: {
          '204': emptyResponse,
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
          '403': errorResponses.Forbidden,
        },
      },
    },
    '/users/{id}/products': {
      get: {
        tags: ['Users'],
        summary: 'List products published by a user',
        operationId: 'listUserProducts',
        security: bearerSecurity,
        parameters: [uuidParam('id', 'User ID'), ...pageParams],
        responses: {
          '200': jsonResponse('Paginated products', paginated(ref('ProductSummary'))),
          '400': errorResponses.BadRequest,
        },
      },
    },
    '/users/{id}/favorites': {
      get: {
        tags: ['Users'],
        summary: 'List favorite products for the authenticated owner',
        operationId: 'listUserFavorites',
        security: bearerSecurity,
        parameters: [uuidParam('id', 'User ID'), ...pageParams],
        responses: {
          '200': jsonResponse(
            'Paginated favorite products',
            paginated(ref('ProductSummary')),
          ),
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
          '403': errorResponses.Forbidden,
        },
      },
    },
    '/users/{id}/reviews': {
      get: {
        tags: ['Users'],
        summary: 'List reviews received by a user',
        operationId: 'listUserReviews',
        parameters: [uuidParam('id', 'User ID')],
        responses: {
          '200': jsonResponse(
            'Reviews received by the user',
            arrayOf(ref('ProfileReview')),
          ),
          '400': errorResponses.BadRequest,
        },
      },
    },
    '/users/{id}/preferences': {
      get: {
        tags: ['Users'],
        summary: 'Get notification and campus preferences',
        operationId: 'getUserPreferences',
        security: bearerSecurity,
        parameters: [uuidParam('id', 'User ID')],
        responses: {
          '200': jsonResponse('User preferences', ref('UserPreferences')),
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
          '403': errorResponses.Forbidden,
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Replace notification and campus preferences',
        operationId: 'updateUserPreferences',
        security: bearerSecurity,
        parameters: [uuidParam('id', 'User ID')],
        requestBody: requestBody(ref('UserPreferencesRequest')),
        responses: {
          '200': jsonResponse('Updated preferences', ref('UserPreferences')),
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
          '403': errorResponses.Forbidden,
        },
      },
    },
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'List products',
        operationId: 'listProducts',
        parameters: [
          ...pageParams,
          { name: 'search', in: 'query', schema: { type: 'string', maxLength: 100 } },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', example: 'DISPONIBLE,VENDIDO' },
          },
          {
            name: 'condition',
            in: 'query',
            schema: { type: 'string', example: 'NUEVO,BUEN_ESTADO' },
          },
          {
            name: 'categoryIds',
            in: 'query',
            description: 'Comma-separated category IDs.',
            schema: { type: 'string', example: '1,2' },
          },
          { name: 'userId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          {
            name: 'campusIds',
            in: 'query',
            description: 'Comma-separated campus IDs.',
            schema: { type: 'string', example: '1,2' },
          },
          { name: 'minPrice', in: 'query', schema: { type: 'number', minimum: 0 } },
          {
            name: 'maxPrice',
            in: 'query',
            schema: { type: 'number', exclusiveMinimum: 0 },
          },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string', enum: ['price', 'createdAt', 'title'] },
          },
          {
            name: 'order',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'] },
          },
        ],
        responses: {
          '200': jsonResponse('Paginated products', paginated(ref('ProductSummary'))),
          '400': errorResponses.BadRequest,
        },
      },
      post: {
        tags: ['Products'],
        summary: 'Create a product',
        operationId: 'createProduct',
        security: bearerSecurity,
        requestBody: requestBody(ref('ProductRequest')),
        responses: {
          '201': jsonResponse('Created product', ref('ProductDetail')),
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
        },
      },
    },
    '/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get a product by UUID or slug',
        operationId: 'getProductByIdOrSlug',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Product UUID or product slug.',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': jsonResponse('Product detail', ref('ProductDetail')),
          '404': errorResponses.NotFound,
        },
      },
      patch: {
        tags: ['Products'],
        summary: 'Update a product owned by the authenticated user',
        operationId: 'updateProduct',
        security: bearerSecurity,
        parameters: [uuidParam('id', 'Product ID')],
        requestBody: requestBody(ref('ProductUpdateRequest')),
        responses: {
          '200': jsonResponse('Updated product', ref('ProductDetail')),
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
          '403': errorResponses.Forbidden,
          '404': errorResponses.NotFound,
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete a product owned by the authenticated user',
        operationId: 'deleteProduct',
        security: bearerSecurity,
        parameters: [uuidParam('id', 'Product ID')],
        responses: {
          '204': emptyResponse,
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
          '403': errorResponses.Forbidden,
          '404': errorResponses.NotFound,
        },
      },
    },
    '/reviews': {
      get: {
        tags: ['Reviews'],
        summary: 'List legacy seller reviews',
        operationId: 'listReviews',
        parameters: [
          ...pageParams,
          { name: 'sellerId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'reviewerId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': jsonResponse('Paginated reviews', paginated(ref('Review'))),
          '400': errorResponses.BadRequest,
        },
      },
      post: {
        tags: ['Reviews'],
        summary: 'Create a legacy seller review as the authenticated reviewer',
        operationId: 'createReview',
        security: bearerSecurity,
        requestBody: requestBody(ref('ReviewRequest')),
        responses: {
          '201': jsonResponse('Created review', ref('Review')),
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
          '403': errorResponses.Forbidden,
          '409': errorResponses.Conflict,
        },
      },
    },
    '/reviews/{id}': {
      get: {
        tags: ['Reviews'],
        summary: 'Get a legacy review',
        operationId: 'getReviewById',
        parameters: [intParam('id', 'Review ID')],
        responses: {
          '200': jsonResponse('Review detail', ref('Review')),
          '400': errorResponses.BadRequest,
          '404': errorResponses.NotFound,
        },
      },
      patch: {
        tags: ['Reviews'],
        summary: 'Update a legacy review owned by the authenticated reviewer',
        operationId: 'updateReview',
        security: bearerSecurity,
        parameters: [intParam('id', 'Review ID')],
        requestBody: requestBody(ref('ReviewUpdateRequest')),
        responses: {
          '200': jsonResponse('Updated review', ref('Review')),
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
          '403': errorResponses.Forbidden,
          '404': errorResponses.NotFound,
        },
      },
      delete: {
        tags: ['Reviews'],
        summary: 'Delete a legacy review owned by the authenticated reviewer',
        operationId: 'deleteReview',
        security: bearerSecurity,
        parameters: [intParam('id', 'Review ID')],
        responses: {
          '204': emptyResponse,
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
          '403': errorResponses.Forbidden,
          '404': errorResponses.NotFound,
        },
      },
    },
    '/favorites': {
      get: {
        tags: ['Favorites'],
        summary: 'List favorites',
        operationId: 'listFavorites',
        parameters: [
          ...pageParams,
          { name: 'userId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': jsonResponse('Paginated favorites', paginated(ref('FavoriteItem'))),
          '400': errorResponses.BadRequest,
        },
      },
      post: {
        tags: ['Favorites'],
        summary: 'Toggle a product as favorite for the authenticated user',
        operationId: 'toggleFavorite',
        security: bearerSecurity,
        requestBody: requestBody(ref('FavoriteToggleRequest')),
        responses: {
          '200': jsonResponse('Favorite state', ref('FavoriteState')),
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
        },
      },
    },
    '/favorites/check/{productId}': {
      get: {
        tags: ['Favorites'],
        summary: 'Check whether the authenticated user favorited a product',
        operationId: 'checkFavorite',
        security: bearerSecurity,
        parameters: [uuidParam('productId', 'Product ID')],
        responses: {
          '200': jsonResponse('Favorite state', ref('FavoriteState')),
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
        },
      },
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'List categories',
        operationId: 'listCategories',
        responses: {
          '200': jsonResponse('Categories', arrayOf(ref('CategoryWithCount'))),
        },
      },
      post: {
        tags: ['Categories'],
        summary: 'Create a category as an administrator',
        operationId: 'createCategory',
        security: bearerSecurity,
        requestBody: requestBody(ref('CategoryRequest')),
        responses: {
          '201': jsonResponse('Created category', ref('Category')),
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
          '403': errorResponses.Forbidden,
        },
      },
    },
    '/categories/{id}': {
      get: {
        tags: ['Categories'],
        summary: 'Get a category',
        operationId: 'getCategoryById',
        parameters: [intParam('id', 'Category ID')],
        responses: {
          '200': jsonResponse('Category', ref('Category')),
          '400': errorResponses.BadRequest,
          '404': errorResponses.NotFound,
        },
      },
      patch: {
        tags: ['Categories'],
        summary: 'Update a category as an administrator',
        operationId: 'updateCategory',
        security: bearerSecurity,
        parameters: [intParam('id', 'Category ID')],
        requestBody: requestBody(ref('CategoryRequest')),
        responses: {
          '200': jsonResponse('Updated category', ref('Category')),
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
          '403': errorResponses.Forbidden,
          '404': errorResponses.NotFound,
        },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Delete a category as an administrator',
        operationId: 'deleteCategory',
        security: bearerSecurity,
        parameters: [intParam('id', 'Category ID')],
        responses: {
          '204': emptyResponse,
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
          '403': errorResponses.Forbidden,
          '404': errorResponses.NotFound,
        },
      },
    },
    '/campuses': {
      get: {
        tags: ['Campuses'],
        summary: 'List campuses',
        operationId: 'listCampuses',
        responses: {
          '200': jsonResponse('Campuses', arrayOf(ref('Campus'))),
        },
      },
    },
    '/campuses/{id}': {
      get: {
        tags: ['Campuses'],
        summary: 'Get a campus',
        operationId: 'getCampusById',
        parameters: [intParam('id', 'Campus ID')],
        responses: {
          '200': jsonResponse('Campus', ref('Campus')),
          '400': errorResponses.BadRequest,
          '404': errorResponses.NotFound,
        },
      },
    },
    '/conversations': {
      get: {
        tags: ['Conversations'],
        summary: 'List conversations for the authenticated user',
        operationId: 'listConversations',
        security: bearerSecurity,
        responses: {
          '200': jsonResponse('Conversations', arrayOf(ref('ConversationSummary'))),
          '401': errorResponses.Unauthorized,
        },
      },
      post: {
        tags: ['Conversations'],
        summary: 'Create or reopen a buyer/seller conversation',
        operationId: 'createConversation',
        security: bearerSecurity,
        requestBody: requestBody(ref('ConversationRequest')),
        responses: {
          '201': jsonResponse('Conversation', ref('ConversationCreated')),
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
        },
      },
    },
    '/conversations/{id}': {
      get: {
        tags: ['Conversations'],
        summary: 'Get a conversation with messages',
        operationId: 'getConversationById',
        security: bearerSecurity,
        parameters: [uuidParam('id', 'Conversation ID')],
        responses: {
          '200': jsonResponse('Conversation detail', ref('ConversationDetail')),
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
          '404': errorResponses.NotFound,
        },
      },
      delete: {
        tags: ['Conversations'],
        summary: 'Soft-delete a conversation for the authenticated user',
        operationId: 'deleteConversation',
        security: bearerSecurity,
        parameters: [uuidParam('id', 'Conversation ID')],
        responses: {
          '204': emptyResponse,
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
          '404': errorResponses.NotFound,
        },
      },
    },
    '/conversations/{id}/archive': {
      patch: {
        tags: ['Conversations'],
        summary: 'Archive a conversation',
        operationId: 'archiveConversation',
        security: bearerSecurity,
        parameters: [uuidParam('id', 'Conversation ID')],
        responses: {
          '200': jsonResponse('Archive state', ref('ArchiveState')),
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
          '404': errorResponses.NotFound,
        },
      },
    },
    '/conversations/{id}/unarchive': {
      patch: {
        tags: ['Conversations'],
        summary: 'Unarchive a conversation',
        operationId: 'unarchiveConversation',
        security: bearerSecurity,
        parameters: [uuidParam('id', 'Conversation ID')],
        responses: {
          '200': jsonResponse('Archive state', ref('ArchiveState')),
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
          '404': errorResponses.NotFound,
        },
      },
    },
    '/conversations/{id}/messages': {
      post: {
        tags: ['Conversations'],
        summary: 'Send a message in a conversation',
        operationId: 'sendConversationMessage',
        security: bearerSecurity,
        parameters: [uuidParam('id', 'Conversation ID')],
        requestBody: requestBody(ref('SendMessageRequest')),
        responses: {
          '201': jsonResponse('Created message', ref('Message')),
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
          '403': errorResponses.Forbidden,
        },
      },
    },
    '/conversations/{id}/report': {
      post: {
        tags: ['Conversations'],
        summary: 'Report the other participant in a conversation',
        operationId: 'reportConversation',
        security: bearerSecurity,
        parameters: [uuidParam('id', 'Conversation ID')],
        requestBody: requestBody(ref('ReportRequest')),
        responses: {
          '201': jsonResponse('Report result', ref('ReportResult')),
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
          '404': errorResponses.NotFound,
        },
      },
    },
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'List recent notifications for the authenticated user',
        operationId: 'listNotifications',
        security: bearerSecurity,
        responses: {
          '200': jsonResponse('Notifications', ref('NotificationsResponse')),
          '401': errorResponses.Unauthorized,
        },
      },
    },
    '/notifications/read-all': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        operationId: 'markAllNotificationsRead',
        security: bearerSecurity,
        responses: {
          '200': jsonResponse('Number of updated notifications', ref('UpdatedCount')),
          '401': errorResponses.Unauthorized,
        },
      },
    },
    '/notifications/{id}/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark a notification as read',
        operationId: 'markNotificationRead',
        security: bearerSecurity,
        parameters: [intParam('id', 'Notification ID')],
        responses: {
          '200': jsonResponse('Operation status', ref('OkResponse')),
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
        },
      },
    },
    '/push/vapid-key': {
      get: {
        tags: ['Push'],
        summary: 'Get the public VAPID key',
        operationId: 'getVapidKey',
        responses: {
          '200': jsonResponse('VAPID public key', ref('VapidKeyResponse')),
        },
      },
    },
    '/push/subscribe': {
      post: {
        tags: ['Push'],
        summary: 'Subscribe the authenticated user to web push',
        operationId: 'subscribePush',
        security: bearerSecurity,
        requestBody: requestBody(ref('PushSubscriptionRequest')),
        responses: {
          '201': jsonResponse('Subscription status', ref('PushSubscribedResponse')),
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
        },
      },
    },
    '/push/unsubscribe': {
      post: {
        tags: ['Push'],
        summary: 'Unsubscribe the authenticated user from web push',
        operationId: 'unsubscribePush',
        security: bearerSecurity,
        requestBody: requestBody(ref('PushUnsubscribeRequest')),
        responses: {
          '200': jsonResponse('Unsubscription status', ref('PushUnsubscribedResponse')),
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
        },
      },
    },
    '/transactions': {
      post: {
        tags: ['Transactions'],
        summary: 'Mark a product as sold to a buyer',
        operationId: 'createTransaction',
        security: bearerSecurity,
        requestBody: requestBody(ref('TransactionRequest')),
        responses: {
          '201': jsonResponse('Created transaction', ref('Transaction')),
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
          '403': errorResponses.Forbidden,
          '404': errorResponses.NotFound,
          '409': errorResponses.Conflict,
        },
      },
    },
    '/transactions/pending-reviews': {
      get: {
        tags: ['Transactions'],
        summary: 'List transactions that still need a review from the current user',
        operationId: 'listPendingTransactionReviews',
        security: bearerSecurity,
        responses: {
          '200': jsonResponse('Transactions pending review', arrayOf(ref('Transaction'))),
          '401': errorResponses.Unauthorized,
        },
      },
    },
    '/transactions/product/{productId}': {
      get: {
        tags: ['Transactions'],
        summary: 'Get the transaction for a product',
        operationId: 'getTransactionByProduct',
        security: bearerSecurity,
        parameters: [uuidParam('productId', 'Product ID')],
        responses: {
          '200': jsonResponse('Transaction', ref('Transaction')),
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
          '403': errorResponses.Forbidden,
          '404': errorResponses.NotFound,
        },
      },
    },
    '/transactions/{id}': {
      get: {
        tags: ['Transactions'],
        summary: 'Get a transaction',
        operationId: 'getTransactionById',
        security: bearerSecurity,
        parameters: [uuidParam('id', 'Transaction ID')],
        responses: {
          '200': jsonResponse('Transaction', ref('Transaction')),
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
          '403': errorResponses.Forbidden,
          '404': errorResponses.NotFound,
        },
      },
    },
    '/transactions/{id}/reviews': {
      post: {
        tags: ['Transactions'],
        summary: 'Submit a post-sale review',
        operationId: 'submitTransactionReview',
        security: bearerSecurity,
        parameters: [uuidParam('id', 'Transaction ID')],
        requestBody: requestBody(ref('TransactionReviewRequest')),
        responses: {
          '201': jsonResponse('Created transaction review', ref('TransactionReview')),
          '400': errorResponses.BadRequest,
          '401': errorResponses.Unauthorized,
          '403': errorResponses.Forbidden,
          '404': errorResponses.NotFound,
          '409': errorResponses.Conflict,
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        required: ['message', 'code'],
        properties: {
          message: { type: 'string', example: 'Validation failed' },
          code: { type: 'string', example: 'VALIDATION_FAILED' },
          details: { type: 'array', items: ref('ValidationIssue') },
        },
        additionalProperties: false,
      },
      ValidationIssue: {
        type: 'object',
        required: ['field', 'message'],
        properties: {
          field: { type: 'string', example: 'email' },
          message: { type: 'string', example: 'Correo electronico invalido' },
        },
      },
      Pagination: {
        type: 'object',
        required: ['data', 'total', 'page', 'limit', 'totalPages'],
        properties: {
          data: { type: 'array', items: {} },
          total: { type: 'integer', minimum: 0, example: 42 },
          page: { type: 'integer', minimum: 1, example: 1 },
          limit: { type: 'integer', minimum: 1, example: 10 },
          totalPages: { type: 'integer', minimum: 0, example: 5 },
        },
      },
      IdName: {
        type: 'object',
        required: ['id', 'name'],
        properties: {
          id: { type: 'integer', minimum: 1, example: 1 },
          name: { type: 'string', example: 'Mexicali' },
        },
      },
      Campus: {
        allOf: [ref('IdName')],
      },
      Category: {
        allOf: [ref('IdName')],
      },
      CategoryWithCount: {
        allOf: [
          ref('Category'),
          {
            type: 'object',
            properties: {
              _count: {
                type: 'object',
                properties: { products: { type: 'integer', minimum: 0 } },
              },
            },
          },
        ],
      },
      CategoryRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 255, example: 'Libros' },
        },
      },
      UserRole: { type: 'string', enum: ['USER', 'ADMIN'] },
      UserStatus: { type: 'string', enum: ['ACTIVE', 'BANNED'] },
      ProductCondition: {
        type: 'string',
        enum: ['NUEVO', 'COMO_NUEVO', 'BUEN_ESTADO', 'DIGITAL'],
      },
      ProductStatus: { type: 'string', enum: ['DISPONIBLE', 'VENDIDO', 'RESERVADO'] },
      PublicUser: {
        type: 'object',
        required: ['id', 'name', 'photoUrl'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Ana Garcia' },
          photoUrl: { type: ['string', 'null'], format: 'uri' },
        },
      },
      User: {
        type: 'object',
        required: ['id', 'googleId', 'name', 'email', 'campusId', 'rol', 'status'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          googleId: { type: 'string', maxLength: 255 },
          name: { type: 'string', maxLength: 255 },
          email: { type: 'string', format: 'email' },
          campusId: { type: 'integer', minimum: 1 },
          photoUrl: { type: ['string', 'null'], format: 'uri', maxLength: 2048 },
          rol: ref('UserRole'),
          status: ref('UserStatus'),
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      UserListItem: {
        type: 'object',
        required: [
          'id',
          'name',
          'email',
          'photoUrl',
          'rol',
          'status',
          'createdAt',
          'campus',
        ],
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          photoUrl: { type: ['string', 'null'], format: 'uri' },
          rol: ref('UserRole'),
          status: ref('UserStatus'),
          createdAt: { type: 'string', format: 'date-time' },
          campus: ref('Campus'),
        },
      },
      UserPrivateProfile: {
        allOf: [
          ref('UserListItem'),
          {
            type: 'object',
            required: ['googleId', 'updatedAt', '_count', 'rating'],
            properties: {
              googleId: { type: 'string' },
              updatedAt: { type: 'string', format: 'date-time' },
              _count: ref('PrivateUserCounts'),
              rating: ref('RatingSummary'),
            },
          },
        ],
      },
      UserPublicProfile: {
        type: 'object',
        required: ['id', 'name', 'photoUrl', 'createdAt', 'campus', '_count', 'rating'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          photoUrl: { type: ['string', 'null'], format: 'uri' },
          createdAt: { type: 'string', format: 'date-time' },
          campus: ref('Campus'),
          _count: ref('PublicUserCounts'),
          rating: ref('RatingSummary'),
        },
      },
      PrivateUserCounts: {
        type: 'object',
        required: ['products', 'favorites', 'sellerReviews'],
        properties: {
          products: { type: 'integer', minimum: 0 },
          favorites: { type: 'integer', minimum: 0 },
          sellerReviews: { type: 'integer', minimum: 0 },
        },
      },
      PublicUserCounts: {
        type: 'object',
        required: ['products', 'sellerReviews'],
        properties: {
          products: { type: 'integer', minimum: 0 },
          sellerReviews: { type: 'integer', minimum: 0 },
        },
      },
      RatingSummary: {
        type: 'object',
        required: ['average', 'count'],
        properties: {
          average: { type: 'number', minimum: 0, maximum: 5, example: 4.5 },
          count: { type: 'integer', minimum: 0, example: 12 },
        },
      },
      UserCreateRequest: {
        type: 'object',
        required: ['googleId', 'name', 'email', 'campusId'],
        properties: {
          googleId: { type: 'string', maxLength: 255 },
          name: { type: 'string', minLength: 1, maxLength: 255 },
          email: { type: 'string', format: 'email', maxLength: 255 },
          campusId: { type: 'integer', minimum: 1 },
          photoUrl: { type: ['string', 'null'], format: 'uri', maxLength: 2048 },
          rol: ref('UserRole'),
          status: ref('UserStatus'),
        },
      },
      UserUpdateRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 255 },
          campusId: { type: 'integer', minimum: 1 },
        },
        additionalProperties: false,
      },
      GoogleAuthRequest: {
        type: 'object',
        required: ['idToken'],
        properties: {
          idToken: {
            type: 'string',
            description: 'Google ID token returned by the client.',
          },
          campusId: { type: 'integer', minimum: 1, default: 1 },
        },
      },
      GoogleAuthResponse: {
        type: 'object',
        required: ['token', 'isNewUser', 'user'],
        properties: {
          token: { type: 'string' },
          isNewUser: { type: 'boolean' },
          user: {
            allOf: [
              ref('PublicUser'),
              {
                type: 'object',
                required: ['email', 'rol'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  rol: ref('UserRole'),
                },
              },
            ],
          },
        },
      },
      UserPreferences: {
        type: 'object',
        required: ['emailNotifications', 'showContactInfo', 'defaultCampuses'],
        properties: {
          emailNotifications: { type: 'boolean' },
          showContactInfo: { type: 'boolean' },
          defaultCampuses: arrayOf(ref('Campus')),
        },
      },
      UserPreferencesRequest: {
        type: 'object',
        properties: {
          emailNotifications: { type: 'boolean' },
          showContactInfo: { type: 'boolean' },
          campusIds: arrayOf({ type: 'integer', minimum: 1 }),
        },
        additionalProperties: false,
      },
      ProductImage: {
        type: 'object',
        required: ['id', 'url'],
        properties: {
          id: { type: 'integer', minimum: 1 },
          url: { type: 'string', format: 'uri', maxLength: 2048 },
        },
      },
      ProductSummary: {
        type: 'object',
        required: [
          'id',
          'slug',
          'title',
          'price',
          'condition',
          'status',
          'createdAt',
          'images',
          'user',
          'category',
          'campuses',
        ],
        properties: {
          id: { type: 'string', format: 'uuid' },
          slug: { type: 'string', maxLength: 300 },
          title: { type: 'string', maxLength: 255 },
          price: { type: 'string', pattern: '^\\d+(\\.\\d{1,2})?$', example: '350.00' },
          condition: ref('ProductCondition'),
          status: ref('ProductStatus'),
          createdAt: { type: 'string', format: 'date-time' },
          images: arrayOf(ref('ProductImage')),
          user: ref('PublicUser'),
          category: ref('Category'),
          campuses: arrayOf(ref('Campus')),
        },
      },
      ProductDetail: {
        allOf: [
          ref('ProductSummary'),
          {
            type: 'object',
            required: ['description', 'updatedAt', '_count'],
            properties: {
              description: { type: 'string' },
              updatedAt: { type: 'string', format: 'date-time' },
              _count: {
                type: 'object',
                required: ['favorites'],
                properties: { favorites: { type: 'integer', minimum: 0 } },
              },
            },
          },
        ],
      },
      ProductRequest: {
        type: 'object',
        required: ['title', 'description', 'price', 'condition', 'categoryId'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 255 },
          description: { type: 'string', minLength: 1, maxLength: 5000 },
          price: { type: 'number', exclusiveMinimum: 0, maximum: 999999.99 },
          condition: ref('ProductCondition'),
          status: ref('ProductStatus'),
          categoryId: { type: 'integer', minimum: 1 },
          campusIds: arrayOf({ type: 'integer', minimum: 1 }),
          images: arrayOf({ type: 'string', format: 'uri', maxLength: 2048 }),
        },
      },
      ProductUpdateRequest: {
        allOf: [ref('ProductRequest')],
        description: 'All fields are optional for PATCH.',
      },
      Review: {
        type: 'object',
        required: ['id', 'rating', 'createdAt'],
        properties: {
          id: { type: 'integer', minimum: 1 },
          rating: { type: 'number', minimum: 0.5, maximum: 5, multipleOf: 0.5 },
          comment: { type: ['string', 'null'], maxLength: 2000 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          reviewer: ref('PublicUser'),
          seller: {
            type: 'object',
            required: ['id', 'name'],
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
            },
          },
        },
      },
      ReviewRequest: {
        type: 'object',
        required: ['rating', 'sellerId', 'reviewerId'],
        properties: {
          rating: { type: 'number', minimum: 0.5, maximum: 5, multipleOf: 0.5 },
          comment: { type: ['string', 'null'], maxLength: 2000 },
          sellerId: { type: 'string', format: 'uuid' },
          reviewerId: { type: 'string', format: 'uuid' },
        },
      },
      ReviewUpdateRequest: {
        type: 'object',
        properties: {
          rating: { type: 'number', minimum: 0.5, maximum: 5, multipleOf: 0.5 },
          comment: { type: ['string', 'null'], maxLength: 2000 },
        },
        additionalProperties: false,
      },
      ProfileReview: {
        type: 'object',
        required: ['id', 'rating', 'createdAt', 'reviewer', 'product'],
        properties: {
          id: { type: 'integer', minimum: 1 },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          comment: { type: ['string', 'null'] },
          createdAt: { type: 'string', format: 'date-time' },
          reviewer: ref('PublicUser'),
          product: {
            type: 'object',
            required: ['id', 'title', 'slug'],
            properties: {
              id: { type: 'string', format: 'uuid' },
              title: { type: 'string' },
              slug: { type: 'string' },
            },
          },
        },
      },
      FavoriteItem: {
        type: 'object',
        required: ['createdAt', 'product'],
        properties: {
          createdAt: { type: 'string', format: 'date-time' },
          product: {
            type: 'object',
            required: ['id', 'title', 'price', 'status', 'images'],
            properties: {
              id: { type: 'string', format: 'uuid' },
              title: { type: 'string' },
              price: { type: 'string', example: '350.00' },
              status: ref('ProductStatus'),
              images: arrayOf({
                type: 'object',
                properties: { url: { type: 'string' } },
              }),
            },
          },
        },
      },
      FavoriteToggleRequest: {
        type: 'object',
        required: ['productId'],
        properties: {
          productId: { type: 'string', format: 'uuid' },
        },
      },
      FavoriteState: {
        type: 'object',
        required: ['favorited'],
        properties: {
          favorited: { type: 'boolean' },
        },
      },
      ConversationProduct: {
        type: 'object',
        required: ['id', 'title', 'slug', 'price', 'status', 'images'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          slug: { type: 'string' },
          price: { type: 'string', example: '350.00' },
          status: ref('ProductStatus'),
          images: arrayOf({ type: 'object', properties: { url: { type: 'string' } } }),
        },
      },
      MessageReply: {
        type: 'object',
        required: ['id', 'content', 'sender'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          content: { type: 'string' },
          sender: {
            type: 'object',
            required: ['id', 'name'],
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
            },
          },
        },
      },
      Message: {
        type: 'object',
        required: ['id', 'content', 'senderId', 'conversationId', 'createdAt', 'sender'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          content: { type: 'string' },
          senderId: { type: 'string', format: 'uuid' },
          conversationId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          readAt: { type: ['string', 'null'], format: 'date-time' },
          sender: ref('PublicUser'),
          replyTo: { oneOf: [ref('MessageReply'), { type: 'null' }] },
        },
      },
      ConversationSummary: {
        type: 'object',
        required: [
          'id',
          'createdAt',
          'updatedAt',
          'buyerId',
          'sellerId',
          'buyer',
          'seller',
          'product',
          'messages',
          '_count',
        ],
        properties: {
          id: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          buyerId: { type: 'string', format: 'uuid' },
          sellerId: { type: 'string', format: 'uuid' },
          buyerArchivedAt: { type: ['string', 'null'], format: 'date-time' },
          sellerArchivedAt: { type: ['string', 'null'], format: 'date-time' },
          buyer: ref('PublicUser'),
          seller: ref('PublicUser'),
          product: ref('ConversationProduct'),
          messages: arrayOf({
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              content: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              senderId: { type: 'string', format: 'uuid' },
            },
          }),
          _count: {
            type: 'object',
            properties: { messages: { type: 'integer', minimum: 0 } },
          },
        },
      },
      ConversationDetail: {
        allOf: [
          ref('ConversationSummary'),
          {
            type: 'object',
            required: ['messages'],
            properties: {
              buyer: {
                allOf: [
                  ref('PublicUser'),
                  {
                    type: 'object',
                    properties: { email: { type: 'string', format: 'email' } },
                  },
                ],
              },
              seller: {
                allOf: [
                  ref('PublicUser'),
                  {
                    type: 'object',
                    properties: { email: { type: 'string', format: 'email' } },
                  },
                ],
              },
              product: {
                allOf: [
                  ref('ConversationProduct'),
                  { type: 'object', properties: { description: { type: 'string' } } },
                ],
              },
              messages: arrayOf(ref('Message')),
            },
          },
        ],
      },
      ConversationCreated: {
        type: 'object',
        required: ['id', 'buyerId', 'sellerId', 'productId', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          buyerId: { type: 'string', format: 'uuid' },
          sellerId: { type: 'string', format: 'uuid' },
          productId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ConversationRequest: {
        type: 'object',
        required: ['sellerId', 'productId'],
        properties: {
          sellerId: { type: 'string', format: 'uuid' },
          productId: { type: 'string', format: 'uuid' },
        },
      },
      ArchiveState: {
        type: 'object',
        required: ['archived'],
        properties: { archived: { type: 'boolean' } },
      },
      SendMessageRequest: {
        type: 'object',
        required: ['content'],
        properties: {
          content: { type: 'string', minLength: 1 },
          replyToId: { type: 'string', format: 'uuid' },
        },
      },
      ReportRequest: {
        type: 'object',
        required: ['reason'],
        properties: {
          reason: {
            type: 'string',
            enum: ['SPAM', 'ACOSO', 'FRAUDE', 'CONTENIDO_INAPROPIADO', 'OTRO'],
          },
          detail: { type: 'string' },
        },
      },
      ReportResult: {
        type: 'object',
        required: ['reported'],
        properties: { reported: { type: 'boolean' } },
      },
      NotificationType: { type: 'string', enum: ['MESSAGE', 'SALE_REVIEW'] },
      Notification: {
        type: 'object',
        required: ['id', 'type', 'title', 'body', 'url', 'createdAt'],
        properties: {
          id: { type: 'integer', minimum: 1 },
          type: ref('NotificationType'),
          title: { type: 'string', maxLength: 255 },
          body: { type: 'string', maxLength: 500 },
          url: { type: 'string', maxLength: 500 },
          imageUrl: { type: ['string', 'null'], format: 'uri' },
          avatarUrl: { type: ['string', 'null'], format: 'uri' },
          readAt: { type: ['string', 'null'], format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      NotificationsResponse: {
        type: 'object',
        required: ['notifications', 'unreadCount'],
        properties: {
          notifications: arrayOf(ref('Notification')),
          unreadCount: { type: 'integer', minimum: 0 },
        },
      },
      OkResponse: {
        type: 'object',
        required: ['ok'],
        properties: { ok: { type: 'boolean' } },
      },
      UpdatedCount: {
        type: 'object',
        required: ['updated'],
        properties: { updated: { type: 'integer', minimum: 0 } },
      },
      VapidKeyResponse: {
        type: 'object',
        required: ['publicKey'],
        properties: { publicKey: { type: 'string' } },
      },
      PushSubscriptionRequest: {
        type: 'object',
        required: ['endpoint', 'keys'],
        properties: {
          endpoint: { type: 'string', format: 'uri', maxLength: 500 },
          keys: {
            type: 'object',
            required: ['p256dh', 'auth'],
            properties: {
              p256dh: { type: 'string', minLength: 1 },
              auth: { type: 'string', minLength: 1 },
            },
          },
        },
      },
      PushUnsubscribeRequest: {
        type: 'object',
        required: ['endpoint'],
        properties: {
          endpoint: { type: 'string', format: 'uri' },
        },
      },
      PushSubscribedResponse: {
        type: 'object',
        required: ['subscribed'],
        properties: { subscribed: { type: 'boolean' } },
      },
      PushUnsubscribedResponse: {
        type: 'object',
        required: ['unsubscribed'],
        properties: { unsubscribed: { type: 'boolean' } },
      },
      TransactionParty: {
        type: 'object',
        required: ['id', 'name', 'photoUrl'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          photoUrl: { type: ['string', 'null'], format: 'uri' },
        },
      },
      TransactionReview: {
        type: 'object',
        required: ['id', 'rating', 'createdAt', 'from', 'to'],
        properties: {
          id: { type: 'integer', minimum: 1 },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          comment: { type: ['string', 'null'] },
          createdAt: { type: 'string', format: 'date-time' },
          from: ref('TransactionParty'),
          to: {
            type: 'object',
            required: ['id', 'name'],
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
            },
          },
        },
      },
      Transaction: {
        type: 'object',
        required: ['id', 'createdAt', 'product', 'seller', 'buyer', 'reviews'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          conversationId: { type: ['string', 'null'], format: 'uuid' },
          product: {
            type: 'object',
            required: ['id', 'title', 'slug', 'images'],
            properties: {
              id: { type: 'string', format: 'uuid' },
              title: { type: 'string' },
              slug: { type: 'string' },
              images: arrayOf({
                type: 'object',
                properties: { url: { type: 'string' } },
              }),
            },
          },
          seller: ref('TransactionParty'),
          buyer: ref('TransactionParty'),
          reviews: arrayOf(ref('TransactionReview')),
        },
      },
      TransactionRequest: {
        type: 'object',
        required: ['productId', 'buyerId'],
        properties: {
          productId: { type: 'string', format: 'uuid' },
          buyerId: { type: 'string', format: 'uuid' },
          conversationId: { type: 'string', format: 'uuid' },
        },
      },
      TransactionReviewRequest: {
        type: 'object',
        required: ['rating'],
        properties: {
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          comment: { type: 'string' },
        },
      },
    },
  },
} as const
