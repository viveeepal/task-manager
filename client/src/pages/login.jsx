import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../context/authContext.jsx';
import "./auth.css";

const Login = () => {
    const {login} = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try{
            await login(formData.email, formData.password);
            navigate("/dashboard");
        } catch(err){
            setError(err.response?.data?.message || "Login failed. Please try again")
        } finally{
            setLoading(false);
        }
    }

    return(
        <div className = "auth-container">
            <form className = "auth-form" onSubmit={handleSubmit}>
                <h1>Welcome Back!</h1>
                <p>Login to manage your tasks</p>

                {error && <p className="error-message">{error}</p>}

                <label htmlFor='email'>Email</label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <label htmlFor='password'>Password</label>
                <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
                <p>
                    Don't have an account? 
                    <Link to="/register">
                        Register
                    </Link>
                </p>
            </form>
        </div>
    );
}
export default Login;