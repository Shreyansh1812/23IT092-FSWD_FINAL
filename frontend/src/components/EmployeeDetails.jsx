import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Modal from 'react-modal'; // Ensure this import is correct

// Initialize Modal
Modal.setAppElement('#root');

function EmployeeDetails({ isOpen, onClose, employee }) {
    if (!employee) return null;

    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} className="modal" overlayClassName="overlay">
            <div className="p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">{employee.name}</h2>
                <img src={employee.profilePic} alt="Profile" className="w-32 h-32 rounded-full mx-auto mb-4" />
                <p><span className="font-semibold">Email:</span> {employee.email}</p>
                <p><span className="font-semibold">Position:</span> {employee.position}</p>
                <p><span className="font-semibold">Type:</span> {employee.employeeType}</p>
                <button onClick={onClose} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                    Close
                </button>
            </div>
        </Modal>
    );
}

export default EmployeeDetails;