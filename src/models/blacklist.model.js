import mongoose from "mongoose";

const tokenBlackList = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

tokenBlackList.index({ createdAt: 1 },{
    expireAfterSeconds: 60 * 60 * 24 *3
});


const tokenBlackListModel = mongoose.model("tokenBlackList",tokenBlackList)

export default tokenBlackListModel;