const faker = require('faker')

function createTask() {
    return {
        name:faker.name.firstName(),
        description:faker.name.firstName(),
        deadLine:faker.date.future()
    }
}

module.exports = {
    createTask
}