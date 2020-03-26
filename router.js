const express = require("express");
const router = express.Router();
const user = require("./controllers/userController.js");
const authenticate = require("./middlewares/auth.js");
const uploader = require("./middlewares/multer.js");
const task = require("./controllers/taskController.js");

// User Router
router.route('/users')
    .post(user.register)
    .put(user.login)
    .get(authenticate, user.current)
router.put('/users/update', authenticate, user.update)
router.put('/users/photo', authenticate, uploader, user.uploadPhoto)

// Task Router
router.post("/tasks", authenticate, task.create);
router.get("/tasks", authenticate, task.showTask);
router.get(
  "/tasks/findTaskByImportance",
  authenticate,
  task.showTaskByImportance
);
router.get("/tasks/findTaskByCompletion", authenticate, task.showTaskByCompletion);
router.put("/tasks/:_id", authenticate, task.updateTask);
router.delete("/tasks/:_id", authenticate, task.deleteTask);

module.exports = router;
