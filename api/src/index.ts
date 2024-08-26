import { GraphQLError } from "graphql";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import mongoose from "mongoose";
import { config } from "dotenv";
import { Book } from "./models/book.js";
import { Author } from "./models/author.js";
import jwt from "jsonwebtoken";
import { User } from "./models/user.js";

config();

interface BookType {
	title: string;
	published: number;
	author: string;
	id?: string;
	genres: string[];
}

mongoose
	.connect(process.env.MONGODB_URI as string)
	.then(() => {
		console.log("Connected to mongodb");
	})
	.catch((error) => {
		console.log("Error connection to mongodb");
	});

const typeDefs = `
	type User {
		email: String!
	}

	type Token {
		value: String!
	}
	
    type Author {
        name: String!
        id: ID!
        born: Int
        bookCount: Int!
    }

    type Book {
        title: String!
        published: Int!
        author: String!
        id: ID!
        genres: [String!]
    }

    type Query {
        bookCount: Int!
        authorCount: Int!
        allBooks(author: String, genre: String): [Book!]
        allAuthors: [Author!]
		me: User
    }

    type Mutation {
        addBook(
            title: String!
            author: String!
            published: Int!
            genres: [String!]
        ): Book
        editAuthor(name: String!, born: Int!): Author

		createUSer(email: string!): User
		login(
			email: string!
			password: string!
		): Token
    }
`;

const resolvers = {
	Query: {
		bookCount: () => Book.collection.length,
		authorCount: () => Author.collection.length,
		allBooks: (root: any, args: { author: string; genre: string }) => {
			if (args.author && args.author) {
				return Book.find({
					author: args.author,
					genres: args.genre,
				});
			} else if (args.author) {
				return Book.find({
					author: args.author,
				});
			} else if (args.genre) {
				return Book.find({
					genres: args.genre,
				});
			}
			return Book.find();
		},
		allAuthors: () => Author.find(),
		me: (root: any, args: any, context: any) => context.currentUser,
	},
	Book: {
		author: (root: any) => Author.findOne({ name: root.author }),
	},
	Author: {
		bookCount: async (root: any) => {
			const books = await Book.find({ author: root.name });
			return books.length;
		},
	},
	Mutation: {
		addBook: async (root: any, args: BookType, context: any) => {
			if (!context.currentUser) {
				throw new GraphQLError("not authenticated", {
					extensions: {
						code: "BAD_USER_INPUT",
					},
				});
			}

			try {
				const authorId = args.author;

				if (!Author.findById(authorId)) {
					await Author.create({ name: args.author });
				}

				return Book.create({ ...args });
			} catch (error) {
				throw new GraphQLError("Saving book failed");
			}
		},
		editAuthor: async (
			root: any,
			args: { name: string; born: number },
			context: any
		) => {
			if (!context.currentUser) {
				throw new GraphQLError("not authenticated", {
					extensions: {
						code: "BAD_USER_INPUT",
					},
				});
			}

			try {
				const author = await Author.findOne({ name: args.name });

				if (!author) return null;

				author.born = args.born;

				await author.save();

				return author;
			} catch (error) {
				throw new GraphQLError("Saving born failed");
			}
		},
		createUser: async (root: any, args: { email: string }) => {
			const user = new User({ email: args.email });

			return user.save().catch((error) => {
				throw new GraphQLError("Creating user failed");
			});
		},
		login: async (root: any, args: { email: string; password: string }) => {
			const user = await User.findOne({ email: args.email });

			if (!user || args.password !== user.password) {
				throw new GraphQLError("Wrong credentials");
			}

			const userForToken = {
				email: user.email,
				id: user._id,
			};

			return {
				value: jwt.sign(userForToken, process.env.JWT_SECRET as string),
			};
		},
	},
};

const server = new ApolloServer({
	typeDefs,
	resolvers,
});

startStandaloneServer(server, {
	listen: { port: 4000 },
	context: async ({ req, res }) => {
		const auth = req ? req.headers.authorization : null;

		if (auth && auth.startsWith("Bearer ")) {
			const decodedToken = jwt.verify(
				auth.substring(8),
				process.env.JWT_SECRET as string
			) as { email: String; id: string };

			const currentUser = await User.findById(decodedToken.id);

			return { currentUser };
		}
	},
}).then(({ url }) => {
	console.log(`Server ready at ${url}`);
});
