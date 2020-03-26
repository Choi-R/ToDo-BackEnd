const Task = require("../models/task.js");
const { success, error } = require("../helpers/response.js");

const create = (req, res) => {
  let task = new Task({
    name: req.body.name,
    description: req.body.description,
    deadLine: req.body.deadLine,
    owner: req.headers.authorization
  });
  task
    .save()
    .then(() => {
      success(res, task, 201);
    })
    .catch(err => {
      error(res, err, 400);
    });
};

let showTask = (req, res) => {
  let page = parseInt(req.query.page, 10)
  let limit = parseInt(req.query.limit, 10)
  Task.paginate({owner: req.headers.authorization}, {page, limit})
    .then(data => {
      success(res, data, 200);
    })
};

let showTaskByImportance = (req, res) => {
  let page = parseInt(req.query.page, 10)
  let limit = parseInt(req.query.limit, 10)
  Task.paginate({ owner: req.headers.authorization, importance: true }, {page, limit})
    .then(data => {
      success(res, data, 200);
    })
};

let showTaskByCompletion = (req, res) => {
  let page = parseInt(req.query.page, 10)
  let limit = parseInt(req.query.limit, 10)
  Task.paginate({ owner: req.headers.authorization, completion: true }, {page, limit})
    .then(data => {
      success(res, data, 200);
    })
};

let updateTask = (req, res) => {
  Task.findOneAndUpdate(
    { owner: req.headers.authorization, _id: req.params._id },
    req.body
  )
    .then(data => {
      success(res, { data: data, changes: req.body }, 200);
    })
    .catch(err => {
      error(res, err, 404);
    });
};

let deleteTask = (req, res) => {
  Task.findOneAndRemove({
    owner: req.headers.authorization,
    _id: req.params._id
  })
    .then(data => {
      success(res, { data: data, message: "Data removed" }, 200);
    })
    .catch(err => {
      error(res, err, 404);
    });
};

module.exports = {
  create,
  showTask,
  showTaskByImportance,
  showTaskByCompletion,
  updateTask,
  deleteTask
};
