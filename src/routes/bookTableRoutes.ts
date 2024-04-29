import express, { Request, Response } from 'express';
import { query, body } from 'express-validator';
import mysql from 'mysql2/promise';
import { FieldPacket, RowDataPacket } from 'mysql2';
import { RestaurantRequest, TableAvailability } from '../interfaces/types';

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

router.post('/',
    [
        body('name').not().isEmpty().trim().escape().withMessage('Name is required.'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
        query('partySize').isInt({ gt: 0 }).withMessage('Number of guests must be a positive number.')
    ], async (req: RestaurantRequest, res: Response) => {
        const { date, guests, restaurantId, name, email } = req.body;
    
        const normalizedDate = new Date(date).toISOString().split('T')[0]; // Normalize date to YYYY-MM-DD as string, this is not really neccesary but I don't want to try my luck :D
    
        const bookingDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
    
        bookingDate.setHours(0, 0, 0, 0);
    
        // Check if booking date is not before today
        if (bookingDate < today) {
            return res.status(400).json({ message: "Booking date must be today or later." });
        } else if (!name.trim() || !email.trim()) {
            return res.status(400).json({ message: "You must include a name and email for the reservation." });
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
