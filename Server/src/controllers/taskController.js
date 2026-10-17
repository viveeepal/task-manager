import db from "../config/db.js";
export const createTask = async(req, res) => {
    try {
        const {title, description, due_date} = req.body;
        const userId = req.userId;
        if(!title || !title.trim()){
            return res.status(400).json({
                success: false,
                message: "Task title is required"
            });
        }
        const result = await db.query(
            `INSERT INTO tasks (title, description, due_date, user_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [
                title.trim(),
                description || null,
                due_date || null,
                userId
            ]
        );
        res.status(201).json({
            success : true,
            message : "task completed successfully",
            task : result.rows[0]
        });
    } catch (error) {
        console.error("creating task failed:", error);

        res.status(500).json({
            success:false,
            message:"failed to create task",
            error: error.message
        });
    };
}

export const getTasks = async(req, res) => {
    try {
        const userId = req.userId;
        const result = await db.query(
            `SELECT * FROM tasks
            WHERE user_id = $1 
            ORDER BY created_at DESC`,
            [userId]
        );
        res.status(200).json({
            success:true,
            message:"task fetched successfully",
            count: result.rows.length,
            task: result.rows
        });
    } catch (error) {
        console.error("error fetching task", error.message);

        res.status(500).json({
            success: false,
            message: "get task failed to fetch",
            error: error.message
        })
    }
}

export const getTaskById = async(req, res) => {
    try {
        const {id} = req.params;
        const userId = req.userId;
        const result = await db.query(
            `SELECT * FROM tasks 
            WHERE id = $1 and user_id = $2`,
            [id, userId]
        );
        if(result.rows.length === 0){
            return res.status(404).json({
                success:false,
                message:"task not found"
            })
        };
        res.status(200).json({
            success:true,
            message:"task fetched successfully",
            task: result.rows[0]
        });
    } catch (error) {
        console.error("failed to fetch task id:", error.message);

        res.status(500).json({
            success:false,
            message:"failed to fetch taskid",
            error: error.message
        })
    }
}

export const updateTask = async(req, res) => {
    try {
        const {id} = req.params;
        const userId = req.userId;
        const {title, description, status, due_date} = req.body;
        const result = await db.query(
            `UPDATE tasks
            SET title = $1,
                description = $2,
                status = $3,
                due_date = $4,
                updated_at = CURRENT_TIMESTAMP
            where user_id = $5 and id = $6
            RETURNING *`,
            [title, description, status, due_date, userId, id]
        );

        if(result.rows.length === 0){
            return res.status(404).json({
                success:false,
                message:"task not found"
            })
        };
        res.status(200).json({
            success:true,
            message:"task fetched successfully",
            task: result.rows[0]
        });
    } catch (error) {
        console.error("error in update", error.message);

        res.status(500).json({
            success: false,
            message: "update task failed",
            error: error.message
        })
    }
}

export const deleteTask = async(req, res) => {
    try {
        const {id} = req.params;
        const userId = req.userId;
        const result = await db.query(
            `DELETE FROM tasks 
            WHERE id = $1 and userId = $2 
            RETURNING *`,
            [id, userId]
        );
        if(result.rows.length === 0){
            return res.status(404).json({
                success:false,
                message:"delete task failed"
            })
        }
        res.status(200).json({
            success:true,
            message:"task deleted successfully",
            task: result.rows[0]
        })
    } catch (error) {
        console.error("delete task failed:", error.message);
        res.status(500).json({
            success:false,
            message:"delete task failed",
            error: error.message
        })
    }
}