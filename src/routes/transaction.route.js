import { Router } from "express";
import * as authMiddleware from "../middlewares/auth.middleware.js";
import * as transactionController from "../controllers/transaction.controller.js";



const transactionRouter = Router();

transactionRouter.post('/', authMiddleware.authMiddleware,transactionController.createTransaction)


/**
 * -POST /api/transactions/system/initial-funds
 * -create initial funds transaction for system user
 */

transactionRouter.post('/system/initial-funds', authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransaction)

export default transactionRouter