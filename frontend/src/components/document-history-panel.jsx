import React from 'react';
import { Download, Edit, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock data for the document list
const mockDocuments = [
    { id: 1, name: "Founders Agreement - Project X", type: "Generated", date: "2025-10-20", url: "#" },
    { id: 2, name: "NDA - Vendor Contract V1", type: "Generated", date: "2025-10-15", url: "#" },
    { id: 3, name: "Lease Agreement - Risk Report", type: "Analyzed", date: "2025-09-28", url: "#" },
    { id: 4, name: "Software License Draft", type: "Generated", date: "2025-09-10", url: "#" },
    { id: 5, name: "Privacy Policy Analysis", type: "Analyzed", date: "2025-09-01", url: "#" },
];


function DocumentHistoryPanel({ limit = null, title = "Recent Documents" }) {
    const navigate = useNavigate();
    const documentsToShow = limit ? mockDocuments.slice(0, limit) : mockDocuments;

    return (
        <div className="app-panel">
            <h2>{title}</h2>
            <div className="document-list">
                {documentsToShow.map(doc => (
                    <div key={doc.id} className="document-item">
                        <FileText size={20} color="var(--text-secondary)" style={{ marginRight: '15px' }} />
                        <div className="doc-info">
                            <h4>{doc.name}</h4>
                            <p>Type: {doc.type} | Date: {doc.date}</p>
                        </div>
                        <div className="doc-actions">
                            <button onClick={() => alert(`Viewing details for ${doc.name}`)}>
                                View
                            </button>
                            {doc.type === 'Generated' && (
                                <button onClick={() => alert(`Downloading ${doc.name}`)}>
                                    <Download size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {limit && mockDocuments.length > limit && (
                <button 
                    className="profile-save-btn" 
                    style={{ width: 'auto', marginTop: '20px' }}
                    onClick={() => navigate('/document-history')}
                >
                    View All Documents
                </button>
            )}
        </div>
    );
}

export default DocumentHistoryPanel;