import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AddEditEmployee() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [position, setPosition] = useState('');
    const [profilePic, setProfilePic] = useState(null);
    const [employeeType, setEmployeeType] = useState('Full-Time'); // Default type
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const { logout } = useAuth();

    useEffect(() => {
        if (id) {
            const fetchEmployee = async () => {
                try {
                    const token = localStorage.getItem('jwtToken');
                    const response = await fetch(`/api/employees/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (!response.ok) {
                        if (response.status === 401 || response.status === 403) {
                            logout();
                            navigate('/login');
                            return;
                        }
                        throw new Error('Failed to fetch employee');
                    }
                    
                    const data = await response.json();
                    setName(data.name);
                    setEmail(data.email);
                    setPosition(data.position);
                } catch (err) {
                    setError(err.message);
                    console.error(err);
                }
            };
            
            fetchEmployee();
        }
    }, [id, navigate, logout]);

    const handleFileChange = (e) => {
        setProfilePic(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const token = localStorage.getItem('jwtToken');
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('position', position);
            formData.append('employeeType', employeeType);
            if (profilePic) formData.append('profilePic', profilePic);

            const response = await fetch(id ? `/api/employees/${id}` : '/api/employees', {
                method: id ? 'PUT' : 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    logout();
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to save employee');
            }
            
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
            <h1 className="text-2xl font-bold mb-6 text-center">{id ? 'Edit Employee' : 'Add Employee'}</h1>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                />
                <input
                    type="text"
                    placeholder="Position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                />
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full p-2 border border-gray-300 rounded"
                />
                <select
                    value={employeeType}
                    onChange={(e) => setEmployeeType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                </select>
                <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                    disabled={loading}
                >
                    {loading ? (id ? 'Updating...' : 'Adding...') : (id ? 'Update' : 'Add')}
                </button>
                <button 
                    type="button"
                    onClick={() => navigate('/')}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded"
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}

export default AddEditEmployee;