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

    it('should respond with a 404 for an invalid id', function() {
      return chai.request(app)
        .get('/api/tags/ASASASASASASASASASASASAS')
        .catch(err => err.response)
        .catch(res => {
          expect(res).to.have.status(404);
        });
    });
  });

  describe('POST /api/tags', function() {
    it('should create a new tag when provided with valid data', function() {
      const newTag = {
        'name': 'My new tag'
      };
      let body;
      return chai.request(app).post('/api/tags').send(newTag)
        .then((res) => {
          body = res.body;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;

          expect(body).to.be.a('object');
          expect(body).to.have.keys('id', 'name');

          return Tag.findById(body.id);
        })
        .then(data => {
          expect(body.id).to.equal(data.id);
          expect(body.name).to.equal(data.name);
        });
    });

    it('should return an error when missnig "name" field', function() {
      const newTag = {
        'title': 'This tag has no name field!'
      };
      return chai.request(app)
        .post('/api/tags').send(newTag)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `name` in request body');  
        });
    });
  });

  describe('PUT /api/tags/:id', function() {
    it('should update the tag with the given id', function() {
      const updatedTag = {
        'name': 'Updating tag name and testing'
      };
      let data;
      return Tag.findOne().select('id name')
        .then(_data => {
          data = _data;
          return chai.request(app).put(`/api/tags/${data.id}`)
            .send(updatedTag);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'name');

          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(updatedTag.name);
        });
    });

    it('should respond with a 400 for an invalid id', function() {
      const updatedTag = {
        'name': 'Updating tag name and testing'
      };
      return chai.request(app).put('/api/tags/99')
        .send(updatedTag)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });
  });

  describe('DELETE /api/tags/:id', function() {
    it('should delete a tag with the given id', function() {
      let data; 
      return Tag.findOne().select('id name')
        .then(_data => {
          data = _data;
          return chai.request(app).delete(`/api/tags/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(204);
        });
    });

    it('should respond with a 400 for an invalid id', function() {
      return chai.request(app)
        .delete('/api/tags/99')
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });
  });

});