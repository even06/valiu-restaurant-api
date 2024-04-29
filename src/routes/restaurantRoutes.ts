import express, { Request, Response } from 'express';
import { query } from 'express-validator';
import mysql from 'mysql2/promise';
import { RestaurantRequest, ExtendedRestaurant, Restaurant } from '../interfaces/types';
import { isNumberObject } from 'util/types';

require('dotenv').config();
// Create router instance
const router = express.Router();

// Database connection setup directly in routes, as per your existing setup
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

router.get('/',
    [
        query('partySize').isInt({ gt: 0 }).withMessage('Number of guests must be a positive number.')
    ], async (req: RestaurantRequest, res: Response) => {
        const { date, partySize } = req.query;
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
                /*
                console.log('got a date');
                console.log(query);
                */
    
                // Here we specify the type as Restaurant[], which declares that each row of the results conforms to the Restaurant type
                const [results] = await db.query<Restaurant[]>(query, [date, numGuests]);
                /*
                console.log('query', results);
                console.log('end query'); */
                const restaurants: ExtendedRestaurant[] = results.map(rest => ({
                    ...rest,
                    message: `Can accommodate ${numGuests} guests with combined tables.`
                }));
                
                res.json({ restaurants });
            } else {
                if (partySize !== undefined && !isNumberObject(partySize)) {
                    //console.log('invalid part?', numGuests);
                    res.status(400).json({ error: 'Invalid Party Size provided.' });
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
                
            }
        } catch (error) {
            handleError(res, error);
        }
    }
);

function handleError(res: Response, error: unknown): void {
    //console.log(error);
    if (error instanceof Error) {
        res.status(500).json({ error: error.message });
    } else {
        res.status(500).json({ error: 'An unknown error occurred' });
    }
}

export default router;
