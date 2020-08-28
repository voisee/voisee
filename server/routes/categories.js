import { Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { paramMissingError, DoesNotExistError, duplicateError } from '../utils/constants';
import { mysql_dbc } from '../migrations/db_con';

const wrapper = require('../src/interface/wrapper.js').wrapper;

// Init shared
const router = Router();

// db Connection
const connection = mysql_dbc.init();

/* GET Category List (Category ID, Category Name) */
router.get('/', wrapper(async(req, res, next) => {
    const sql = 'SELECT * FROM categories';
    connection.query(sql, function(err, rows, fields){
        //console.log(err);
        if(err) {
            res
                .status(BAD_REQUEST)
                .end();
        } else {
            res
                .status(OK)
                .json(rows)
                .end();
        }
    })
    
}));

/* INSERT new Category */
router.post('/', wrapper(async (req, res, next) => {
        const categoryName = req.body.categoryname;
        if(!categoryName){
            return res.status(BAD_REQUEST).json({
                error: paramMissingError
            })
        }

        const sql = 'INSERT INTO categories(categoryname) VALUES (?)';
        
        connection.query(sql, [categoryName], function(err, rows, fields){
            if(err){
                if(err.code === "ER_DUP_ENTRY"){
                    const resPayload = {
                        message: duplicateError,
                    }
                    res
                        .status(BAD_REQUEST)
                        .json(resPayload)
                        .end();
                }
                else{
                    res
                        .status(BAD_REQUEST)
                        .end();
                }   
            } else {
                res
                    .status(CREATED)
                    .end();
            }
        })
}));

/* DELETE Category using Category ID */
router.delete('/:id', wrapper(async (req, res) => {
    const categoryId = req.params.id;
    if(!categoryId){
        return res.status(BAD_REQUEST).json({
            error: paramMissingError
        })
    }
    
    const sql = 'DELETE FROM categories WHERE categoryid = ?';

    connection.query(sql, [categoryId], function(err, rows, fields){
        if(err){
            res
                .status(BAD_REQUEST)
                .end();
        } else {
            if(!rows.affectedRows){
                const resPayload = {
                    message: DoesNotExistError,
                }
                res
                    .status(BAD_REQUEST)
                    .json(resPayload)
                    .end();
            } else{
                console.log(rows);
                res
                    .status(OK)
                    .end();
            }
        }
    });
}));

/* UPDATE Category Name using Category ID */
router.put('/:id', wrapper(async (req, res) => {
    const categoryId = req.params.id;
    const categoryName = req.body.categoryname;
    
    if(!categoryId || !categoryName){
        return res.status(BAD_REQUEST).json({
            error: paramMissingError
        })
    }

    const sql = 'UPDATE categories SET categoryname= ? WHERE categoryid= ?';

    connection.query(sql, [categoryName, categoryId], function(err, rows, fields){
        if(err){
            res
                .status(BAD_REQUEST)
                .end();
        } else{
            if(!rows.affectedRows){
                const resPayload = {
                    message: DoesNotExistError,
                }
                res
                    .status(BAD_REQUEST)
                    .json(resPayload)
                    .end();
            } else {
                res
                    .status(OK)
                    .end();
            }
        }
    });
}));

module.exports = router;
