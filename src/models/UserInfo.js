import mongoose from "mongoose";

const UserInfoSchema = new mongoose.Schema(
    {
      name: { type: String, trim: true },
      birthdate: { type: Date, required: true },
      document_number: { type: String, required: true, unique: true, trim: true },
      phone: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    },
    {
      timestamps: true,
    }
  );



  export default mongoose.model("UserInfo", UserInfoSchema);