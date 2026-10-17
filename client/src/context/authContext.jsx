import api from "../api.js";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try{
                const result = await api.get("/auth/me");
                setUser(result.data.user);
            } catch(err){
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        checkUser();
    },[]);
    
    const login = async (email, password) => {
        const result = await api.post("/auth/login", {
            email, 
            password
        });

        setUser(result.data.user);
        return result.data;
    }

    const register = async (name, email, password) => {
        const result = await api.post("/auth/register", {
            name,
            email,
            password
        });

        return result.data;
    }

    const logout = async () => {
        await api.post("/auth/logout");
        setUser(null);
    }

    return (
        <AuthContext.Provider 
        value={{user, loading, login, register, logout}}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);