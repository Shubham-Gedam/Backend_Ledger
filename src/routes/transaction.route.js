import { Router } from "express";
import * as authMiddleware from "../middlewares/auth.middleware.js";
import * as transactionController from "../controllers/transaction.controller.js";



const transactionRoutes = Router();

transactionRoutes.post("/", authMiddleware.authMiddleware, transactionController.createTransaction)


/**
 * - POST /api/transactions/system/initial-funds
 * - Create initial funds transaction from system user
 */
transactionRoutes.post("/system/initial-funds", authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransaction)

export default transactionRoutes