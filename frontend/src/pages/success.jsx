import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader"; 
import { CheckCircle, ArrowRight, Download, RefreshCw } from "lucide-react";

function Success() {
  const location = useLocation();
  const navigate = useNavigate();

  const [instructions, setInstructions] = useState("");
  const [showRedraftBox, setShowRedraftBox] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [redrafted, setRedrafted] = useState(null);
  const [message, setMessage] = useState("Your document has been generated and is ready for review.");

  const handleRedraft = async () => {
    setLoading(true);
    setMessage("AI is redrafting your contract...");
    try {
      const response = await fetch("http://127.0.0.1:5000/redraft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html: location.state?.html || "",
          instructions,
        }),
      });

      const data = await response.json();
      if (data.redrafted_html) {
        setRedrafted(data.redrafted_html);
        setMessage("Redraft complete! Review the new document preview below.");
      }
    } catch (err) {
      console.error("Redraft error:", err);
      setMessage("Something went wrong with redrafting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadRedraftedPDF = async () => {
    if (!redrafted) return;

    setLoading(true);
    setMessage("Generating final PDF...");
    try {
      const res = await fetch("http://127.0.0.1:5000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: redrafted }),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "redrafted_agreement.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();

      setMessage("PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF download error:", err);
      setMessage("Failed to generate PDF for download.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-container-app">
      <div className="app-container success-container">
        <div className="app-panel success-panel">
          <CheckCircle size={60} className="success-icon" />
          <h2>Document Ready!</h2>
          <p className="success-message">{message}</p>

          <div className="success-buttons">
            <button className="btn-secondary-outline" onClick={() => navigate("/document-history")}>
              View Document History
            </button>
            <button className="btn-primary-teal" onClick={() => navigate("/generate-nda")}>
              <ArrowRight size={20} /> Craft Another Document
            </button>
            <button className="btn-primary-teal redraft-cta" onClick={() => setShowRedraftBox(true)}>
              <RefreshCw size={20} /> Redraft using AI
            </button>
          </div>

          {loading && (
            <div className="loader-container">
              <ClipLoader color="var(--secondary-teal)" size={40} />
            </div>
          )}

          {showRedraftBox && (
            <div className="redraft-box">
              <h3>Enter Custom Instructions:</h3>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows="4"
                placeholder="E.g., Make the non-compete clause 18 months, or change the governing law to New York."
                disabled={loading}
              />
              <button onClick={handleRedraft} disabled={loading || !instructions.trim()} className="redraft-submit-btn">
                {loading ? "Processing..." : "Submit Redraft"}
              </button>
            </div>
          )}

          {redrafted && (
            <div className="redrafted-preview-section">
                <h3 className="text-secondary-teal">AI Redraft Preview</h3>
                <div className="redrafted-document" dangerouslySetInnerHTML={{ __html: redrafted }}></div>
                <button onClick={downloadRedraftedPDF} disabled={loading} className="btn-download-redraft">
                    <Download size={20} /> Download Final PDF
                </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Success;