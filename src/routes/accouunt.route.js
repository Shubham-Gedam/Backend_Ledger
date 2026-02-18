import express from 'express';
import * as authMiddleware from '../middlewares/auth.middleware.js';
import * as accountController from '../controllers/account.controller.js';

const router = express.Router();

router.post("/", authMiddleware.authMiddleware, accountController.CreateAccountController)

router.get("/", authMiddleware.authMiddleware, accountController.GetAccountsController)

router.get("/balance/:accountId", authMiddleware.authMiddleware, accountController.getAccountBalanceController)



export default router;