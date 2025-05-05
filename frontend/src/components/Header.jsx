import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-blue-600 text-white shadow-md">
            <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold">Employee Management</Link>
                
                <div className="flex space-x-4">
                    {isAuthenticated ? (
                        <>
                            <Link to="/" className="hover:text-blue-200">Employees</Link>
                            <Link to="/add" className="hover:text-blue-200">Add Employee</Link>
                            <button 
                                onClick={handleLogout} 
                                className="hover:text-blue-200"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-blue-200">Login</Link>
                            <Link to="/register" className="hover:text-blue-200">Register</Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}

export default Header;
