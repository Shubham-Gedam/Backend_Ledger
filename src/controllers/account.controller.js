import accountModel from "../models/account.model.js";

export async function CreateAccountController(req, res){

    const user =  req.user;

    const account = await accountModel.create({
        user: user._id,
    })
    res.status(201).json({
        account
    })
}

export async function GetAccountsController(req, res){

    const accounts = await accountModel.find({user: req.user._id});

    res.status(200).json({
        accounts
    })
}