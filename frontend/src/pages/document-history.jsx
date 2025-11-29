import React from 'react';
import DocumentHistoryPanel from '../components/document-history-panel';

function DocumentHistory() {
    return (
        <div className="page-container-app">
            <div className="app-container">
                <DocumentHistoryPanel limit={null} title="All Generated & Analyzed Documents" />
            </div>
        </div>
    );
}

export default DocumentHistory;