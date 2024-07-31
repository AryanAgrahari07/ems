import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import './cs/attendance.css'

const Attendance = () => {
    const { companyId, employeeId } = useParams();
    const [attendance, setAttendance] = useState([]);
    const navigate = useNavigate();


    useEffect(()=> {
        const fetchAttendance = async() => {
            try{
                const token = localStorage.getItem('token');
                if(!token){
                    navigate('/login' , {replace : true});
                    return;
                }

                const decodedToken = jwtDecode(token);
                if(decodedToken.exp * 1000 < Date.now()){
                    localStorage.removeItem('token');
                    navigate('/login',{replace: true});
                    return;
                }

                const response = await axios.get(`https://empid-server-1.onrender.com/api/employees/${companyId}/employee/${employeeId}/attendance`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const formattedAttendance = response.data.map(record => ({
                    ...record,
                    date: new Date(record.date).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata', // IST timezone
                    })
                }));
                setAttendance(formattedAttendance);
            } catch(error){
                console.error('Error fetching attendance' , error);
                localStorage.removeItem('token');
                navigate('/login' , {replace : true});
            }
        }
        
        fetchAttendance();
    } , [companyId, employeeId, navigate])
  return (
    <div className='attendance'>
        <h1>Attendance Records</h1>
        <ul>
            {
                attendance.map((record, index) => (
                    <li key={index}>
                         <span>Date: {record.date}</span> - 
                         <span>Status: {record.status}</span>
                    </li>
                ))
            }
        </ul>
    </div>
  )
}

export default Attendance
