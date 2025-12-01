import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
// Note: Assumes Bootstrap CSS/JS are loaded globally or via index.js

function FoundersPage() {
  const navigate = useNavigate();
  const todayIso = new Date().toISOString().split("T")[0];
  const previewPanelRef = useRef(null); 

  const [formData, setFormData] = useState({
    EFFECTIVE_DATE: todayIso, 
    COMPANY_NAME: "",
    COMPANY_ADDRESS: "",
    COMPANY_SIGNATORY_NAME: "",
    COMPANY_SIGNATORY_DESIGNATION: "",
    FOUNDER_NAME: "",
    FOUNDER_ADDRESS: "",
    FOUNDER_DESIGNATION: "",
    FOUNDER_SALARY: "",
    FOUNDER_SALARY_WORDS: "",
    NONCOMPETE_PERIOD: "12",
    NOTICE_PERIOD: "30",
    SEVERANCE_AMOUNT: "1",
    JURISDICTION_CITY: "Coimbatore", 
  });

  const [template, setTemplate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const ALIASES = {
    "company.name": "COMPANY_NAME",
    "company.address": "COMPANY_ADDRESS",
    "authorized.signatory.name": "COMPANY_SIGNATORY_NAME",
    "authorized.signatory.designation": "COMPANY_SIGNATORY_DESIGNATION",
    "founder.name": "FOUNDER_NAME",
    "founder.address": "FOUNDER_ADDRESS",
    "founder.designation": "FOUNDER_DESIGNATION",
    "founder.salary": "FOUNDER_SALARY",
    "founder.salary.words": "FOUNDER_SALARY_WORDS",
    "noncompete.period": "NONCOMPETE_PERIOD",
    "notice.period": "NOTICE_PERIOD",
    "severance.amount": "SEVERANCE_AMOUNT",
    "effective.date": "EFFECTIVE_DATE",
    "jurisdiction.city": "JURISDICTION_CITY",
  };

  const placeholderToKey = (ph) => {
    const clean = ph.trim();
    return ALIASES[clean] || clean.replace(/[^a-zA-Z0-9]+/g, "_").toUpperCase();
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/get-template/founders`)
      .then((res) => res.text())
      .then((text) => {
        setTemplate(text);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching template:", err);
        setTemplate(
          "<p class='text-danger'>Error loading template. Please check the backend connection.</p>"
        );
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const panel = previewPanelRef.current;
    if (!panel || isLoading) return;

    const handleMouseOver = (e) => {
      const target = e.target;
      if (target.classList.contains("placeholder-blank")) {
        const key = target.dataset.key;
        if (key) {
          const inputEl = document.getElementById(key);
          if (inputEl) {
            inputEl.classList.add("form-control-highlight");
          }
        }
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target;
      if (target.classList.contains("placeholder-blank")) {
        const key = target.dataset.key;
        if (key) {
          const inputEl = document.getElementById(key);
          if (inputEl) {
            inputEl.classList.remove("form-control-highlight");
          }
        }
      }
    };

    const handleClick = (e) => {
      const target = e.target;
      if (target.classList.contains("placeholder-blank")) {
        const key = target.dataset.key;
        if (key) {
          const inputEl = document.getElementById(key);
          if (inputEl) {
            inputEl.focus();

            const accordionBody = inputEl.closest(".accordion-collapse");
            if (accordionBody && !accordionBody.classList.contains("show")) {
              const button = document.querySelector(
                `[data-bs-target="#${accordionBody.id}"]`
              );
              if (button) {
                button.click(); 
              }
            }
          }
        }
      }
    };

    panel.addEventListener("mouseover", handleMouseOver);
    panel.addEventListener("mouseout", handleMouseOut);
    panel.addEventListener("click", handleClick);

    return () => {
      panel.removeEventListener("mouseover", handleMouseOver);
      panel.removeEventListener("mouseout", handleMouseOut);
      panel.removeEventListener("click", handleClick);
    };
  }, [isLoading]); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const friendlyKey = (key) => {
    const names = {
      COMPANY_NAME: "Company Name",
      COMPANY_ADDRESS: "Company Address",
      COMPANY_SIGNATORY_NAME: "Signatory Name",
      COMPANY_SIGNATORY_DESIGNATION: "Signatory Designation",
      FOUNDER_NAME: "Founder Name",
      FOUNDER_ADDRESS: "Founder Address",
      FOUNDER_DESIGNATION: "Founder Designation",
      FOUNDER_SALARY: "Salary Amount",
      FOUNDER_SALARY_WORDS: "Salary in Words",
      NONCOMPETE_PERIOD: "Non-compete Period",
      NOTICE_PERIOD: "Notice Period",
      SEVERANCE_AMOUNT: "Severance Amount",
    };
    return names[key] || key.replace(/_/g, " ").toLowerCase();
  };

  const blankSpan = (key) => {
    const text = friendlyKey(key);
    return `<span class="placeholder-blank" data-key="${key}" title="Click to fill '${text}' in the form"> [${text}] </span>`;
  };

  const getPreview = () => {
    if (isLoading) return ""; 
    if (!template) return "<p>No template loaded.</p>";

    let preview = template;
    const regex = /{{\s*([^}]+)\s*}}/g;

    preview = preview.replace(regex, (match, p1) => {
      const key = placeholderToKey(p1);
      const value = formData[key];
      if (value) {
        return String(value)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      }
      if (key === "EFFECTIVE_DATE" || key === "JURISDICTION_CITY") {
        return formData[key]; 
      }
      return blankSpan(key);
    });

    return preview;
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch("http://localhost:5000/generate", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        document_type: "founders",
        context: formData
      })
      });


      if (!response.ok) {
        throw new Error(`Failed to generate PDF: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Founders_Agreement.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      navigate("/download-complete", { state: { html: getPreview() } });
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Error generating PDF. Check the console for details.");
    } finally {
      setIsDownloading(false);
    }
  };

  const renderField = (key, label, type = "text", placeholder = "") => (
    <div className="mb-3" key={key}>
      <label htmlFor={key} className="form-label fw-semibold">
        {label}
      </label>
      <input
        type={type}
        className="form-control"
        id={key} 
        name={key}
        value={formData[key] || ""}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="container-fluid founders-page-container">
      <style>{`
        .founders-page-container {
          padding-top: 2rem;
          padding-bottom: 2rem;
          background-color: var(--light-bg);
          min-height: calc(100vh - 70px); 
        }
        .form-panel {
          max-height: 85vh;
          overflow-y: auto;
          padding-right: 1rem;
          background-color: var(--white);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-md);
        }
        .form-panel::-webkit-scrollbar {
          width: 8px;
        }
        .form-panel::-webkit-scrollbar-thumb {
          background-color: #ccc;
          border-radius: 4px;
        }
        .form-panel::-webkit-scrollbar-track {
          background-color: #f1f1f1;
        }
        .preview-panel {
          max-height: 85vh;
          overflow-y: auto;
          font-family: var(--font-serif);
          font-size: 1.05rem;
          line-height: 1.6;
          background-color: var(--white);
          border-radius: var(--border-radius);
        }
        .preview-panel .card-body {
            padding: 2.5rem 3rem;
        }
        
        .placeholder-blank {
          font-weight: 600;
          color: var(--accent-blue);
          background-color: #e7f1ff;
          border: 1px dashed var(--accent-blue);
          padding: 0.1em 0.4em;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          font-size: 0.9em;
          font-family: var(--font-sans); 
          display: inline-block;
        }
        .placeholder-blank:hover {
            background-color: #cfe2ff;
            border-style: solid;
        }
        .spinner-container {
            height: 100%;
            min-height: 400px;
        }
        .form-control-highlight {
          border-color: var(--secondary-teal) !important;
          box-shadow: 0 0 0 0.25rem rgba(0, 124, 137, 0.25);
          transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
        }
        .accordion-item {
            border: none;
            margin-bottom: 10px;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-sm);
        }
        .accordion-button {
            background-color: var(--light-bg);
            color: var(--primary-navy);
            font-weight: 600;
            border-bottom: 1px solid #dee2e6;
        }
        .accordion-button:not(.collapsed) {
            color: var(--secondary-teal);
            background-color: #e6f6f7;
            box-shadow: none;
            border-bottom-color: var(--secondary-teal);
        }
      `}</style>

      <div className="row">
        <div className="col-lg-5">
          <div className="card shadow-sm form-panel">
            <div className="card-header bg-white border-0">
              <h3 className="mb-0 text-secondary-teal">Founder's Agreement Details</h3>
            </div>
            <div className="card-body">
              <div className="accordion" id="formSections">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingTwo">
                    <button
                      className="accordion-button" 
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseTwo"
                    >
                      Company Details
                    </button>
                  </h2>
                  <div
                    id="collapseTwo"
                    className="accordion-collapse collapse show" 
                    data-bs-parent="#formSections"
                  >
                    <div className="accordion-body">
                      {renderField(
                        "COMPANY_NAME",
                        "Company Name",
                        "text",
                        "e.g., TechInnovate Pvt. Ltd."
                      )}
                      {renderField(
                        "COMPANY_ADDRESS",
                        "Company Address",
                        "text",
                        "e.g., 123 Tech Park, Saravanampatti"
                      )}
                      {renderField(
                        "COMPANY_SIGNATORY_NAME",
                        "Authorized Signatory Name",
                        "text",
                        "e.g., Jane Doe"
                      )}
                      {renderField(
                        "COMPANY_SIGNATORY_DESIGNATION",
                        "Signatory Designation",
                        "text",
                        "e.g., CEO"
                      )}
                    </div>
                  </div>
                </div>

                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingThree">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseThree"
                    >
                      Founder Details
                    </button>
                  </h2>
                  <div
                    id="collapseThree"
                    className="accordion-collapse collapse"
                    data-bs-parent="#formSections"
                  >
                    <div className="accordion-body">
                      {renderField(
                        "FOUNDER_NAME",
                        "Founder Name",
                        "text",
                        "e.g., Ravi Kumar"
                      )}
                      {renderField(
                        "FOUNDER_ADDRESS",
                        "Founder Address",
                        "text",
                        "e.g., 456 Main St, R.S. Puram"
                      )}
                      {renderField(
                        "FOUNDER_DESIGNATION",
                        "Founder Designation",
                        "text",
                        "e.g., CTO"
                      )}
                      {renderField(
                        "FOUNDER_SALARY",
                        "Salary (₹)",
                        "number",
                        "e.g., 150000"
                      )}
                      {renderField(
                        "FOUNDER_SALARY_WORDS",
                        "Salary in Words",
                        "text",
                        "e.g., One Lakh Fifty Thousand"
                      )}
                    </div>
                  </div>
                </div>

                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingFour">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseFour"
                    >
                      Agreement Terms
                    </button>
                  </h2>
                  <div
                    id="collapseFour"
                    className="accordion-collapse collapse"
                    data-bs-parent="#formSections"
                  >
                    <div className="accordion-body">
                      {renderField(
                        "NONCOMPETE_PERIOD",
                        "Non-Compete (months)",
                        "number",
                        "e.g., 12"
                      )}
                      {renderField(
                        "NOTICE_PERIOD",
                        "Notice Period (days)",
                        "number",
                        "e.g., 30"
                      )}
                      {renderField(
                        "SEVERANCE_AMOUNT",
                        "Severance (months)",
                        "number",
                        "e.g., 1"
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button
                  className="btn btn-primary w-100 py-2"
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  style={{ backgroundColor: 'var(--secondary-teal)', borderColor: 'var(--secondary-teal)' }}
                >
                  {isDownloading ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  ) : (
                    "Generate & Download PDF"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          className="col-lg-7"
          ref={previewPanelRef} 
        >
          <div className="card shadow-sm preview-panel">
            <div className="card-body">
              {isLoading ? (
                <div className="d-flex justify-content-center align-items-center spinner-container">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading Template...</span>
                  </div>
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: getPreview() }} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoundersPage;