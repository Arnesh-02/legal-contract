import React from 'react';
import { FileText, ShieldCheck, Download, Clock } from 'lucide-react';

import DocumentHistoryPanel from '../components/document-history-panel';

function Dashboard() {
    const mockStats = [
        { icon: FileText, title: "Documents Generated", value: 12, key: 'generated' },
        { icon: ShieldCheck, title: "Contracts Analyzed", value: 8, key: 'analyzed' },
        { icon: Download, title: "Total Downloads", value: 35, key: 'downloads' },
        { icon: Clock, title: "Last Activity (Days)", value: 2, key: 'activity' },
    ];

    return (
        <div className="page-container-app">
            <div className="app-container">
                <div className="app-panel">
                    <h2>👋 Welcome back, Amesh!</h2>
                    
                    <div className="dashboard-grid">
                        {mockStats.map(stat => (
                            <div key={stat.key} className="stats-card">
                                <stat.icon size={24} color="var(--accent-blue)" />
                                <p>{stat.title}</p>
                                <strong>{stat.value}</strong>
                            </div>
                        ))}
                    </div>
                </div>
                
                <DocumentHistoryPanel limit={3} />
            </div>
        </div>
    );
}

export default Dashboard;