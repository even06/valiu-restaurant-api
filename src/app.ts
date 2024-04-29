import express, { Request, Response } from 'express';
import { ParsedQs } from 'qs';
import mysql from 'mysql2/promise';
import { FieldPacket, RowDataPacket } from 'mysql2';
import { query, param } from 'express-validator';

import restaurantRoutes from './routes/restaurantRoutes';
import bookTableRoutes from './routes/bookTableRoutes';
import restaurantAvailabilityRoutes from './routes/restaurantAvailabilityRoutes';
import cors from 'cors';

require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

// List all restaurants

app.use('/restaurants', restaurantRoutes);

app.use('/book', bookTableRoutes);

app.use('/availability/:restaurantId', restaurantAvailabilityRoutes);



// Start server
app.listen(port, () => {
    console.log(`Valiu restaurant running on port ${port}`);
});

export default app;
