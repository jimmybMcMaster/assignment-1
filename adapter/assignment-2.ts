import assignment1 from "./assignment-1";
import books from'./../mcmasteful-book-list.json';
import { v4 as uuidv4 } from 'uuid';

export type BookID = string;

export interface Book {
    id?: BookID,
    name: string,
    author: string,
    description: string,
    price: number,
    image: string,
};

export const booksArray: Book[] = books; //Clears typescript id doesn't exist error

booksArray.forEach((book) => {
    if (!book.id) {
        book.id = uuidv4(); // Assign a uuid if missing
    }
});

async function listBooks(filters?: Array<{from?: number, to?: number}>) : Promise<Book[]>{
    return assignment1.listBooks(filters);
}

async function createOrUpdateBook(book: Book): Promise<BookID> {
   const bookIndex = booksArray.findIndex(b => b.id === book.id);
    
   if (bookIndex !== -1) {
        // Update the existing book
        booksArray[bookIndex] = { ...booksArray[bookIndex], ...book };
    } else {
        // Add new book
        booksArray.push(book);
    }
    return book.id as BookID;
}

async function removeBook(book: BookID): Promise<void> {
   const bookIndex = booksArray.findIndex(b => b.id === book);
   booksArray.splice(bookIndex, 1); 
}

const assignment = "assignment-2";

export default {
    assignment,
    createOrUpdateBook,
    removeBook,
    listBooks
};