import bcrypt from "bcrypt";
import db from "../config/db.js";
import {findUserByEmail, createUser} from "../models/userModel.js";

export const registerUser = async(req, res) => {
    try {
        const {name, email, password} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({
                success: false,
                message : "name, email, password is required"
            })
        };

        if(password < 8){
            return res.status(400).json({
                success:false,
                message:"password must be atleast 8 characters"
            });
        };

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedName = name.trim();

        if (!normalizedName || !normalizedEmail) {
            return res.status(400).json({
                success: false,
                message: "Name and email cannot be empty",
            });
        }

        const existingUser = await findUserByEmail(normalizedEmail);
        if(existingUser){
            return res.status(409).json({
                success: false,
                message:"email already exists"
            })
        };

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await createUser(
            normalizedName,
            normalizedEmail,
            hashedPassword
        );

        return res.status(201).json({
            success: true,
            message:"user registered successfully",
            user,
        });

    } catch (error) {
        console.error("registeration failed", error.message);

        res.status(500).json({
            success: false,
            message: "Registeration failed"
        })
    }
};

export const loginUser = async(req, res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                success: false,
                message:"email and password are required"
            })
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await findUserByEmail(normalizedEmail);

        if(!user){
            return res.status(401).json({
                success:false,
                message:"Invalid email or password"
            })
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        )

        if(!isPasswordValid){
            return res.status(401).json({
                success:false,
                message:"Invalid email or password"
            })
        }

        req.session.userId = user.id;

        return req.session.save((err) => {
            if(err){
                console.error("Session save error:", err.message);
                return res.status(500).json({
                    success: false,
                    message: "failed to create Login session"
                })
            }
            return res.status(200).json({
                success: true,
                message: "Login Successfull",
                user:{
                    id: user.id,
                    name : user.name,
                    email : user.email,
                },
            })
        })

    } catch (error) {
        console.error("Login Error:", error.message);

        return res.status(500).json({
            success:false,
            message:"Failed to Log In",
            error: error.message
        })
    }
}

export const getCurrentUser = async(req, res) => {
    try {
        console.log("session User Id:", req.session.userId);
        if(!req.session.userId){
            return res.status(401).json({
                success: false,
                message:"Not authenticated"
            })
        }

        const result = await db.query(
            `SELECT id, name, email FROM users
            WHERE id = $1`,
            [req.session.userId]
        )
        if(result.rows.length === 0){
            return req.session.destroy(() => {
                return res.status(401).json({
                    success: false,
                    message: "User no longer exists"
                })
            })
        };

        return res.status(200).json({
            success: true,
            user: result.rows[0]
        })
    } catch (error) {
        console.error("Get current user error:", error.message);
        return res.status(500).json({
            success:false,
            message:"failed to get current user"
        })
    }
};

export const logoutUser = async(req, res) => {
    
        req.session.destroy((err) => {
            if(err){
                console.error("logout error:", err.message);
                return res.status(500).json({
                    success: false,
                    message:"Logout failed"
                })
            }

            res.clearCookie("connect.sid",{
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                path:"/"
            })

            return res.status(200).json({
                success: true,
                message: "Logout Successfull"
            })
        })
};