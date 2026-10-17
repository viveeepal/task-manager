import express from "express";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../controllers/authController.js";

const route = express();

route.post("/register", registerUser);
route.post("/login", loginUser);
route.get("/me", getCurrentUser);
route.post("/logout", logoutUser);

export default route;