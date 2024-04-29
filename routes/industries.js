const express = require("express");
const db = require('../db');
const ExpressError = require("../expressError");

let router = new express.Router()


router
    .route('/')
    .get(async (req, res, next) => {
        try {
            const results = await db.query(
                `SELECT i.code, i.industry, c.code
                FROM industries AS i
                LEFT JOIN industries_companies AS ic
                ON i.code = ic.ind_code
                LEFT JOIN companies AS c
                ON ic.comp_code = c.code`
            );
            return res.json({companies: results.rows});
        } catch (err) {
            return next(err);
        }
    })
    .post(async (req, res, next) => {
        try {
            const {industry} = req.body;
            const code = slugify(industry, {lower: true})
            const result = await db.query(
                `INSERT INTO industries (code, industry)
                VALUES ($1, $2)
                RETURNING code, industry`,
                [code, industry]
            );
            return res.statusCode(201).json({created_industry: result.rows[0]});
        } catch (err) {
            return next(err);
        }
    });

router
    .route('/:c_code/:i_code')
    .post(async (req, res, next) => {
        try {
            const {c_code, i_code} = req.params;
            const result = await db.query(
                `INSERT INTO companies_industries (c_code, i_code)
                VALUES ($1, $2)
                RETURNING c_code, i_code`,
                [c_code, i_code]
            );
            return res.statusCode(201).json({created_association: result.rows[0]});
        } catch (err) {
            return next(err);
        }
    });

module.exports = router;