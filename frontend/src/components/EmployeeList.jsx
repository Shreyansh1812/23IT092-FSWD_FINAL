import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EmployeeDetails from './EmployeeDetails.jsx';

function EmployeeList({ searchQuery }) {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                let token = localStorage.getItem('jwtToken');
                if (!token) {
                    logout();
                    navigate('/login');
                    return;
                }
                
                let response = await fetch('/api/employees', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Handle token expiration
                if (response.status === 401 || response.status === 403) {
                    try {
                        const refreshResponse = await fetch('/api/employees/refresh', { 
                            method: 'POST', 
                            credentials: 'include' 
                        });
                        
                        if (refreshResponse.ok) {
                            const data = await refreshResponse.json();
                            if (data && data.accessToken) {
                                localStorage.setItem('jwtToken', data.accessToken);
                                token = data.accessToken;

                                // Retry fetching employees after refreshing the token
                                response = await fetch('/api/employees', {
                                    headers: { Authorization: `Bearer ${token}` },
                                });
                            } else {
                                throw new Error('Invalid token response');
                            }
                        } else {
                            throw new Error('Token refresh failed');
                        }
                    } catch (refreshErr) {
                        console.error('Token refresh error:', refreshErr);
                        logout();
                        navigate('/login');
                        return;
                    }
                }

                if (response.status === 404) {
                    console.warn('Resource not found');
                    setEmployees([]);
                    setLoading(false);
                    return;
                }

                if (response.ok) {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const data = await response.json();
                        setEmployees(data || []);
                    } else {
                        setEmployees([]);
                        console.warn('Response is not JSON', contentType);
                    }
                } else {
                    if (response.status === 401) {
                        logout();
                        navigate('/login');
                    } else {
                        const errorText = await response.text();
                        throw new Error(`Failed to fetch employees: ${response.status} ${errorText}`);
                    }
                }
            } catch (err) {
                setError(`An error occurred while fetching employees: ${err.message}`);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchEmployees();
    }, [logout, navigate]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                const token = localStorage.getItem('jwtToken');
                const response = await fetch(`/api/employees/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                if (response.ok) {
                    setEmployees(employees.filter(emp => emp._id !== id));
                } else {
                    const errorText = await response.text();
                    setError(`Failed to delete employee: ${response.status} ${errorText}`);
                }
            } catch (err) {
                setError(`An error occurred while deleting the employee: ${err.message}`);
                console.error(err);
            }
        }
    };

    const handleViewDetails = (employee) => {
        setSelectedEmployee(employee);
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Employee List</h1>
                <Link to="/add" className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
                    Add New Employee
                </Link>
            </div>
            
            <EmployeeDetails
                isOpen={!!selectedEmployee}
                onClose={() => setSelectedEmployee(null)}
                employee={selectedEmployee}
            />

            {filteredEmployees.length === 0 ? (
                <p className="text-center py-10">No employees found. Add your first employee!</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEmployees.map(employee => (
                        <div key={employee._id} className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-2">{employee.name}</h3>
                            <p className="text-gray-600 mb-1">{employee.position}</p>
                            <p className="text-gray-500 mb-4">{employee.email}</p>
                            
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleViewDetails(employee)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
                                >
                                    View
                                </button>
                                <Link 
                                    to={`/edit/${employee._id}`}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded text-sm"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(employee._id)}
                                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default EmployeeList;