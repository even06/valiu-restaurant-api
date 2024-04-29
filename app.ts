import express, { Request, Response } from 'express';
import { ParsedQs } from 'qs';
import bodyParser from 'body-parser';
import mysql from 'mysql2/promise';
import { FieldPacket, RowDataPacket } from 'mysql2';
import cors from 'cors';

require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.json());

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

interface Restaurant extends RowDataPacket {
    id: number;
    name: string;
    img_url: string;
    availableSeats?: number;
    category: string;
}

interface ExtendedRestaurant extends Restaurant {
    message: string;
}

interface RestaurantQueryResult {
    availableRestaurants: ExtendedRestaurant[];
}

interface RestaurantRequest extends Request {
    query: {
        date?: string;
        partySize?: string;
    }
}

interface TableAvailability {
    tableId: number;
    seats: number;
}

interface TablesQueryParams extends ParsedQs {
    date?: string;
    partySize?: string;
}

interface AvailabilityRequest extends Request {
    params: {
        restaurantId: string;
    };
    query: TablesQueryParams;
}

// List all restaurants
app.get('/restaurants', async (req: RestaurantRequest, res: Response) => {
    const { date, partySize } = req.query;

    // Parse guests ensuring a number or defaulting to undefined if parsing fails
    const numGuests = partySize ? parseInt(partySize, 10) : undefined;

    try {
        if (date && numGuests !== undefined && !isNaN(numGuests)) {
            let query = `
                SELECT r.id, r.name, r.img_url,
                    SUM(CASE WHEN res.date IS NULL THEN t.num_seats ELSE 0 END) as availableSeats, c.category_name as category
                FROM restaurants r
                JOIN tables t ON r.id = t.restaurant_id
                JOIN categories c ON r.categories = c.id
                LEFT JOIN reservations res ON res.table_id = t.id AND res.date = ?
                GROUP BY r.id
                HAVING availableSeats >= ?
                ORDER BY r.name;
            `;
            console.log('got a date');
            console.log(query);

            // Here we specify the type as Restaurant[], which declares that each row of the results conforms to the Restaurant type
            const [results] = await db.query<Restaurant[]>(query, [date, numGuests]);

            const restaurants: ExtendedRestaurant[] = results.map(rest => ({
                ...rest,
                message: `Can accommodate ${numGuests} guests with combined tables.`
            }));
            
            res.json({ restaurants });
        } else {
            const [restaurants] = await db.query<Restaurant[]>(`
                                        SELECT r.id, r.name, r.img_url,
                                            SUM(CASE WHEN res.date IS NULL THEN t.num_seats ELSE 0 END) as availableSeats, c.category_name as category
                                        FROM restaurants r
                                        JOIN tables t ON r.id = t.restaurant_id
                                        JOIN categories c ON r.categories = c.id
                                        LEFT JOIN reservations res ON res.table_id = t.id AND res.date = NOW()
                                        GROUP BY r.id
                                        HAVING availableSeats >= 1
                                        ORDER BY r.name;
                                    `);
            res.json({ restaurants });
        }
    } catch (error) {
        handleError(res, error);
    }
});


app.get('/availability/:restaurantId', async (req: AvailabilityRequest, res: Response) => {
    const { restaurantId } = req.params;
    let { date, partySize } = req.query;

    date = date || new Date().toISOString().split('T')[0]; // Default to today's date if not specified
    const numGuests = partySize ? parseInt(partySize, 10) : 1;  // Default to 1 guest if not specified

    try {
        const query = `
            SELECT r.restaurant_id, r.name, r.img_url,
                   SUM(t.num_seats) as total_available_seats
            FROM restaurants r
            JOIN tables t ON r.id = t.restaurant_id
            LEFT JOIN reservations res ON t.id = res.table_id AND res.date = ?
            WHERE r.id = ? AND res.id IS NULL
            GROUP BY r.restaurant_id
            HAVING SUM(t.num_seats) >= ?;
        `;

        const [results] = await db.query<RowDataPacket[]>(query, [date, restaurantId, numGuests]);

        if (results.length > 0) {
            res.json({
                message: "Can accommodate your party",
                details: results
            });
        } else {
            res.status(404).json({
                message: "No available table combination can accommodate the number of guests on the requested date."
            });
        }
    } catch (error) {
        handleError(res, error);
    }
});




// Book a table
app.post('/book', async (req, res) => {
    const { date, guests, restaurantId, name, email } = req.body;

    const normalizedDate = new Date(date).toISOString().split('T')[0]; // Normalize date to YYYY-MM-DD as string, this is not really neccesary but I don't want to try my luck :D

    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    bookingDate.setHours(0, 0, 0, 0);

    // Check if booking date is not before today
    if (bookingDate < today) {
        return res.status(400).json({ message: "Booking date must be today or later." });
    }
    
    try {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const [results]: [RowDataPacket[], FieldPacket[]] = await connection.query(`
                SELECT t.id AS tableId, t.num_seats AS seats
                FROM tables t
                LEFT JOIN reservations r ON r.table_id = t.id AND r.date = ?
                WHERE t.restaurant_id = ? AND r.id IS NULL
                ORDER BY t.num_seats ASC;
            `, [normalizedDate, restaurantId]);
        
            const availableTables = results as TableAvailability[];
            let totalSeats = 0;
            const tablesToBook = [];

            // Check if a single table can accommodate all guests
            const suitableTable = availableTables.find(table => table.seats >= guests);
            if (suitableTable) {
                tablesToBook.push(suitableTable.tableId);
                totalSeats = suitableTable.seats;
            } else {
                // If no single table is suitable, then proceed to combine tables
                for (const table of availableTables) {
                    tablesToBook.push(table.tableId);
                    totalSeats += table.seats;
                    if (totalSeats >= guests) break;
                }
            }
            
            console.log("Available tables:", availableTables);
            console.log("Total seats calculated:", totalSeats);
            
            if (totalSeats < guests) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({ message: "Not enough seats available for the requested date." });
            }

            const bookingQuery = "INSERT INTO reservations (table_id, date, name, email, guests) VALUES (?, ?, ?, ?, ?);";

            for (const tableId of tablesToBook) {
                await connection.query(bookingQuery, [tableId, normalizedDate, name, email, guests]);
            }

            await connection.commit();
            connection.release();
            res.status(200).json({ message: "Booking confirmed! Your table is waiting.", details: { name, email, date: normalizedDate, seats: totalSeats, tablesBooked: tablesToBook.length } });
        } catch (bookingError) {
            await connection.rollback();
            connection.release();
            throw bookingError;
        }
    } catch (error) {
        console.error('Booking Error:', error);
        handleError(res, error);
    }
});



function handleError(res: Response, error: unknown): void {
    if (error instanceof Error) {
        res.status(500).json({ error: error.message });
    } else {
        res.status(500).json({ error: 'An unknown error occurred' });
    }
}



// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export default app;
