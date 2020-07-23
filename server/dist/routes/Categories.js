"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const http_status_codes_1 = require("http-status-codes");
const router = express_1.Router();
const mysql = require('mysql');
const db_con_1 = tslib_1.__importDefault(require("../db/db_con"));
const connection = db_con_1.default().init();
router.get('/', (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const sql = 'SELECT * FROM categories';
        yield connection.query(sql, function (err, rows, fields) {
            res
                .status(http_status_codes_1.OK)
                .json(rows);
        });
    }
    catch (err) {
        res
            .status(http_status_codes_1.BAD_REQUEST);
    }
    ;
}));
router.post('/', (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryName = req.body.categoryName;
        const sql = 'INSERT INTO categories(categoryname) VALUES (?)';
        yield connection.query(sql, [categoryName], function (err, rows, fields) {
            res
                .status(http_status_codes_1.CREATED);
        });
    }
    catch (err) {
        res
            .status(http_status_codes_1.BAD_REQUEST);
    }
    ;
}));
router.delete('/:id', (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const categoryId = req.body.categoryid;
    const sql = 'DELETE FROM categories WHERE categoryid = (?)';
    yield connection.query(sql, [categoryId], function (err, rows, fields) {
        if (err)
            console.log(err);
        else
            console.log("Delete Success!");
    });
    return res.status(http_status_codes_1.OK).end();
}));
router.put('/:id', (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const categoryId = req.body.categoryid;
    const categoryName = req.body.categoryname;
    const sql = 'UPDATE categories SET categoryname=(?) WHERE categoryid=(?)';
    yield connection.query(sql, [categoryName, categoryId], function (err, rows, fields) {
        if (err)
            console.log(err);
        else
            console.log("Update Success!");
    });
    return res.status(http_status_codes_1.OK).end();
}));
exports.default = router;
