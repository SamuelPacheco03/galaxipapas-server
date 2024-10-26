import mongoose from "mongoose";

const CodeSchema = new mongoose.Schema(
    {
      code: { type: String, trim: true, unique: true },
      prize: { type: String, required: true },
      state: { type: String, required: true },
      date:  { type: Date},
    },
    {
      timestamps: true,
    }
  );

  export default mongoose.model("Code", CodeSchema);