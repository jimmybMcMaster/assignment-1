import  connectToMongo  from "../src/server/mongo";

export type BookID = string;

export interface Book {
    id?: BookID,
    name: string,
    author: string,
    description: string,
    price: number,
    image: string,
};

async function getBooksDatabase() {
  const db = await connectToMongo();
  return db.collection<Book>("books");
}

async function listBooks(filters?: { from?: number; to?: number }[]): Promise<Book[]> {
  const collection = await getBooksDatabase(); //Get the book collection 

  let query = {};

  if (filters?.length) {
    const conditions = filters.map(({ from, to }) => {
      const priceQuery: any = {};
      if (from !== undefined) priceQuery.$gte = from;
      if (to !== undefined) priceQuery.$lte = to;
      return { price: priceQuery };
    });

    query = { $and: conditions }; // Combine all conditions with $and
  }

  return await collection.find(query).toArray(); 
}

async function createOrUpdateBook(book: Book): Promise<BookID> {
  const collection = await getBooksDatabase();

  const existingBook = await collection.findOne({ id: book.id });

  if (existingBook) {
    // Update the existing book
    await collection.updateOne(
      { id: book.id },
      { $set: book }
    );
  } else {
    // Insert new book
    await collection.insertOne(book);
  }

  return book.id as BookID;
}

async function removeBook(book: BookID): Promise<void> {
    const collection = await getBooksDatabase();

    const existingBook = await collection.findOne({ id: book });

    if(existingBook) {
        await collection.deleteOne({ id: book });
    }
}

const assignment = "assignment-2";

export default {
    assignment,
    createOrUpdateBook,
    removeBook,
    listBooks
};