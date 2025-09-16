import mongoose, { Schema, Document } from "mongoose";

export interface ICourse extends Document {
  title: string;                     
  description?: string;              
  indexId: mongoose.Types.ObjectId;  // reference to Index
}

const courseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  description: { type: String,required: true },
  indexId: { type: mongoose.Schema.Types.ObjectId, ref: "Index", required: true },
});

export default mongoose.model<ICourse>("Course", courseSchema);
