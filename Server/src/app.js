import express, { urlencoded } from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/db.js"
import route from "./routes/taskroute.js";
import authRoutes from "./routes/authRoutes.js";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
const PgSessionStore = connectPgSimple(session);
// const port = process.env.PORT || 5000;

app.use(cors({
    origin : [
      "http://localhost:5173",
      "https://dodayilytasks.netlify.app"
    ],
    credentials: true,
}));

app.use(express.json());

// app.use(session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie:{
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax",
//         maxAge: 24 * 60 * 60 * 1000
//     }
// }))


app.use(session({
  store: new PgSessionStore({
    pool: db,
    tableName: "session",
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  },
}));


app.get("/",(req,res) => {
    res.send("Task is running through api");
});

app.use("/api/tasks", route);
app.use("/api/auth", authRoutes);

app.get("/api/health", async(req,res) => {
    try {
        const result = await db.query("select now() as time");

        res.json({
            message : "database connected successfully",
            success : true,
            time : result.rows[0].time,
        });

    } catch (err) {
        console.error("Database query failed:", err.message);
        res.status(500).json({
            success: false,
            message:"Database connection failed"
        })
    }
})

// app.listen(port, () => {
//     console.log(`Server is running on port ${port}.`);
// } )

export default app;