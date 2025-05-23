import Router from "koa-router";
import connectToMongo from "./mongo";
import { v4 as uuidv4 } from "uuid";
import { Book } from "../../adapter/assignment-2";

const router = new Router();
const collectionName = "books";

// Helper function to connect to mongodb and return the book collection
async function getCollection() {
  const db = await connectToMongo();
  return db.collection<Book>(collectionName);
}

// CREATE book
router.post("/books", async (ctx) => {
  try {
    //validate user inputs
    const { name, author, description, price, image } = ctx.request
      .body as Book;
    if (!name || !author || !description || !price || !image) {
      ctx.status = 400;
      ctx.body = { error: "All fields are required" };
      return;
    }
    // Extra validation for price --> proper decimal format and above 0
    if (
      typeof price !== "number" ||
      price < 0 ||
      Number(price.toFixed(2)) !== price
    ) {
      ctx.status = 400;
      ctx.body = {
        error: "Price must be a positive number to 2 decimal places",
      };
      return;
    }

    const book: Book = {
      id: uuidv4(),
      name,
      author,
      description,
      price: Number(price),
      image,
    };
    //Await helper function and insert new book into db
    const collection = await getCollection();
    await collection.insertOne(book);
    ctx.status = 201;
    ctx.body = { message: "Book created successfully", book };
  } catch (error) {
    console.error("POST error:", error);
    ctx.status = 500;
    ctx.body = { error: "Server error" };
  }
});

// UPDATE book
router.put("/books/:id", async (ctx) => {
  try {
    const { id } = ctx.params; // Book id from url
    const { name, author, description, price, image } = ctx.request
      .body as Book;

    if (!name || !author || !description || !price || !image) {
      ctx.status = 400;
      ctx.body = { error: "All fields are required" };
      return;
    }

    // Extra validation for price --> proper decimal format and above 0
    if (
      typeof price !== "number" ||
      price < 0 ||
      Number(price.toFixed(2)) !== price
    ) {
      ctx.status = 400;
      ctx.body = {
        error: "Price must be a positive number to 2 decimal places",
      };
      return;
    }

    const updatedBook: Book = {
      id,
      name,
      author,
      description,
      price: Number(price),
      image,
    };
    // Await helper function and update book in db
    const collection = await getCollection();
    const result = await collection.updateOne({ id }, { $set: updatedBook });

    // If no book was matched for the given ID
    if (result.matchedCount === 0) {
      ctx.status = 404;
      ctx.body = { error: "Book not found" };
      return;
    }

    ctx.body = { message: "Book updated successfully", book: updatedBook };
  } catch (error) {
    console.error("PUT error:", error);
    ctx.status = 500;
    ctx.body = { error: "Server error" };
  }
});

// DELETE book
router.delete("/books/:id", async (ctx) => {
  try {
    // Validate id
    const { id } = ctx.params;
    if (!id) {
      ctx.status = 400;
      ctx.body = { error: "Book ID is required" };
      return;
    }
    // Await helper function and delete book from db
    const collection = await getCollection();
    const result = await collection.deleteOne({ id });

    if (result.deletedCount === 0) {
      ctx.status = 404;
      ctx.body = { error: "Book not found" };
      return;
    }

    ctx.body = { message: "Book deleted successfully" };
  } catch (error) {
    console.error("DELETE error:", error);
    ctx.status = 500;
    ctx.body = { error: "Server error" };
  }
});

// READ books
router.get("/books", async (ctx) => {
  try {
    const { from, to } = ctx.query;

    // Convert query params to numbers if they exist
    const filters: { from?: number; to?: number }[] = [];
    if (from || to) {
      filters.push({
        from: from ? parseFloat(from as string) : undefined,
        to: to ? parseFloat(to as string) : undefined,
      });
    }

    // Make a filter for mongodb query
    const mongoFilter: Record<string, unknown> = {};

    if (filters.length > 0) {
      const orConditions = filters.map((f) => {
        const range: Record<string, number> = {};
        if (f.from !== undefined) range.$gte = f.from;
        if (f.to !== undefined) range.$lte = f.to;
        return { price: range };
      });
      mongoFilter.$or = orConditions;
    }

    // Fetch books from mongodb based on the filter
    const collection = await getCollection();
    const books = await collection.find(mongoFilter).toArray();

    ctx.body = books;
  } catch (error) {
    console.error("GET error:", error);
    ctx.status = 500;
    ctx.body = { error: "Server error" };
  }
});

export default router;
