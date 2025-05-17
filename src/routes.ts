import Router from 'koa-router'; 
import { Book, booksArray } from '../adapter/assignment-2';
import { v4 as uuidv4 } from 'uuid'; 
import assignment2Functions from '../adapter/assignment-2';


const { createOrUpdateBook } = assignment2Functions;

const router = new Router();

//Create a book
router.post('/books', async (ctx) => {
    try {
        const { name, author, description, price, image } = ctx.request.body as Book 
        //Validate user inputs
         if(!name || !author || !description || !price || !image) {
            ctx.status = 400;
            return ctx.body = { error: 'All fields are required' };
        }

        const newBook: Book = {
            id: uuidv4(), //I used uuids because we did in BDV102
            name,
            author,
            description,
            price: Number(price),
            image
        }

        await createOrUpdateBook(newBook);
        ctx.status = 201;
        ctx.body = { message: 'New book created successfully', book: newBook };

    } catch (error) {
        ctx.status = 500;
        console.error('An error occurred:', error);
        ctx.body = { error: 'Server error, please try again' }
    }
})


//Update a book
router.put('/books/:id', async (ctx) => {
    try {
        const { name, author, description, price, image } = ctx.request.body as Book;
        //Validate user inputs
         if(!name || !author || !description || !price || !image) {
            ctx.status = 400;
            return ctx.body = { error: 'All fields are required' };
        }
        
        //Find exisiting book by uuid
        const { id } = ctx.params;
        const existingIndex = booksArray.findIndex((b) => b.id === id);
        
        if (existingIndex === -1) {
            ctx.status = 404;
            return ctx.body = { error: 'Book not found' };
        }

        const updatedBook: Book = {
            id,
            name,
            author,
            description,
            price: Number(price),
            image,
        };

        await createOrUpdateBook(updatedBook);
        ctx.status = 200;
        ctx.body = { message: 'Book updated successfully', book: updatedBook };

    } catch (error) {
        ctx.status = 500;
        console.error('An error occurred:', error);
        ctx.body = { error: 'Server error, please try again' };
    }
});

//Delete
router.delete('/books/:id', async (ctx) => {
    try {

    } catch (error) {
        ctx.status = 500;
        console.error('An error occurred:', error);
        ctx.body = { error: 'Server error, please try again' };
    }
})

//Read
router.get('/books', async (ctx) => {
    const filters = ctx.query.filters as Array<{ from?: number, to?: number }> | undefined;

    try {
        // Validate filters if used
        if (filters && filters.length > 0) {
            const isValid = filters.every(filter => {
                const from = filter.from;
                const to = filter.to;
                return (
                    (from === undefined || !isNaN(Number(from))) &&
                    (to === undefined || !isNaN(Number(to)))
                );
            });
            // If user tries NaN input
            if (!isValid) {
                ctx.status = 400;
                ctx.body = { error: "Invalid filters: 'from' and 'to' must be valid numbers." };
                return;
            }
        }

        const filteredBooks = booksArray.filter(book => {
            if (!filters || filters.length === 0) {
                return true;
            }

            return filters.every(filter => {
                const from = filter.from !== undefined ? Number(filter.from) : -Infinity;
                const to = filter.to !== undefined ? Number(filter.to) : Infinity;
                return book.price >= from && book.price <= to;
            });
        });

        ctx.body = filteredBooks;
    } catch (error) {
        ctx.status = 500;
        console.error('An error occurred:', error);
        ctx.body = { error: 'Server error, please try again' };
    }
});

export default router;
