import React, { useEffect, useState , useRef} from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import './css/dashboard.css';
import { useNavigate } from 'react-router';
import { useZxing } from "react-zxing";

const Dashboard = ({ token, setToken }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState(0);
  const [email, setEmail] = useState('');
  const [number, setNumber] = useState('');
  const [image, setImage] = useState("");
  const [role, setRole] = useState('');
  const [employees, setEmployees] = useState([]);
  const [companyId, setCompanyId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const navigate = useNavigate();

  const [result, setResult] = useState("");
  const [paused, setPaused] = useState(true);
  const [scanMessage, setScanMessage] = useState('');

  const { ref , 
    torch: {
    on: torchOn,
    off: torchOff,
    isOn: isTorchOn,
    isAvailable: isTorchAvailable,
  },
  } = useZxing({
    paused,
        onDecodeResult(result) {
          setResult(result.getText());
          handleScan(result.getText());
          // setStartScan(false);
        },
        onDecodeError(error) {
          // eslint-disable-next-line no-console
          console.log(error);
        },    
        onError(error) {
          // eslint-disable-next-line no-console
          console.error(error);
        },
      });

  
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const storedToken = token;
        if (!storedToken) throw new Error('No token found');

        const decodedToken = jwtDecode(storedToken);
        if (decodedToken.exp * 1000 < Date.now()) {
          throw new Error('Token expired');
        }

        setCompanyId(decodedToken.id);

        const [response, response2] = await Promise.all([
          axios.get(`https://empid-server-1.onrender.com/api/employees/all-employees/${decodedToken.id}`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }),
          axios.get(`https://empid-server-1.onrender.com/api/companies/${decodedToken.id}`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }),
        ]);

        setCompanyName(response2.data.name);
        setCompanyEmail(response2.data.email);
        setEmployees(response.data);
      } catch (error) {
        console.error('Token expired or invalid:', error);
        localStorage.removeItem('token');
        setToken('');
        navigate('/login');
      }
    };

    fetchEmployees();
  }, [navigate, token, setToken]);




 
  const onInputChange = (e) => {
    console.log(e.target.files[0]);
    setImage(e.target.files[0]);
  };


  const handleAddEmployee = async (e) => {
    e.preventDefault();

    try {
      const storedToken = token;
      if (!storedToken) throw new Error('No token found');

      // const formData = new FormData();
      // formData.append('name', name);
      // formData.append('age', age);
      // formData.append('email', email);
      // formData.append('number', number);
      // formData.append('role', role);
      // formData.append('image', image);

      const response = await axios.post(
        `https://empid-server-1.onrender.com/api/employees/add-employee/${companyId}`,
        {name,age,email,role,number,image},
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setEmployees([...employees, response.data]);
      setName('');
      setAge(0);
      setEmail('');
      setRole('');
      setNumber(0);
      setImage(null);
    } catch (error) {
      console.error('Error adding employee:', error);
      localStorage.removeItem('token');
      setToken('');
      navigate('/login');
    }
  };

  const handleProfile = (employeeId) => {
    navigate(`/dashboard/employee-details/${companyId}/employee/${employeeId}`);
  };



  const handleScan = async (data) => {
    if (data) {
      try {
        const employeeId = data; // Assuming the barcode data is the employee ID
        // console.log(data);
        const response = await axios.post(
          `https://empid-server-1.onrender.com/api/employees/${companyId}/employee/${employeeId}`,
           {status : "Present"},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response.data);
        setScanMessage(`Attendance marked successfully for ${response.data.employee.name}`);
        alert(`Attendance marked successfully for ${response.data.employee.name}`)
      } catch (error) {
        setScanMessage('Error marking attendance');
        console.error('Error marking attendance:', error);
      }
    }
  };

  return (
    <div className="dashboard">
      <div className="top">
         <div className="details">
             <p>Company Details</p>
         </div>
         <div className="cname">
            <h3>Company Name: {companyName}</h3>
            <h3>Company Email: {companyEmail}</h3>
         </div>
      </div>

      <div className="formaddemp">
        <div className="addtophead">
             <p>Add Employee</p>
        </div>
        {/* <div className="addempdetails">
            <div className="leftpart">

            </div>
            <div className="rightpart">

            </div>
        </div> */}
        <form className="add" onSubmit={handleAddEmployee}>

         <div className="t-add">
                  <p className='p-add'>Enter Name</p>
                  <input
                      type="text"
                      className="fillitem"
                      value={name}
                      placeholder="Name"
                      onChange={(e) => setName(e.target.value)}
                    />
         </div>

          <div className="t-add">
                <p className='p-add'>Enter Age</p>
                <input
                  type="text"
                  className="fillitem"
                  value={age}
                  placeholder="Age"
                  onChange={(e) => setAge(e.target.value)}
                />
          </div>
          <div className="t-add">
                <p className='p-add'>Enter Number</p>
                <input
                  type="text"
                  className="fillitem"
                  value={number}
                  placeholder="Number"
                  onChange={(e) => setNumber(e.target.value)}
                />
          </div>
          <div className="t-add">
                  <p className='p-add'>Enter Email</p>
                  <input
                      type="email"
                      className="fillitem"
                      value={email}
                      placeholder="Email"
                      onChange={(e) => setEmail(e.target.value)}
                    />
         </div>
          <div className="t-add">
                  <p className='p-add'>Enter Role</p>
                  <input
                      type="text"
                      className="fillitem"
                      value={role}
                      placeholder="Role"
                      onChange={(e) => setRole(e.target.value)}
                    />
         </div>


          <div className="t-add">
          <p className="p-add">Upload Image</p>
          <input
            type="file"
            accept="image/*"
            className="fillitem"
            onChange={onInputChange}
          />
        </div>
         
          <button className="btn" type="submit">
            Add Employee
          </button>
        </form>
      </div>

      <div className="listall">
      <div className="top-listall">
        <p>List of all Employees</p>
      </div>
      <div className="middle-listall">
        <div className="header-row">
          <p className='header-cell'>Name</p>
          <p className='header-cell'>Age</p>
          <p className='header-cell' id="cellbtn">Action</p>
        </div>
      </div>
      <div className="bottom-listall">
        {employees.map((employee) => (
          <div className="employee-row" key={employee._id}>
            <div className="cell">
              <p className="e-name">{employee.name}</p>
            </div>
            <div className="cell">
              <p className="e-age">{employee.age}</p>
            </div>
            <div className="cell" id="cellbtn">
                <button onClick={() => handleProfile(employee._id)}>View Full Profile</button>
            </div>
          </div>
        ))}
      </div>
    </div>


        <div className="attendance-scanner">
        <h1>Scan QR Code to mark attendance</h1>
        <button
          onClick={() => {
            setPaused(!paused);
            setScanMessage('');
            setResult('');
          }}
        >
          {paused ? 'Start Scan' : 'Stop Scan'}
        </button>
        {isTorchAvailable && (
          <button
            className="torch-btn"
            onClick={() => {
              if (isTorchOn) {
                torchOff();
              } else {
                torchOn();
              }
            }}
          >
            {isTorchOn ? 'Disable' : 'Enable'} Torch
          </button>
        )}

        {!paused && (
          <div className="scanner-container">
            <video ref={ref} className="scanner-video" />
            <p className="scanner-instructions">Point the camera at the QR code</p>
          </div>

          )}
        {scanMessage && <p className="scan-message">{scanMessage}</p>}
        <p className="scan-result">
          <span>Last result: </span>
          <span>{result}</span>
        </p>
            {/* <video ref={ref} />
          <p>
            <span>Last result:</span>
            <span>{result}</span>
          </p>
                <div>
                <button onClick={() => setPaused(!paused)}>
                  {paused ? "Start Scan" : "Stop Scan"}
                </button>
                <button
                  onClick={() => {
                    if (isTorchOn) {
                      torchOff();
                    } else {
                      torchOn();
                    }
                  }}
                  disabled={!isTorchAvailable}
                >
                  {isTorchOn ? "Disable" : "Enable"} torch
                </button> */}
              {/* </div> */}
          </div>          
    </div>
  )
}

export default Dashboard;
