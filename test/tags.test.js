'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');

const Tag = require('../models/tag');
const seedTags = require('../db/seed/tags');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Noteful API - Notes', function() {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI);
  });
        
  beforeEach(function () {
    return Tag.insertMany(seedTags)
      .then(() => Tag.ensureIndexes());
  });
        
  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });
        
  after(function () {
    return mongoose.disconnect();
  });




});