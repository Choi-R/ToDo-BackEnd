const chai = require("chai");
const chaiHttp = require("chai-http");
const { expect } = chai;
const fs = require("fs");
chai.use(chaiHttp);
const server = require("../index.js");
const User = require("../models/user.js");
const bcrypt = require("bcrypt");
var token;
var id;

const fixtures = require("./fixtures/userFixtures.js");
const staticSample = fixtures.create();
const Task = require("../models/task.js");
const taskFixtures = require("./fixtures/taskFixtures.js");
const taskStaticSample = taskFixtures.createTask();
const emailFixtures = require("./fixtures/emailfixtures.js")
const emailFaker = emailFixtures.create()

describe("User API", async function() {
  before(function() {
    return new Promise((resolve, reject) => {
      let encryptedPassword = bcrypt.hashSync(staticSample.password, 10);
      User.create({
        ...staticSample,
        password: encryptedPassword
      })
      .then(() => Task.create(taskStaticSample))
      .then(() => resolve())
      .catch(() => reject())
    });
  });

  after(function() {
    return User.deleteMany({});
  });
  await context("POST /api/v1/users", function() {
    it("Should create new user", function() {
      chai
        .request(server)
        .post("/api/v1/users")
        .set("Content-Type", "application/json")
        .send(JSON.stringify(fixtures.create()))
        .end(function(err, res) {
          expect(res.status).to.eq(201);
          let { status, data } = res.body;
          token = data.token;
          expect(status).to.be.ok;
          expect(data).to.be.an("object");
          expect(data).to.have.property("_id");
          expect(data).to.have.property("email");
        });
    });
  });

  await context("PUT /api/v1/users", function() {
    it("Should login an user", function() {
      chai
        .request(server)
        .put("/api/v1/users")
        .set("Content-Type", "application/json")
        .send(JSON.stringify(staticSample))
        .end(function(err, res) {
          token = res.body.data;
          expect(res.status).to.eq(200);
        });
    });
  });

  context("Negative Test", function() {
    it("Shouldn't login because of wrong email and/or name", function() {
      chai
        .request(server)
        .put("/api/v1/users")
        .set("Content-Type", "application/json")
        .send(
          JSON.stringify({
            name: "Test01",
            password: staticSample.password
          })
        )
        .end(function(err, res) {
          expect(res.status).to.eq(422);
        });
    });

    it("Shouldn't login because of wrong password", function() {
      chai
        .request(server)
        .put("/api/v1/users")
        .set("Content-Type", "application/json")
        .send(
          JSON.stringify({
            email: staticSample.email,
            password: "123456"
          })
        )
        .end(function(err, res) {
          expect(res.status).to.eq(422);
        });
    });
    it("Shouldn't know current user because of invalid token", function() {
      chai
        .request(server)
        .get("/api/v1/users")
        .set("Content-Type", "application/json")
        .set("Authorization", "ajhebfehjfbsekfbkj43b645kj645btker")
        .end(function(err, res) {
          expect(res.status).to.eq(401);
        });
    });

    it("Shouldn't create new user because of wrong email format", function() {
      chai
        .request(server)
        .post("/api/v1/users")
        .set("Content-Type", "application/json")
        .send(
          JSON.stringify({
            name: staticSample.name,
            email: "Test01",
            password: staticSample.password
          })
        )
        .end(function(err, res) {
          expect(res.status).to.eq(422);
        });
    });

    it("Shouldn't update user's information because of invalid email format", function() {
      chai
        .request(server)
        .put("/api/v1/users/update")
        .set("Content-Type", "application/json")
        .set("authorization", token)
        .send(
          JSON.stringify({
            email: 123
          })
        )
        .end(function(err, res) {
          expect(res.status).to.eq(422);
        });
    });

    it("Shouldn't create new task because insufficient property", function() {
      chai
        .request(server)
        .post("/api/v1/tasks")
        .set("Content-Type", "application/json")
        .set("authorization", token)
        .send(
          JSON.stringify({
            name: "Test01"
          })
        )
        .end(function(err, res) {
          expect(res.status).to.eq(400);
        });
    });

    it("Shouldn't delete a task because id not found", function() {
      chai
        .request(server)
        .delete(`/api/v1/tasks/123456`)
        .set("authorization", token)
        .end(function(err, res) {
          expect(res.status).to.eq(404);
        });
    });

    it("Shouldn't update a task because id not found", function() {
      chai
        .request(server)
        .put(`/api/v1/tasks/123456`)
        .set("authorization", token)
        .send(
          JSON.stringify({
            completion: true
          })
        )
        .end(function(err, res) {
          expect(res.status).to.eq(404);
        });
    });
  });

  context("User features that need authentication", function() {
    it("Should tell who is the current user", function() {
      chai
        .request(server)
        .get("/api/v1/users")
        .set("Content-Type", "application/json")
        .set("Authorization", token)
        .end(function(err, res) {
          expect(res.status).to.eq(200);

          let { status, data } = res.body;
          id = data._id;
          expect(status).to.be.ok;
          expect(data).to.be.an("object");
          expect(data).to.have.property("_id");
          expect(data).to.have.property("email");
        });
    });

    it("Should update information about current user", function() {
      chai
        .request(server)
        .put("/api/v1/users/update")
        .set("Content-Type", "application/json")
        .set("Authorization", token)
        .send(JSON.stringify({email: 'choipa10@gmail.com'}))
        .end(function(err, res) {
          expect(res.status).to.eq(200);

          let { status, data } = res.body;
          expect(status).to.be.ok;
          expect(data).to.be.an('object');
          expect(data).to.have.property("name");
        })
    });

    it("Should update current user's password", function () {
      chai
        .request(server)
        .put("/api/v1/users/update")
        .set("Content-Type", "application/json")
        .set("Authorization", token)
        .send(JSON.stringify({ "password": "Choi" }))
        .end(function (err, res) {
          expect(res.status).to.eq(200);

          let { status, data } = res.body;
          expect(status).to.be.ok;
          expect(data).to.be.an('string');
        })
    });
  });

  context("PUT /api/v1/users/photo", function() {
    it("Should upload photo profile", function() {
      chai
        .request(server)
        .put("/api/v1/users/photo")
        .set("Authorization", token)
        .attach("image", fs.readFileSync("Image001.jpg"), "Image001.jpg")
        .end(function(err, res) {
          console.log(res);
          expect(res.status).to.eq(200);
        });
    });
  });

  context("Task Features", function() {
    it("Should create new task", function() {
      chai
        .request(server)
        .post("/api/v1/tasks")
        .set("Content-Type", "application/json")
        .set("authorization", token)
        .send(JSON.stringify(taskFixtures.createTask()))
        .end(function(err, res) {
          expect(res.status).to.eq(201);
        });
    });
    it("Should show user's task", function() {
      chai
        .request(server)
        .get("/api/v1/tasks?page=1&limit=10")
        .set("authorization", token)
        .end(function(err, res) {
          expect(res.status).to.eq(200);
        });
    });
    it("Should show user's task by importance", function() {
      chai
        .request(server)
        .get("/api/v1/tasks/findTaskByImportance?page=1&limit=10")
        .set("authorization", token)
        .end(function(err, res) {
          expect(res.status).to.eq(200);
        });
    });
    it("Should show user's task by completion", function() {
      chai
        .request(server)
        .get("/api/v1/tasks/findTaskByCompletion?page=1&limit=10")
        .set("authorization", token)
        .end(function(err, res) {
          expect(res.status).to.eq(200);
        });
    });
    it("Should update a task", function() {
      chai
        .request(server)
        .put(`/api/v1/tasks/${id}`)
        .set("authorization", token)
        .send(
          JSON.stringify({
            completion: true
          })
        )
        .end(function(err, res) {
          expect(res.status).to.eq(200);
        });
    });
    it("Should delete a task", function() {
      chai
        .request(server)
        .delete(`/api/v1/tasks/${id}`)
        .set("authorization", token)
        .end(function (err, res) {
          expect(res.status).to.eq(200)
        })
    });
  });
});
