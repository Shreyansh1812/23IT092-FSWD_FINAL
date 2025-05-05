import React, { useState } from 'react';
import EmployeeList from './EmployeeList.jsx';

function Dashboard() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="p-2 border border-gray-300 rounded mb-4 w-full"
            />
            <EmployeeList searchQuery={searchQuery} />
        </div>
    );
}

export default Dashboard;
