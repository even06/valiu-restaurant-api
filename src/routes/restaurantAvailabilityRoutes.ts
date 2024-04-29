import express, { Request, Response } from 'express';
import { query, param } from 'express-validator';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';
import { AvailabilityRequest } from '../interfaces/types';

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
        query('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date'),
        query('partySize').optional().isInt({ gt: 0 }).withMessage('Party Size must be a positive integer'),
        param('restaurantId').isNumeric().withMessage('Restaurant ID must be a number')
    ],  async (req: AvailabilityRequest, res: Response) => {
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
    }
);

function handleError(res: Response, error: unknown): void {
    if (error instanceof Error) {
        res.status(500).json({ error: error.message });
    } else {
        res.status(500).json({ error: 'An unknown error occurred' });
    }
}

export default router;
