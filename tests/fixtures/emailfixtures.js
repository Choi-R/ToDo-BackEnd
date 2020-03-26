const faker = require("faker");

function create() {
  return {
    email: faker.internet.email().toLowerCase()
  };
}

module.exports = {
  create
}