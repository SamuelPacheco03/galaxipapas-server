import mongoose from "mongoose";

const AttemptSchema = new mongoose.Schema(
    {
      code: { type: String, trim: true, unique: true },
      date:  { type: Date},
      user_id: { type: mongoose.Schema.Types.ObjectId, rf: 'User', required: true }
    },
    {
      timestamps: true,
    }
  );

  export default mongoose.model("Attempt", AttemptSchema);