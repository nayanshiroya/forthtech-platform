import mongoose, { Schema, Document } from "mongoose";

export interface IIndex extends Document {
  name: string;
  description?: string;
  categoryId: mongoose.Types.ObjectId;
}

const indexSchema = new Schema<IIndex>({
  name: { type: String, required: true },
  description: { type: String ,required: true},
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
});

export default mongoose.model<IIndex>("Index", indexSchema);
