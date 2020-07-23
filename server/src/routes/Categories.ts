import { Request, Response, Router, query } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { ParamsDictionary } from 'express-serve-static-core';
import { paramMissingError } from '@shared/constants';

// Init shared
const router = Router();

// db Connection
import mysql_dbc from '../db/db_con';
const connection = mysql_dbc().init();


/* GET Category List (Category ID, Category Name)*/
router.get('/', async(req: Request, res: Response) => {
    const sql = 'SELECT * FROM categories';
    
    await connection.query(sql, function(err: any, rows: any, fields: any){
        if(err) {
            res
                .status(BAD_REQUEST)
        } else {
            res
                .status(OK)
                .json(rows)
                .end();
        }
    })
    
})

/* INSERT new Category */
router.post('/', async (req: Request, res: Response) => {
        const categoryName = req.body.categoryname;
        if(!categoryName){
            return res.status(BAD_REQUEST).json({
                error: paramMissingError
            })
        }

        const sql = 'INSERT INTO categories(categoryname) VALUES (?)';
        
        await connection.query(sql, [categoryName], function(err: any, rows: any, fields: any){
            if(err){
                if(err.code == "ER_DUP_ENTRY"){
                    const resPayload = {
                        message: err.message,
                    }
                    res
                        .status(BAD_REQUEST)
                        .json(resPayload)
                }
                else{
                    res
                        .status(BAD_REQUEST)
                }   
            } else {
                res
                    .status(CREATED)
                    .end();
            }
        })
});

/* DELETE Category using Category ID */
router.delete('/:id', async (req: Request, res: Response) => {
    const categoryId = req.body.categoryid;
    if(!categoryId){
        return res.status(BAD_REQUEST).json({
            error: paramMissingError
        })
    }
    
    const sql = 'DELETE FROM categories WHERE categoryid = ?';

    await connection.query(sql, [categoryId], function(err: any, rows: any, fields: any){
        if(err){
            res
                .status(BAD_REQUEST)
        } else {
            if(!rows.affectedRows){
                const resPayload = {
                    message: "That categoryId doesn't exist",
                }
                res
                    .status(BAD_REQUEST)
                    .json(resPayload)
            } else{
                console.log(rows);
                res
                    .status(OK)
                    .end();
            }
        }
    });
});

/* UPDATE Category Name using Category ID */
router.put('/:id', async (req: Request, res: Response) => {
    const categoryId = req.body.categoryid;
    const categoryName = req.body.categoryname;
    
    if(!categoryId || !categoryName){
        return res.status(BAD_REQUEST).json({
            error: paramMissingError
        })
    }

    const sql = 'UPDATE categories SET categoryname= ? WHERE categoryid= ?';

    await connection.query(sql, [categoryName, categoryId], function(err: any, rows: any, fields: any){
        if(err){
            res
                .status(BAD_REQUEST)
        } else{
            if(!rows.affectedRows){
                const resPayload = {
                    message: "That categoryId doesn't exist",
                }
                res
                    .status(BAD_REQUEST)
                    .json(resPayload)
            } else {
                res
                    .status(OK)
                    .end();
            }
        }
    });
})



export default router;