import {useState} from 'react';
import {useAuth} from '../context/authContext.jsx';
import {Link, useNavigate} from 'react-router-dom';
import "./auth.css";

const Register = () => {
    const {register} = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try{
            await register(
                formData.name,
                formData.email,
                formData.password,
            )
            setSuccess("Registration successful! You can now log in.");
            setTimeout(() => {
                navigate("/login");
            }, 1000);
        } catch(err){
            setError(
                err.response?.data?.message || 
                "Registration failed. Please try again."
            )
        } finally{
            setLoading(false);
        }
    };

    return(
        <div className = "auth-container">
            <form className = "auth-form" onSubmit={handleSubmit}>
                <h1>Create Account</h1>
                <p>Sign up to manage your tasks</p>

                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                <label htmlfor='name'>Name</label>
                <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <label htmlfor='email'>Email</label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <label htmlfor='password'>Password</label>
                <input
                    id="password"
                    type="password"
                    name="password"
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </button>
                <p>
                    Already have an account? 
                    <Link to="/login">
                        Login
                    </Link>
                </p>
            </form>
        </div>
    )
}
            
export default Register;