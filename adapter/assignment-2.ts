export type BookID = string;

export interface Book {
  id?: BookID;
  name: string;
  author: string;
  description: string;
  price: number;
  image: string;
}

async function listBooks(filters?: Array<{ from?: number; to?: number }>): Promise<Book[]> {
  let url = 'http://localhost:3000/books';

  // If filters exist, append them to the URL
  if (filters && filters.length > 0) {
    const params = new URLSearchParams();
    filters.forEach((filter) => {
      if (filter.from !== undefined) {
        params.append('from', String(filter.from)); 
      }
      if (filter.to !== undefined) {
        params.append('to', String(filter.to)); 
      }
    });
    url += `?${params.toString()}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch books');
  }

  return (await response.json()) as Book[];
}

async function createOrUpdateBook(book: Book): Promise<Book> {
  const hasId = Boolean(book.id);
  const url = hasId ? `http://localhost:3000/books/${book.id}` : 'http://localhost:3000/books';
  const method = hasId ? 'PUT' : 'POST';

  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book),
  });

  if (!response.ok) {
    throw new Error('Failed to create or update book');
  }

  const data: any = await response.json();
  return data.book;
}

async function removeBook(bookId: BookID): Promise<void> {
  const response = await fetch(`http://localhost:3000/books/${bookId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to remove book');
  }
}

const assignment = "assignment-2";

export default {
  assignment,
  createOrUpdateBook,
  removeBook,
  listBooks,
};


