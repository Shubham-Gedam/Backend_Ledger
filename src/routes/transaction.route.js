import { Router } from "express";
import * as authMiddleware from "../middlewares/auth.middleware.js";
import * as transactionController from "../controllers/transaction.controller.js";



const transactionRouter = Router();

transactionRouter.post('/', authMiddleware.authMiddleware,transactionController.createTransaction)

export default transactionRouter