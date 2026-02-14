import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "account must be associated with a user."],
        index: true
    },
    status:{
        type: String,
        enum:{
            values: ["ACTIVE", "FROZEN", "CLOSED"],
            message: "Account status must be either ACTIVE, FROZEN, or CLOSED."
        },
        default: "ACTIVE"
    },
    currency:{
        type: String,
        required: [true, "Currency is required for account creation."],
        default: "INR",
    }
},{
    timestamps: true
})

accountSchema.index({ user:1, status: 1 })

const accountModel = mongoose.model("Account", accountSchema);

export default accountModel;