import { useEffect, useState } from "react";
import api from "./api.js";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./context/authContext.jsx";
import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";
import ProtectedRoute from "./components/protectedRoutes.jsx";
import "./App.css";

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Search, filter and sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  // Add task form
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    due_date: "",
  });

  // Edit task states
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    due_date: "",
  });

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      const response = await api.get("/tasks");

      const fetchedTasks =
        response.data.tasks ?? response.data.task ?? [];

      setTasks(fetchedTasks);
      setError("");
    } catch (error) {
      console.error("Fetch error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to fetch tasks"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle add form changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create a task
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const newTask = {
        ...formData,
        due_date: formData.due_date || null,
      };

      await api.post("/tasks", newTask);

      setFormData({
        title: "",
        description: "",
        status: "pending",
        due_date: "",
      });

      await fetchTasks();
      setSuccess("Task created successfully!");
    } catch (error) {
      console.error("Create error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to create task"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Start editing a task
  const startEdit = (task) => {
    setEditingTaskId(task.id);

    setEditFormData({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "pending",
      due_date: task.due_date
        ? String(task.due_date).slice(0, 10)
        : "",
    });
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update a task
  const handleUpdate = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      const updatedTask = {
        ...editFormData,
        due_date: editFormData.due_date || null,
      };

      await api.put(
        `/tasks/${editingTaskId}`,
        updatedTask
      );

      setEditingTaskId(null);

      await fetchTasks();
      setSuccess("Task updated successfully!");
    } catch (error) {
      console.error(
        "Update error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update task"
      );
    }
  };

  // Delete a task
  const handleDelete = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/tasks/${taskId}`);

      if (editingTaskId === taskId) {
        setEditingTaskId(null);
      }

      await fetchTasks();
      setSuccess("Task deleted successfully!");
    } catch (error) {
      console.error(
        "Delete error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete task"
      );
    }
  };

  // Search, filter and sort tasks
  const filteredTasks = tasks
    .filter((task) => {
      const title = (task.title || "").toLowerCase();

      return title.includes(searchTerm.trim().toLowerCase());
    })
    .filter((task) => {
      return (
        statusFilter === "all" ||
        task.status === statusFilter
      );
    })
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return (
          new Date(b.created_at) - new Date(a.created_at)
        );
      }

      if (sortOrder === "oldest") {
        return (
          new Date(a.created_at) - new Date(b.created_at)
        );
      }

      if (sortOrder === "due_date") {
        // Tasks without due dates appear last
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;

        return (
          new Date(a.due_date) - new Date(b.due_date)
        );
      }

      return 0;
    });

  const totalTasks = tasks.length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "pending"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "in_progress"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;  

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueTasks = tasks.filter((task) => {
    if (!task.due_date || task.status === "completed") {
      return false;
    }

    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate < today;
  }).length;

  const {user, logout} = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="app">
      <div className="dashboard-header">
        <div>
            <h2>Task Manager</h2>
            {user && <p>Welcome, {user.name}!</p>}
        </div>

        <button onClick={handleLogout} className="logout-btn">
            Logout
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card total">
          <h3>Total Tasks</h3>
          <p>{totalTasks}</p>
        </div>

        <div className="stat-card pending">
          <h3>Pending</h3>
          <p>{pendingTasks}</p>
        </div>

        <div className="stat-card progress">
          <h3>In Progress</h3>
          <p>{inProgressTasks}</p>
        </div>

        <div className="stat-card completed">
          <h3>Completed</h3>
          <p>{completedTasks}</p>
        </div>

        <div className="stat-card overdue">
          <h3>Overdue</h3>
          <p>{overdueTasks}</p>
        </div>
      </div>

      {/* Add Task Form */}
      <section className="form-section">
        <h2>Add a New Task</h2>

        <form onSubmit={handleSubmit} className="task-form">
          <label htmlFor="title">Task Title</label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Enter task title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe your task"
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />

          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <label htmlFor="due_date">Due Date</label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            value={formData.due_date}
            onChange={handleChange}
          />

          <button type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Add Task"}
          </button>
        </form>

        {success && (
          <p className="success-message">{success}</p>
        )}

        {error && (
          <p className="error-message">{error}</p>
        )}
      </section>

      {/* Task List */}
      <section className="tasks-section">
        <h2>My Tasks ({filteredTasks.length})</h2>

        {/* Search, Filter and Sort Controls */}
        <div className="task-filters">
          <input
            type="text"
            placeholder="Search tasks by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search tasks by title"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter tasks by status"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            aria-label="Sort tasks"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="due_date">
              Due Date (Earliest First)
            </option>
          </select>
        </div>

        {loading ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p>No tasks available. Add your first task!</p>
        ) : filteredTasks.length === 0 ? (
          <p>No matching tasks found.</p>
        ) : (
          <div className="task-list">
            {filteredTasks.map((task) => (
              <div className="task-card" key={task.id}>
                {editingTaskId === task.id ? (
                  // Edit Form
                  <form
                    onSubmit={handleUpdate}
                    className="task-form"
                  >
                    <label>Title</label>
                    <input
                      name="title"
                      value={editFormData.title}
                      onChange={handleEditChange}
                      required
                    />

                    <label>Description</label>
                    <textarea
                      name="description"
                      value={editFormData.description}
                      onChange={handleEditChange}
                      rows="3"
                    />

                    <label>Status</label>
                    <select
                      name="status"
                      value={editFormData.status}
                      onChange={handleEditChange}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">
                        In Progress
                      </option>
                      <option value="completed">
                        Completed
                      </option>
                    </select>

                    <label>Due Date</label>
                    <input
                      type="date"
                      name="due_date"
                      value={editFormData.due_date}
                      onChange={handleEditChange}
                    />

                    <button type="submit">
                      Save Changes
                    </button>

                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setEditingTaskId(null)}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  // Task Card
                  <>
                    <h3>{task.title}</h3>

                    <p>
                      {task.description || "No description"}
                    </p>

                    <p>
                      Status: <strong>{task.status}</strong>
                    </p>

                    <p>
                      Due date:{" "}
                      {task.due_date
                        ? String(task.due_date).slice(0, 10)
                        : "Not set"}
                    </p>

                    <div className="task-actions">
                      <button
                        type="button"
                        onClick={() => startEdit(task)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => handleDelete(task.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const App = () => {
  const {user, loading} = useAuth();

  if(loading){
    return <p> Checking Authentication... </p>
  }

  return(
    <Routes>
      <Route
        path="/login"
        element={
          user ? <Navigate to = "/dashboard" replace /> : <Login />
        }
      />
      <Route
        path="/register"
        element={
          user ? <Navigate to="/dashboard" replace /> : <Register />
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <TaskManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <Navigate
           to={user ? "/dashboard" : "/login"}
           replace
          />
        }
      />
      <Route
        path="*"
        element={
          <Navigate 
            to={user ? "/dashboard" : "/login"}
            replace
          />
        }
      />
    </Routes>
  )
};

export default App;