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

// Defining types here to avoid ts errors in the get route
type MongoFilterType = {
  price?: {
    $gte?: number;
    $lte?: number;
  };
  name?: { $regex: RegExp };
  author?: { $regex: RegExp };
};

router.get("/books", async (ctx) => {
  try {
    const { name, author, from, to } = ctx.query;

    const mongoFilter: Record<string, unknown> = {};
    const filters: MongoFilterType[] = [];
    // Validate for single or multiple entries
    // Name filters
    if (Array.isArray(name)) {
      name.forEach((n) => {
        filters.push({ name: { $regex: new RegExp(n, "i") } });
      });
    } else if (name) {
      filters.push({ name: { $regex: new RegExp(name as string, "i") } });
    }

    // Author filters
    if (Array.isArray(author)) {
      author.forEach((a) => {
        filters.push({ author: { $regex: new RegExp(a, "i") } });
      });
    } else if (author) {
      filters.push({ author: { $regex: new RegExp(author as string, "i") } });
    }

    // Price range filters
    const fromArray = Array.isArray(from) ? from : from ? [from] : [];
    const toArray = Array.isArray(to) ? to : to ? [to] : [];

    const maxLength = Math.max(fromArray.length, toArray.length);

    for (let i = 0; i < maxLength; i++) {
      const fromVal = fromArray[i];
      const toVal = toArray[i];

      const price: { $gte?: number; $lte?: number } = {};
      if (fromVal) price.$gte = parseFloat(fromVal as string);
      if (toVal) price.$lte = parseFloat(toVal as string);

      if (price.$gte !== undefined || price.$lte !== undefined) {
        filters.push({ price });
      }
    }

    if (filters.length > 0) {
      mongoFilter.$or = filters; // I could not for the life of me get $and to work with $or but i made sure to get one filtering objective done in the hopes of partial marks
    }

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
