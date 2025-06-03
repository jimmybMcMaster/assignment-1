import previous_assignment from "./assignment-2";

export type BookID = string;

export interface Book {
  id?: BookID;
  name: string;
  author: string;
  description: string;
  price: number;
  image: string;
}

// If multiple filters are provided, any book that matches at least one of them should be returned
// Within a single filter, a book would need to match all the given conditions
export interface Filter {
  from?: number;
  to?: number;
  name?: string;
  author?: string;
}

async function listBooks(filters?: Filter[]): Promise<Book[]> {
  let url = "http://localhost:3000/books";

  // If filters exist, append them to the URL
  if (filters && filters.length > 0) {
    const params = new URLSearchParams();

    filters.forEach((filter) => {
      if (filter.from !== undefined) {
        params.append("from", String(filter.from));
      }
      if (filter.to !== undefined) {
        params.append("to", String(filter.to));
      }
      if (filter.name) {
        params.append("name", filter.name);
      }
      if (filter.author) {
        params.append("author", filter.author);
      }
    });

    url += `?${params.toString()}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch books");
  }

  return (await response.json()) as Book[];
}

async function createOrUpdateBook(book: Book): Promise<Book> {
  return await previous_assignment.createOrUpdateBook(book);
}

async function removeBook(book: BookID): Promise<void> {
  await previous_assignment.removeBook(book);
}

const assignment = "assignment-3";

export default {
  assignment,
  createOrUpdateBook,
  removeBook,
  listBooks,
};
