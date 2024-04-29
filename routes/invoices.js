const express = require("express");
const db = require('../db');
const ExpressError = require('../expressError');


let router = new express.Router()

router
    .route('/')
    .get(async (req, res, next) => {
        try {
            const results = await db.query(
                `SELECT id, comp_code
                FROM invoices`
            );
            return res.json({invoices: results.rows});
        } catch (err) {
            return next(err);
        }
    })
    .post(async (req, res, next) => {
        try {
            const {comp_code, amt} = req.body;
            const result = await db.query(
                `INSERT INTO companies (comp_code, amt)
                VALUES ($1, $2)
                RETURNING code, name, description`,
                [comp_code, amt]
            );
            return res.statusCode(201).json({created_invoice: result.rows[0]});
        } catch (err) {
            return next(err);
        }
    });

router
    .route('/:id')
    .get(async (req, res, next) => {
        try {
            const results = await db.query(
                `SELECT i.id, 
                        i.amt, 
                        i.paid, 
                        i.add_date, 
                        i.paid_date,
                        c.name,
                        c.description
                FROM invoices AS i
                INNER JOIN companies AS c ON (i.comp_code = c.code)
                WHERE id=$1`, [req.params.id]
            );
            if (results.rows.length === 0)
                throw new ExpressError(`No such invoice: ${id}, 404`)
            const data = result.rows[0]
            const invoice = {
                id: data.id,
                amt: data.amt,
                paid: data.paid,
                add_date: data.add_date,
                paid_date: data.paid_date,
                company: {
                    code: data.comp_code,
                    name: data.name,
                    description: data.description
                }
            }
            return res.json({invoice: invoice})
        } catch (err) {
            return next(err);
        }
    })
    .put(async (req, res, next) => {
        try {
            const {amt, paid} = req.body;
            let paidDate = null;
            const paidRes = await db.query(
                `Select paid, paid_date
                from invoices 
                where id = $1`,
                [id]
            );
            if (paidRes.rows.length === 0)
                throw new ExpressError(`No such invoice: ${id}, 404`)

            const currPaidDate = paidRes.rows[0].paid_date
            if (!currPaidDate && paid){
                paidDate = new Date();
            } else if (!paid){
                paidDate = null
            } else {
                paidDate = currPaidDate
            }

            const result = await db.query(
                `UPDATE invoices SET amt=$2, paid=$3, paid_date=$4
                WHERE id=$1
                RETURNING code, name, description`,
                [req.params.id, amt, paid, paidDate]
            );
            return res.json({updated_invoice: result.rows[0]});
        } catch (err) {
            return next(err);
        }
    })
    .delete(async (req, res, next) => {
        try {
            const result = await db.query(
                `DELETE FROM invoices WHERE id=$1`,
                [req.params.id]
            );
            if (result.rows.length === 0)
                throw new ExpressError(`No such invoice: ${id}, 404`)
            return res.json({message: 'Deleted'});
        } catch (err) {
            return next(err);
        }
    });
    
module.exports = router;