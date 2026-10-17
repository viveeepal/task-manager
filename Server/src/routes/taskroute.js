import express from "express";
import{createTask, getTaskById, getTasks, updateTask, deleteTask} from "../controllers/taskController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const route = express.Router();

route.post("/",authMiddleware, createTask);
route.get("/",authMiddleware, getTasks);
route.get("/:id",authMiddleware, getTaskById);
route.put("/:id",authMiddleware, updateTask);
route.delete("/:id",authMiddleware, deleteTask);

export default route;