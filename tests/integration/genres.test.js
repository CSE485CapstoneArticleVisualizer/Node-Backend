const request = require('supertest');
const {Genre} = require('../../models/genre');
const {User} = require('../../models/user');
const mongoose = require('mongoose')
let server;

describe('/api/genres', () => {
    // Gets called before each test in this test suite.
    beforeEach(() => { server = require('../../app'); }) ;
    afterEach(async () => { 
        await Genre.remove(); // Clean up the collection
        await server.close();
     });

    describe('GET /', () => {
        it('should return all genres', async () => {
            // Insert dummy vallues into the collection
            await Genre.collection.insertMany([
                { name: 'Genre A' }, 
                { name: 'Genre B' }
            ]);

            const res = await request(server).get('/api/genres');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);

            // The body contains an object whose name is Genre A and another object whose name is Genre B
            expect(res.body.some(obj => obj.name === 'Genre A')).toBeTruthy();
            expect(res.body.some(obj => obj.name === 'Genre B')).toBeTruthy();
            
        });
    });

    describe('GET/:id', () => {
        it('should return a genre if valid id is passed', async () => {
            const genre = new Genre({ name: 'Genre A '});
            await genre.save();

            const res = await request(server).get('/api/genres/' + genre._id);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genre.name);
        });

        it('should return 404 if an invalid id is passed', async () => {
            const res = await request(server).get('/api/genres/1');
            expect(res.status).toBe(404);
        });

        it('should return 404 if no genre exists for the valid object id', async () => {
            const id = new mongoose.Types.ObjectId();
            const res = await request(server).get('/api/genres/' + id);
            expect(res.status).toBe(404);
        });
    });

    describe('POST /', () => {

        let token;
        let name;

        const exec = async () => {
            return await request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({ name: name})
        }

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'Genre A'
        })

        it('should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);

        })

        it('should return 400 if genre is less than 5 characters', async () => {
            name = '1234';
            const res = await exec()
            expect(res.status).toBe(400);
        })

        it('should return 400 if genre is more than 50 characters', async () => {
            name = new Array(52).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should save the genre if valid', async () => {
            const res = await exec();
            const genre = await Genre.find({ name: name})
            expect(genre).not.toBeNull();
        })

        it('should return the genre if valid', async () => {
            const res = await exec();           
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', name);
        })

    })
});