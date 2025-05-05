import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EmployeeList from './components/EmployeeList.jsx';
import AddEditEmployee from './components/AddEditEmployee.jsx';
import EmployeeDetails from './components/EmployeeDetails.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Header from './components/Header.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import Dashboard from './components/Dashboard.jsx';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen flex flex-col">
                    <Header />
                    <main className="container mx-auto px-4 py-6 flex-grow">
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/" element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            } />
                            <Route path="/add" element={
                                <ProtectedRoute>
                                    <AddEditEmployee />
                                </ProtectedRoute>
                            } />
                            <Route path="/edit/:id" element={
                                <ProtectedRoute>
                                    <AddEditEmployee />
                                </ProtectedRoute>
                            } />
                            <Route path="/details/:id" element={
                                <ProtectedRoute>
                                    <EmployeeDetails />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
