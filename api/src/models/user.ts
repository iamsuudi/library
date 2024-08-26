import { Schema, model } from "mongoose";

const userSchema = new Schema({
	name: Schema.Types.String,
	phone: Schema.Types.String,
	email: Schema.Types.String,
	password: { type: Schema.Types.String, default: "secret" },
	born: Schema.Types.Number,
});

export const User = model("User", userSchema);
