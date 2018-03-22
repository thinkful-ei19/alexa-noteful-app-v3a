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
      const newFolder = {
        'name': 'My new folder'
      };
      let body;
      // 1. call the API to test the new document
      return chai.request(app).post('/api/folders').send(newFolder)
        .then(function(res) {
          body = res.body;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;

          expect(body).to.be.a('object');
          expect(body).to.have.keys('id', 'name');
          //2. then call the database to retrieve the new document
          return Folder.findById(body.id);
        })
      //3. then compare the API response to the database results
        .then(data => {
          expect(body.id).to.equal(data.id);
          expect(body.name).to.equal(data.name);
        });
    });

    it('should return an error when missnig "name" field', function() {
      const newFolder = {
        'title': 'This folder has no name field!'
      };
      // 1. call the API
      return chai.request(app)
        .post('/api/folders').send(newFolder)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `name` in request body');

        });

    });
  });

  describe('PUT /api/folders/:id', function() {
    it('should update the folder with the given id', function() {
      const updatedFolder = {
        'name': 'Updating folder name and testing'
      };
      let data;
      // 1. First call the db to get an id
      return Folder.findOne().select('id name')
        .then(_data => {
          data = _data;
          // 2. then call the API with the given id and sending updatedFolder
          return chai.request(app).put(`/api/folders/${data.id}`)
            .send(updatedFolder);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'name');

          // 3. then compare database results to API response
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(updatedFolder.name);
        });
    });

    it('should respond with a 404 for an invalid id', function() {
      const updatedFolder = {
        'name': 'Updating folder name and testing'
      };
      // 1. First, call the API
      return chai.request(app).put('/api/folders/ASASASASASASASASASASASAS')
        .send(updatedFolder)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });
  });

  describe('DELETE /api/folders/:id', function() {
    it('should delete a folder with the given id', function() {
      let data; 
      // 1. First call the database to get an id
      return Folder.findOne().select('id name')
        .then(_data => {
          data = _data;
          // 2. then call the API with the id
          return chai.request(app).delete(`/api/folders/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(204);
        });
    });

    it('should respond with a 404 for an invalid id', function() {
      return chai.request(app)
        .delete('/api/folders/99')
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });
  });



});