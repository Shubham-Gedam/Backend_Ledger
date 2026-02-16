import express from 'express';
import * as authMiddleware from '../middlewares/auth.middleware.js';
import * as accountContoller from '../controllers/account.controller.js';

const router = express.Router();

router.post("/", authMiddleware.authMiddleware, accountContoller.CreateAccountController)

router.get("/", authMiddleware.authMiddleware, accountContoller.GetAccountsController)



export default router;