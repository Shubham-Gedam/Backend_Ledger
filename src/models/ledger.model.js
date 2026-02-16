import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, 'Account is required'],
        index: true,
        immutable: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        immutable: true
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'transaction',
        required: [true, 'Transaction is required'],
        index: true,
        immutable: true
    },
    type: {
        type: String,
        enum: {
            values: ['debit', 'credit'],
            message: 'Type must be either debit or credit'
        },
        required: [true, 'Type is required'],
        immutable: true
    }

})

function preventLedgerModification() {
    throw new Error('Ledger entries cannot be modified after creation');
}

ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('update', preventLedgerModification);
ledgerSchema.pre('remove', preventLedgerModification);
ledgerSchema.pre('deleteMany', preventLedgerModification);
ledgerSchema.pre('updateMany', preventLedgerModification);
ledgerSchema.pre('findOneAndDelete', preventLedgerModification);
ledgerSchema.pre('findOneAndReplace', preventLedgerModification);
ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);


const ledgerModel = mongoose.model('ledger', ledgerSchema)

export default ledgerModel