import { model, Schema } from "mongoose";

const bookSchema = new Schema({
	title: Schema.Types.String,
	published: Schema.Types.Number,
	author: Schema.Types.String,
	genres: [Schema.Types.String],
});

export const Book = model("Book", bookSchema);
