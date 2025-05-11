import Router from 'koa-router';
import books from './../mcmasteful-book-list.json'; 

const router = new Router();

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

        const filteredBooks = books.filter(book => {
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
        ctx.body = { error: `Failed to fetch books due to: ${(error as Error).message}` };
    }
});

export default router;
