import { GraphQLError } from "graphql";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import mongoose from "mongoose";
import { config } from "dotenv";
import { Book } from "./models/book.js";
import { Author } from "./models/author.js";

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
    }

    type Mutation {
        addBook(
            title: String!
            author: String!
            published: Int!
            genres: [String!]
        ): Book
        editAuthor(name: String!, born: Int!): Author
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
		addBook: async (root: any, args: BookType) => {
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
		editAuthor: async (root: any, args: { name: string; born: number }) => {
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
	},
};

const server = new ApolloServer({
	typeDefs,
	resolvers,
});

startStandaloneServer(server, {
	listen: { port: 4000 },
}).then(({ url }) => {
	console.log(`Server ready at ${url}`);
});
