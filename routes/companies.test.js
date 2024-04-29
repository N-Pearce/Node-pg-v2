process.env.NODE_ENV = 'test'
const request = require('supertest')
const app = require('../app')
const db = require('../db')

let testCompany;

beforeEach(async () => {
    let result = await db.query(
        `INSERT INTO companies (code, name, description)
        VALUES ('testco', 'Test Company Incorporated', 'Not a real company')
        RETURNING code, name, description`
    );
    testCompany = result.rows[0]
})

afterEach(async () => {
    await db.query(
        `DELETE FROM companies`
    );
})

afterAll(async () => {
    await db.end()
})

describe('/GET /companies', () => {
    test('Gets a list of all companies', async () =>{
        const response = await request(app).get('/companies')
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            companies: [testCompany]
        })
    })
})