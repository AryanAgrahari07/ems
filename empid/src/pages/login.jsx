import React, {useState, useEffect}  from 'react'
import "./css/login.css";
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
const Login = ({setToken}) => {

    const [email , setEmail] = useState("");
    const [password , setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handlelogin = async(event) => {
      event.preventDefault();
      const values = {email , password};

      try{
        setLoading(true);
        const response = await axios.post(`https://empid-server-1.onrender.com/api/companies/login`, values);
        localStorage.setItem("em-user" , 
          JSON.stringify({...response.data , password: ""})
        );
        localStorage.setItem('token', response.data.token);
        setToken(response.data.token);
        setLoading(false);
        console.log("login success");
        navigate('/dashboard');
      }
      catch(error){
        setLoading(false);
        if (error.response && error.response.status === 401) {
          console.log("Invalid credentials", error);
          // Handle invalid credentials (e.g., show a message to the user)
        } else {
          console.log("Error", error);
        }
      }
    }
    


  return (
    <div className='login'>
      <div className="first">
        <div className='first-img'></div>
      </div>

      <div className="formcontainer">
      <div className='formWrapper'>

        {/* <span className='logo'>Eid</span> */}

        <span className='title'>Login</span>
        <form className='forms' onSubmit={handlelogin}>
            <input className='fillitem' value={email} type="email" placeholder='Email' onChange={(e) => setEmail(e.target.value)}/>
            <input className='fillitem' value={password} type="password" placeholder='Password' onChange={(e)=> setPassword(e.target.value)}/>
            <button type="submit" className='btn' >Sign In</button>
            {/* {err && <span>Something went wrong</span>} */}
        </form>
        {/* {error && <p>{error}</p>} */}
        <p > Login to add a Event !  {" "}
        <Link to = "/signup" style={{textDecoration : "none"}}>
          Register
          </Link>
          </p>
      </div>
      </div>
    </div>
  )
}

export default Login
