import React, { useEffect, useState, useContext } from 'react';
import { FileText, Award, BookOpen } from 'lucide-react';
import { getUserDocuments } from '../api/documents';
import { AuthContext } from '../context/auth-context';
import DocumentHistoryPanel from '../components/document-history-panel';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

function Dashboard() {
    const { user } = useContext(AuthContext);

    const [stats, setStats] = useState({
        totalDocs: 0,
        mostUsed: "-",
        lastCreated: "-",
    });

    const [graphData, setGraphData] = useState(null);

    useEffect(() => {
        async function loadStats() {
            try {
                const res = await getUserDocuments();
                const docs = res.data || [];

                if (!docs.length) {
                    setStats({
                        totalDocs: 0,
                        mostUsed: "None",
                        lastCreated: "None",
                    });
                    return;
                }

                // Total docs
                const totalDocs = docs.length;

                // Most used template
                const countMap = {};
                docs.forEach(d => {
                    countMap[d.type] = (countMap[d.type] || 0) + 1;
                });
                const mostUsed = Object.entries(countMap).sort((a, b) => b[1] - a[1])[0][0];

                // Last created
                const last = docs.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                )[0].type;

                // Graph (smaller, cleaner)
                const today = new Date();
                const days = [];
                const counts = [];

                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(today.getDate() - i);

                    const label = d.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                    });

                    const count = docs.filter(doc => {
                        const dt = new Date(doc.created_at);
                        return (
                            dt.getDate() === d.getDate() &&
                            dt.getMonth() === d.getMonth() &&
                            dt.getFullYear() === d.getFullYear()
                        );
                    }).length;

                    days.push(label);
                    counts.push(count);
                }

                setGraphData({
                    labels: days,
                    datasets: [
                        {
                            label: "Documents Created",
                            data: counts,
                            borderColor: "#0EA5E9",
                            backgroundColor: "rgba(14, 165, 233, 0.15)",
                            borderWidth: 2,
                            tension: 0.35,
                            pointRadius: 3,
                            pointBackgroundColor: "#0284C7",
                        }
                    ]
                });

                setStats({
                    totalDocs,
                    mostUsed,
                    lastCreated: last,
                });

            } catch (err) {
                console.error("Dashboard stats error:", err);
            }
        }

        loadStats();
    }, []);

    const statCards = [
        { icon: FileText, title: "Total Documents", value: stats.totalDocs },
        { icon: Award, title: "Most Used Template", value: stats.mostUsed },
        { icon: BookOpen, title: "Last Created Document", value: stats.lastCreated },
    ];

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-container">

                <div className="dashboard-header">
                    <h2>👋 Welcome back, {user?.name || "User"}!</h2>
                    <p className="dashboard-sub">Your legal document assistant at a glance</p>
                </div>

                {/* Stat Cards */}
                <div className="dashboard-grid">
                    {statCards.map((stat, idx) => (
                        <div key={idx} className="stats-card compact">
                            <stat.icon size={22} className="stats-icon" />
                            <p>{stat.title}</p>
                            <strong>{stat.value}</strong>
                        </div>
                    ))}
                </div>

                {/* Compact Graph */}
                {graphData && (
                    <div className="graph-card compact">
                        <div className="graph-header">
                            <h3>📊 Activity Overview</h3>
                        </div>
                        <div className="graph-inner">
                            <Line
                                data={graphData}
                                height={140}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: { beginAtZero: true, ticks: { stepSize: 1 } },
                                        x: { grid: { display: false } }
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}

                <DocumentHistoryPanel limit={3} />
            </div>
        </div>
    );
}

export default Dashboard;
