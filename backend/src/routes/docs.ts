import { Router, type IRouter } from 'express'
import swaggerUi from 'swagger-ui-express'
import { openApiDocument } from '#docs/openapi'

export const docsRouter: IRouter = Router()

docsRouter.get('/openapi.json', (_req, res) => {
  res.json(openApiDocument)
})

docsRouter.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customSiteTitle: 'CIMarket API Docs',
    swaggerOptions: {
      persistAuthorization: false,
      displayRequestDuration: true,
      defaultModelsExpandDepth: 1,
      docExpansion: 'none',
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  }),
)
