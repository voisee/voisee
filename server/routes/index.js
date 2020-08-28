import { Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { paramMissingError, DoesNotExistError, duplicateError } from '../utils/constants';
import { mysql_dbc } from '../migrations/db_con';

const router = Router();

const wrapper = require('../src/interface/wrapper.js').wrapper;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({ title: 'Express' });
});

module.exports = router;