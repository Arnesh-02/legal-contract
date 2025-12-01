import React, { useEffect, useState } from 'react';
import { Download, FileText, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserDocuments } from '../api/documents';

function DocumentHistoryPanel({ limit = null, title = "All Documents" }) {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadDocs = async () => {
            try {
                const res = await getUserDocuments();
                setDocs(res.data || []);
            } catch (err) {
                console.error("Error loading documents:", err);
            }
            setLoading(false);
        };
        loadDocs();
    }, []);

    const documentsToShow = limit ? docs.slice(0, limit) : docs;

    // ---------------- Empty State UI ----------------
    if (!loading && documentsToShow.length === 0) {
        return (
            <div className="empty-documents">
                <FolderOpen size={80} color="#2563eb" />
                <h2>No Documents Found</h2>
                <p>You haven’t generated any legal documents yet.</p>

                <button
                    className="profile-save-btn"
                    onClick={() => navigate("/generate-founders-agreement")}
                >
                    Generate Your First Document
                </button>
            </div>
        );
    }

    return (
        <div className="app-panel">
            <h2>{title}</h2>

            {loading ? (
                <p>Loading documents...</p>
            ) : (
                <div className="document-list">
                    {documentsToShow.map(doc => (
                        <div key={doc._id} className="document-item">
                            <FileText size={22} className="doc-icon" />

                            <div className="doc-info">
                                <h4>{doc.title}</h4>
                                <p>
                                    Type: {doc.type} | Date:{" "}
                                    {new Date(doc.created_at).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="doc-actions">
                                <button
                                    onClick={() =>
                                        window.open(
                                            `${import.meta.env.VITE_API_URL}/api/documents/${doc._id}/download`,
                                            "_blank"
                                        )
                                    }
                                >
                                    <Download size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DocumentHistoryPanel;
