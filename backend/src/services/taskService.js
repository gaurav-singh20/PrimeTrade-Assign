const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');

const createTask = async (payload, user) => {
  const task = await Task.create({
    ...payload,
    userId: user._id
  });

  return task;
};

const getTaskList = async (user, { page = 1, limit = 10, status, sort = '-createdAt' } = {}) => {
  const skip = (page - 1) * limit;
  const filter = user.role === 'admin' ? {} : { userId: user._id };

  if (status) {
    filter.status = status;
  }

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Task.countDocuments(filter)
  ]);

  return {
    total,
    page: Number(page),
    limit: Number(limit),
    data: tasks
  };
};

const getTaskByIdForUser = async (taskId, user) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  const isOwner = task.userId.toString() === user._id.toString();
  if (user.role !== 'admin' && !isOwner) {
    throw new ApiError(403, 'Forbidden: cannot access this task');
  }

  return task;
};

const updateTaskById = async (taskId, updates, user) => {
  const task = await getTaskByIdForUser(taskId, user);

  Object.assign(task, updates);
  await task.save();

  return task;
};

const deleteTaskById = async (taskId, user) => {
  const task = await getTaskByIdForUser(taskId, user);
  await task.deleteOne();
};

module.exports = {
  createTask,
  getTaskList,
  getTaskByIdForUser,
  updateTaskById,
  deleteTaskById
};
