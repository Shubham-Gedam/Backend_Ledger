import transactionModel from '../models/transaction.model.js';
import ledgerModel from '../models/ledger.model.js';
import * as emailService from '../services/email.service.js';
import accountModel from '../models/account.model.js';
import mongoose from 'mongoose';



/** Create a new transaction

* THE 10-STEP TRANSFER FLOW:
* 1. Validate request
* 2. Validate idempotency key
* 3. Check account status
* 4. Derive sender balance from ledger
* 5. Create transaction (PENDING)
* 6. Create DEBIT ledger entry
* 7. Create CREDIT ledger entry
* 8. Mark transaction COMPLETED
* 9. Commit MongoDB session
* 10. Send email notification
 */

export async function   createTransaction(req, res) {

    /** 1. Validate request */
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if( !fromAccount || !toAccount || !amount || !idempotencyKey ) {
        return res.status(400).json({ 
            error: 'Missing required fields' 
        });
    }

    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount,
    });

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if( !fromUserAccount || !toUserAccount ) {
        return res.status(400).json({
            error: 'One or both accounts not found'
        });
    }

    /**2. Validate idempotency key */

    const isTransactionAlreadyExists = await transactionModel.findOne({ 
        idempotencyKey: idempotencyKey 
    });
    if (isTransactionAlreadyExists) {
        if (isTransactionAlreadyExists.status === 'COMPLETED') {
            return res.status(200).json({
                message: 'Transaction already completed',
                transaction: isTransactionAlreadyExists
            });
        }
        if (isTransactionAlreadyExists.status === 'PENDING') {
            return res.status(200).json({
                message: 'Transaction is pending',
                // transaction: isTransactionAlreadyExists
            });
        }
        if (isTransactionAlreadyExists.status === 'FAILED') {
            return res.status(500).json({
                message: 'Transaction failed',
            });
        }
        if (isTransactionAlreadyExists.status === 'REVERSED') {
            return res.status(500).json({
                message: 'Transaction reversed, please contact support',
            })
        }
    }


    /** 3. Check account status */

    if(fromUserAccount.status !== 'ACTIVE' || toUserAccount.status !== 'ACTIVE') {
        return res.status(400).json({
            message: 'One or both accounts are not active'
        })
    }


    /** 4. Derive sender balance from ledger */

    const balance = await fromUserAccount.getBalance();

    if(balance < amount) {
        return res.status(400).json({
            message: `Insufficient balance, current balance is ${balance}. required balance is ${amount}`
        })
    }


    /** 5. Create transaction (PENDING) */

        const session = await transactionModel.startSession();
        session.startTransaction();

        const transaction = await transactionModel.create({
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: 'PENDING'
        }, { session });       
        
        const debitLedgerEntry = await ledgerModel.create({
            account: fromAccount,
            transaction: transaction._id,
            amount: amount,
            type: 'DEBIT'
        }, { session });

        const creditLedgerEntry = await ledgerModel.create({
            account: toAccount,
            transaction: transaction._id,
            amount: amount,
            type: 'CREDIT'
        }, { session });

        transaction.status = 'COMPLETED';
        await transaction.save({ session });

        await session.commitTransaction();
        session.endSession();

    /** 10. Send email notification */

    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, fromAccount, toAccount);

    return res.status(201).json({
        message: 'Transaction completed successfully',
        transaction
    });

}

export async function createInitialFundsTransaction(req, res) {

    const { toAccount, amount, idempotencyKey } = req.body;
    
    if( !toAccount || !amount || !idempotencyKey ) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if( !toUserAccount ) {
        return res.status(400).json({
            message: "Invalid toAccount, account not found"
        })
    }

    const fromUserAccount = await accountModel.findOne({
    
        user: req.user._id
    })

    if( !fromUserAccount ) {
        return res.status(400).json({
            message: "System account for the user not found"
        });
    }

    const session = await transactionModel.startSession();
    session.startTransaction();

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: 'PENDING'
    });
    
    const debitLedgerEntry = await ledgerModel.create([{
    account: fromUserAccount._id,
    transaction: transaction._id,
    amount: amount,
    type: 'debit'
    }], { session });

    const creditLedgerEntry = await ledgerModel.create([{
    account: toAccount,
    transaction: transaction._id,
    amount: amount,
    type: 'credit'
    }], { session });


    transaction.status = 'COMPLETED';
    await transaction.save({ session });


    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        transaction
    });

}