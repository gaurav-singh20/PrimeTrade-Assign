const asyncHandler = require('../utils/asyncHandler');
const {
  createTask,
  deleteTaskById,
  getTaskByIdForUser,
  getTaskList,
  updateTaskById
} = require('../services/taskService');

const createTaskHandler = asyncHandler(async (req, res) => {
  const task = await createTask(req.body, req.user);

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task
  });
});

const getTasksHandler = asyncHandler(async (req, res) => {
  const { page, limit, status, sort } = req.query;
  const result = await getTaskList(req.user, { page, limit, status, sort });

  res.status(200).json({
    success: true,
    data: result
  });
});

const getTaskByIdHandler = asyncHandler(async (req, res) => {
  const task = await getTaskByIdForUser(req.params.taskId, req.user);

  res.status(200).json({
    success: true,
    data: task
  });
});

const updateTaskHandler = asyncHandler(async (req, res) => {
  const task = await updateTaskById(req.params.taskId, req.body, req.user);

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: task
  });
});

const deleteTaskHandler = asyncHandler(async (req, res) => {
  await deleteTaskById(req.params.taskId, req.user);

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully'
  });
});

module.exports = {
  createTaskHandler,
  getTasksHandler,
  getTaskByIdHandler,
  updateTaskHandler,
  deleteTaskHandler
};
