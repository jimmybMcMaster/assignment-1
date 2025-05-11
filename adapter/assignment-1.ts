export interface Book {
    name: string,
    author: string,
    description: string,
    price: number,
    image: string,
};

async function listBooks(filters?: Array<{ from?: number, to?: number }>): Promise<Book[]> {
    const baseUrl = 'http://localhost:3000/books';  // Fetch backend

    // If no filters, fetch all books
    if (!filters || filters.length === 0) {
        const response = await fetch(baseUrl);
        if (!response.ok) throw new Error('Failed to fetch books');
        return await response.json() as Book[];
    }

    // Build query params if filters are used
    const queryParams = new URLSearchParams();
    filters.forEach((filter, index) => {
        if (filter.from !== undefined) queryParams.append(`filters[${index}][from]`, filter.from.toString());
        if (filter.to !== undefined) queryParams.append(`filters[${index}][to]`, filter.to.toString());
    });

    // Fetch filtered books
    const response = await fetch(`${baseUrl}?${queryParams.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch filtered books');
    return await response.json() as Book[];
}

const assignment = "assignment-1";

export default {
    assignment,
    listBooks
};



