import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { v4 as uuid } from "uuid";

interface Author {
	name: string;
	id?: string;
	phone?: string;
	born?: number;
}

interface Book {
	title: string;
	published: number;
	author: string;
	id?: string;
	genres: string[];
}

let authors: Author[] = [
	{
		name: "Robert Martin",
		id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
		born: 1952,
	},
	{
		name: "Martin Fowler",
		id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
		born: 1963,
	},
	{
		name: "Fyodor Dostoevsky",
		id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
		born: 1821,
	},
	{
		name: "Joshua Kerievsky", // birthyear not known
		id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
	},
	{
		name: "Sandi Metz", // birthyear not known
		id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
	},
];

let books = [
	{
		title: "Clean Code",
		published: 2008,
		author: "Robert Martin",
		id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
		genres: ["refactoring"],
	},
	{
		title: "Agile software development",
		published: 2002,
		author: "Robert Martin",
		id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
		genres: ["agile", "patterns", "design"],
	},
	{
		title: "Refactoring, edition 2",
		published: 2018,
		author: "Martin Fowler",
		id: "afa5de00-344d-11e9-a414-719c6709cf3e",
		genres: ["refactoring"],
	},
	{
		title: "Refactoring to patterns",
		published: 2008,
		author: "Joshua Kerievsky",
		id: "afa5de01-344d-11e9-a414-719c6709cf3e",
		genres: ["refactoring", "patterns"],
	},
	{
		title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
		published: 2012,
		author: "Sandi Metz",
		id: "afa5de02-344d-11e9-a414-719c6709cf3e",
		genres: ["refactoring", "design"],
	},
	{
		title: "Crime and punishment",
		published: 1866,
		author: "Fyodor Dostoevsky",
		id: "afa5de03-344d-11e9-a414-719c6709cf3e",
		genres: ["classic", "crime"],
	},
	{
		title: "Demons",
		published: 1872,
		author: "Fyodor Dostoevsky",
		id: "afa5de04-344d-11e9-a414-719c6709cf3e",
		genres: ["classic", "revolution"],
	},
];

const typeDefs = `
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
		bookCount: () => books.length,
		authorCount: () => authors.length,
		allBooks: (
			root: any,
			args: { author: string; genre: string }
		): Book[] => {
			let result = [...books];
			if (args.author) {
				result = result.filter((book) => book.author === args.author);
			} else if (args.genre) {
				result = result.filter((book) =>
					book.genres.includes(args.genre)
				);
			}
			return result;
		},
		allAuthors: () => authors,
	},
	Book: {
		author: (root: any) =>
			authors.find((author) => author.name === root.author)?.name,
	},
	Author: {
		bookCount: (root: any) => {
			const ownBooks = books.filter((book) => book.author === root.name);
			return ownBooks.length;
		},
	},
	Mutation: {
		addBook: (root: any, args: Book) => {
			const book = { ...args, id: uuid() };
			if (!authors.find((author) => author.name === book.author)) {
				authors = authors.concat({ name: book.author });
			}
			books = books.concat(book);
			return book;
		},
		editAuthor: (root: any, args: { name: string; born: number }) => {
			const author = authors.find((author) => author.name === args.name);

			if (!author) return null;
			author.born = args.born;

			authors = authors.map((a) => (a.name === args.name ? author : a));

			return author;
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
