'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');

const Folder = require('../models/folder');
const seedFolders = require('../db/seed/folders');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Noteful API - Notes', function() {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI);
  });
    
  beforeEach(function () {
    return Folder.insertMany(seedFolders);
  });
    
  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });
    
  after(function () {
    return mongoose.disconnect();
  });

  describe('GET /api/folders', function() {
    it('should return the correct number of folders', function() {
      let data;
      //1. First call the database
      return Folder.find()
        .then(_data => {
          data = _data;
          //2. then call the API
          return chai.request(app).get('/api/folders');
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.a('array');
          //3. compare
          expect(res.body).to.have.length(data.length);
        });
    });
  });

  describe('GET /api/folders/:id', function() {
    it('should return the correct folder with given id', function() {
      let data;
      // 1. First, call the database
      return Folder.findOne().select('id name')
        .then(_data => {
          data = _data;
          // 2. then call the API
          return chai.request(app).get(`/api/folders/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name');

          // 3. then compare
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
        });
    });

    it('should respond with a 404 for an invalid id', function() {
      return chai.request(app)
        .get('/api/folders/ASASASASASASASASASASASAS')
        .catch(err => err.response)
        .catch(res => {
          expect(res).to.have.status(404);
        });
    });
  });

  describe('POST /api/folders', function() {
    it('should create a new folder when provided with valid data', function() {

    });
  });




});