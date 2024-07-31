import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
// import EmployeeBarcode from './EmployeeBarcode';
import QRCode from 'qrcode.react';
import './cs/employee-details.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


const Emp = () => {
  const {companyId, employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [image, setImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedAge, setEditedAge] = useState('');

  const [attendanceStatus, setAttendanceStatus] = useState('Present');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmpDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login', { replace: true });
            return;
        };

        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
            localStorage.removeItem('token'); // Remove expired token from storage
            navigate('/login', { replace: true }); // Redirect to login if token is expired
            return;
        }

        const response = await axios.get(`https://empid-server-1.onrender.com/api/employees/${companyId}/employee/${employeeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEmployee(response.data);

        if (response.data && response.data.image) {
          const res2 = await axios.get(`https://empid-server-1.onrender.com/api/employees/image/${response.data.image}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            responseType: 'blob', // Ensure response type is blob for images
          });

          setImage(URL.createObjectURL(res2.data));
        }
      } catch (error) {
        console.error('Error fetching employee details:', error);
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
      }
    };

    fetchEmpDetails();
  }, [companyId, employeeId, navigate]);

  if (!employee) {
    return <div>Loading....</div>;
  }


  const handleMarkAttendance = async() => {
    try{
      const token = localStorage.getItem('token');
      if(!token) throw new Error('No token found');

      await axios.post(`https://empid-server-1.onrender.com/api/employees/${companyId}/employee/${employeeId}`,
        {status : attendanceStatus}, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Attendance marked successfully');
    }
    catch(error){
      console.error('Error marking attendance' , error);
    }
  }



  const handleEdit = async() => {
    setIsEditing(true);
  }

  const handleEditSubmit = async(e) => {
        e.preventDefault();

        try{
            const token = localStorage.getItem('token');
            if(!token) throw new Error('No token found');

            const updatedEmployee = {name: editedName , age: editedAge};

            await axios.put(`https://empid-server-1.onrender.com/api/employees/${companyId}/editemployee/${employeeId}`, updatedEmployee,{
                headers: {
                    Authorization: `Bearer ${token}`,
                  },
            });

            setEmployee({...employee, ...updatedEmployee});
            setIsEditing(false);
        }
        catch(error){
            console.error('Error updating employee', error);
        }
  };

  const handleDelete = async () => {

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      await axios.delete(`https://empid-server-1.onrender.com/api/employees/${companyId}/deleteemployee/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate(`/dashboard/${companyId}`);

    } catch (error) {

      console.error('Error deleting employee:', error);
    }
  };


  const handleAttendanceRecord = async() => {
     navigate(`/dashboard/employee-details/${companyId}/employee/${employeeId}/attendance`);
  };



  const captureAndDownloadPDF = () => {
    const input = document.getElementById('employee-card');

    html2canvas(input, {logging:true, letterRendering: 1, scrollY: -window.scrollY, useCORS: true })
      .then((canvas) => {
        const imgWidth = 208; // A4 size width
        const imgHeight = canvas.height * imgWidth / canvas.width;
        const imgData = canvas.toDataURL('img/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save('employee-card.pdf');
      })
      .catch((error) => {
        console.error('Error generating PDF:', error);
      });
  };


  return (
    <div className='employee-details'>
    {isEditing ? (
      <form className="edit-form" onSubmit={handleEditSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name: </label>
          <input
            type="text"
            id="name"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="age">Age: </label>
          <input
            type="number"
            id="age"
            value={editedAge}
            onChange={(e) => setEditedAge(e.target.value)}
          />
        </div>
        <div className="form-buttons">
          <button className="btn-primary" type="submit">Save</button>
          <button className="btn-secondary" type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      </form>
    ) : (
      <div>
    <button className="btn-top" onClick={captureAndDownloadPDF}>Save as PDF</button>
      <div className="card"  id="employee-card">
        <div className="card-header" id="employee-card">
          <h2>Employee ID Card</h2>
        </div>

        <div className='image-e'>
          <div className="left">{image && <img src={image} alt="Employee" className='image-emp'/>}</div>
          <div className="right"> <QRCode value={employee._id}/></div>
        </div>

        <div className="card-body">
          <div className="detail-item">
            <p className="detail-label">Employee ID:</p>
            <p className="detail-value">{employee._id}</p>
          </div>
          <div className="detail-item">
            <p className="detail-label">Name:</p>
            <p className="detail-value">{employee.name}</p>
          </div>
          <div className="detail-item">
            <p className="detail-label">Age:</p>
            <p className="detail-value">{employee.age}</p>
          </div>
          <div className="detail-item">
            <p className="detail-label">Role:</p>
            <p className="detail-value">{employee.role}</p>
          </div>
          <div className="detail-item">
            <p className="detail-label">Email:</p>
            <p className="detail-value">{employee.email}</p>
          </div>
          <div className="detail-item">
            <p className="detail-label">Number:</p>
            <p className="detail-value">{employee.number}</p>
          </div>
        </div>
        <div className="card-footer">
          <button className="btn-card" onClick={handleMarkAttendance}>Mark Attendance</button>
          <button className="btn-card" onClick={handleEdit}>Edit</button>
          <button className="btn-card" onClick={handleDelete}>Delete</button>
          <button className="btn-card" onClick={handleAttendanceRecord}>View Attendance Record</button>
        </div>
      </div>
    </div>
    )}
  </div>
  
  );
};

export default Emp;