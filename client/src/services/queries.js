import { gql } from "@apollo/client";

export const ALL_BOOKS = gql`
	query {
		allBooks {
			title
			id
			author
			published
		}
	}
`;

export const ALL_AUTHORS = gql`
	query {
		allAuthors {
			name
			id
			born
			bookCount
		}
	}
`;

export const ADD_BOOK = gql`
    mutation ADDBOOK($title: String!, $author: String!, $published: Int!, $genres: [String!]) {
        addBook(
            title: $title, 
            author: $author, 
            published: $published, 
            genres: $genres
        ) {
            title
            author
            published
            genres
        }
    }
`;

export const EDIT_AUTHOR = gql`
    mutation EDITAUTHOR($name: String!, $born: Int!) {
        editAuthor(
            name: $name, 
            born: $born
        ) {
            name
            id
            born
            bookCount
        }
    }
`;
