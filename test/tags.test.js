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

  describe('GET /api/tags', function() {
    it('should return the correct number of tags', function() {
      let data;
      return Tag.find()
        .then(_data => {
          data = _data;
          return chai.request(app).get('/api/tags');
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.a('array');

          expect(res.body).to.have.length(data.length);
        });
    });
  });

  describe('GET /api/tags/:id', function() {
    it('should return the correct tag with given id', function() {
      let data;
      return Tag.findOne().select('id name')
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/tags/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name');

          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
        });
    });
  });

});