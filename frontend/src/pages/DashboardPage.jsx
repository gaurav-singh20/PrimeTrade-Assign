import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";

const defaultTask = { title: "", description: "", status: "todo" };

const normalizeTasksPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState(defaultTask);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    try {
      const response = await apiClient.get("/tasks");
      setTasks(normalizeTasksPayload(response.data?.data));
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Could not fetch tasks");
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const clearFeedback = () => {
    setMessage("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearFeedback();

    try {
      if (editingTaskId) {
        await apiClient.patch(`/tasks/${editingTaskId}`, taskForm);
        setMessage("Task updated successfully");
      } else {
        await apiClient.post("/tasks", taskForm);
        setMessage("Task created successfully");
      }

      setTaskForm(defaultTask);
      setEditingTaskId(null);
      fetchTasks();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Task action failed");
    }
  };

  const handleEdit = (task) => {
    setTaskForm({
      title: task.title,
      description: task.description,
      status: task.status,
    });
    setEditingTaskId(task._id);
    clearFeedback();
  };

  const handleDelete = async (taskId) => {
    clearFeedback();
    try {
      await apiClient.delete(`/tasks/${taskId}`);
      setMessage("Task deleted successfully");
      fetchTasks();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Delete failed");
    }
  };

  return (
    <main className="dashboard-shell">
      <header className="header-row">
        <div>
          <h1>Dashboard</h1>
          <p>
            Logged in as {user?.name} ({user?.role})
          </p>
        </div>
        <button className="secondary" onClick={logout}>
          Logout
        </button>
      </header>

      <section className="card">
        <h2>{editingTaskId ? "Edit Task" : "Create Task"}</h2>
        <form onSubmit={handleSubmit} className="stacked-form">
          <input
            type="text"
            placeholder="Task title"
            value={taskForm.title}
            onChange={(event) =>
              setTaskForm({ ...taskForm, title: event.target.value })
            }
            required
          />
          <textarea
            placeholder="Task description"
            value={taskForm.description}
            onChange={(event) =>
              setTaskForm({ ...taskForm, description: event.target.value })
            }
          />
          <select
            value={taskForm.status}
            onChange={(event) =>
              setTaskForm({ ...taskForm, status: event.target.value })
            }
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <button type="submit">
            {editingTaskId ? "Update Task" : "Add Task"}
          </button>
          {editingTaskId && (
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setEditingTaskId(null);
                setTaskForm(defaultTask);
              }}
            >
              Cancel Edit
            </button>
          )}
        </form>
        {message && <p className="msg ok">{message}</p>}
        {error && <p className="msg err">{error}</p>}
      </section>

      <section className="card">
        <h2>Your Tasks</h2>
        {tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task._id}>
                <div>
                  <strong>{task.title}</strong>
                  <p>{task.description}</p>
                  <small>Status: {task.status}</small>
                </div>
                <div className="actions">
                  <button
                    className="secondary"
                    onClick={() => handleEdit(task)}
                  >
                    Edit
                  </button>
                  <button
                    className="danger"
                    onClick={() => handleDelete(task._id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default DashboardPage;
