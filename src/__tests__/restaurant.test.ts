import request from 'supertest';
import app from '../app';
import { Restaurant } from '../interfaces/types'; // Adjust the path as necessary

describe('GET /restaurants', () => {
  it('should return all restaurants when no parameters are provided', async () => {
    const response = await request(app).get('/restaurants');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('restaurants');
    expect(Array.isArray(response.body.restaurants)).toBe(true);
  });

  it('should handle invalid partySize parameter', async () => {
    const response = await request(app)
      .get('/restaurants')
      .query({ partySize: 'invalid' });

    //console.log(response);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Invalid Party Size provided.');
  });

  it('should filter restaurants based on valid partySize', async () => {
        const response = await request(app)
        .get('/restaurants')
        .query({ partySize: 4, date: '2024-04-30' });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('restaurants');
            expect(response.body.restaurants.every((r: Restaurant) => (r.availableSeats || 0) >= 4)).toBe(true);
    });


  // More tests can be added to cover other query parameters like date and combined conditions
});
