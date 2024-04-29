import { Request } from 'express';
import { RowDataPacket } from 'mysql2';
import { ParsedQs } from 'qs';

export interface Restaurant extends RowDataPacket {
    id: number;
    name: string;
    img_url: string;
    availableSeats?: number;
    category: string;
}

export interface ExtendedRestaurant extends Restaurant {
    message: string;
}

export interface RestaurantQueryResult {
    availableRestaurants: ExtendedRestaurant[];
}

export interface RestaurantRequest extends Request {
    query: {
        date?: string;
        partySize?: string;
    }
}

export interface TableAvailability {
    tableId: number;
    seats: number;
}

export interface TablesQueryParams extends ParsedQs {
    date?: string;
    partySize?: string;
}

export interface AvailabilityRequest extends Request {
    params: {
        restaurantId: string;
    };
    query: TablesQueryParams;
}
