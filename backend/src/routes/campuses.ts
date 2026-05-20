import { Router, type IRouter } from 'express'
import CampusController from '#controllers/Campuses'

export const campusesRouter: IRouter = Router()

campusesRouter.get('/', CampusController.getAll)
campusesRouter.get('/:id', CampusController.getById)
