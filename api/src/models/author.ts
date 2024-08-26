import { Schema, model } from "mongoose";

const authorSchema = new Schema({
	name: Schema.Types.String,
	phone: Schema.Types.String,
	born: Schema.Types.Number,
});

export const Author = model("Author", authorSchema);
