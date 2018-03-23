'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const Tag = require('../models/tag');

/* ========== GET/READ ALL ITEMS ========== */
router.get('/tags', (req, res, next) => {
  Tag.find()
    .sort('name')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});



module.exports = router;