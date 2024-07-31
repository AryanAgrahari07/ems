import React, {useState, useEffect} from 'react'
import "./css/login.css";
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import axios from 'axios'
// import API_URL from "../api.js";

const Signup = () => {

  const [username , setUsername] = useState("");
  const [email , setEmail] = useState("");
  const [password , setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(true);


  // const handlelogin = async(event) => {
  //   event.preventDefault();
  //   setLoading(true);
  //   // setLoading(false);
  // }



  const handlesubmit = async(event) => {
    event.preventDefault();

    const values = {username , email , password};
    try{
      setLoading(true);
      await axios.post(`https://empid-server-1.onrender.com/api/companies/register`, values);
      console.log("done");
      setLoading(false);
      // localStorage.removeItem('token');
      navigate("/login");
    }
    catch(error){
      // message.error("Something went wrong",error)
      setLoading(false);
      if (error.response && error.response.status === 400) {
        console.log("Registration error", error);
        // Handle registration error (e.g., show a message to the user)
      } else {
        console.log("Something went wrong", error);
      }
    }
  }

  useEffect(()=> {
    if(localStorage.getItem("token"))
        localStorage.removeItem('token');
  },[navigate]);

  const validateName = (value) => value.length >= 4;
  const validatePassword = (value) => {
    const validationRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return validationRegex.test(value);
  };

return (
  <div className='login'>
    {/* {loading} */}
      <div className="first">
        <div className='first-img'></div>
      </div>

    <div className="formcontainer">
    <div className='formWrapper'>

      {/* <span className='logo'>Eid</span> */}

      <span className='title'>Register</span>
      <form className='forms' onSubmit={handlesubmit}>
          <input className='fillitem' value={username} type="text"  placeholder='Username' onChange={(e) => setUsername(e.target.value)} required minLength={4}/>
          <input className='fillitem' value={email} type="email"  placeholder='Email' onChange={(e) => setEmail(e.target.value)} required />
          <input className='fillitem' value={password} type="password" placeholder='Password' onChange={(e)=> setPassword(e.target.value)} required/>
          <button type="submit" className='btn' disabled= {loading}> {loading ?'Signing up...' : 'Sign Up'}</button>
          {/* {err && <span>Something went wrong</span>} */}
      </form>
      {/* {error && <p>{error}</p>} */}
      <p > Register to add your Company !  {" "}
      <Link to = "/login" style={{textDecoration : "none"}}>
        Login
        </Link>
        </p>
    </div>
    </div>
  </div>
)
}

export default Signup
