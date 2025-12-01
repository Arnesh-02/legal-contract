import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function NDAPage() {
  const navigate = useNavigate();
  const previewPanelRef = useRef(null); 

  const today = new Date();
  const isoToday = today.toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    EFFECTIVE_DATE: isoToday,
    EFFECTIVE_DAY: today.getDate(),
    EFFECTIVE_MONTH: today.toLocaleString("en-US", { month: "long" }),
    EFFECTIVE_YEAR: today.getFullYear(),

    PARTY_1_NAME: "",
    PARTY_1_ADDRESS: "",
    PARTY_1_SHORT_NAME: "",
    PARTY_2_NAME: "",
    PARTY_2_ADDRESS: "",
    PROPOSED_TRANSACTION: "",
    PARTY_1_SIGNATORY_NAME: "",
    PARTY_1_SIGNATORY_DESIGNATION: "",
    PARTY_1_SIGN_PLACE: "",
    PARTY_2_SIGNATORY_NAME: "",
    PARTY_2_SIGNATORY_DESIGNATION: "",
    PARTY_2_SIGN_PLACE: "",
    PARTY_1_SIGNATURE: null,
    PARTY_2_SIGNATURE: null,
  });

  const [template, setTemplate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false); 

  const ALIASES = {
    "effective.date": "EFFECTIVE_DATE",
    "effective.day": "EFFECTIVE_DAY",
    "effective.month": "EFFECTIVE_MONTH",
    "effective.year": "EFFECTIVE_YEAR",
    "party.1.name": "PARTY_1_NAME",
    "party.1.address": "PARTY_1_ADDRESS",
    "party.1.short.name": "PARTY_1_SHORT_NAME",
    "party.1.signatory.name": "PARTY_1_SIGNATORY_NAME",
    "party.1.signatory.designation": "PARTY_1_SIGNATORY_DESIGNATION",
    "party.1.sign.place": "PARTY_1_SIGN_PLACE",
    "party.1.signature": "PARTY_1_SIGNATURE",
    "party.2.name": "PARTY_2_NAME",
    "party.2.address": "PARTY_2_ADDRESS",
    "party.2.signatory.name": "PARTY_2_SIGNATORY_NAME",
    "party.2.signatory.designation": "PARTY_2_SIGNATORY_DESIGNATION",
    "party.2.sign.place": "PARTY_2_SIGN_PLACE",
    "party.2.signature": "PARTY_2_SIGNATURE",
    "proposed.transaction": "PROPOSED_TRANSACTION",
  };

  const placeholderToKey = (ph) => {
    const clean = String(ph || "").trim();

    const hasKey = formData && Object.prototype.hasOwnProperty.call(formData, clean);
    if (hasKey) {
      return clean;
    }

    const alias = ALIASES[clean.toLowerCase()];
    if (alias) return alias;

    return clean.replace(/[^a-zA-Z0-9]+/g, "_").toUpperCase();
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/get-template/nda`)
      .then((res) => res.text())
      .then((text) => {
        setTemplate(text);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching template:", err);
        setTemplate(
          "<p class='text-danger'>Error loading template. Please check backend.</p>"
        );
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const panel = previewPanelRef.current;
    if (!panel || isLoading) return;

    const handleMouseOver = (e) => {
      const target = e.target;
      if (target.classList.contains("placeholder-blank") || target.classList.contains("placeholder-blank-file")) {
        const key = target.dataset.key;
        if (key) {
          const targetKey = key.replace('_UPLOAD', ''); 
          const inputEl = document.getElementById(targetKey);
          if (inputEl) {
            inputEl.classList.add("form-control-highlight");
          }
        }
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target;
      if (target.classList.contains("placeholder-blank") || target.classList.contains("placeholder-blank-file")) {
        const key = target.dataset.key;
        if (key) {
          const targetKey = key.replace('_UPLOAD', '');
          const inputEl = document.getElementById(targetKey);
          if (inputEl) {
            inputEl.classList.remove("form-control-highlight");
          }
        }
      }
    };

    const handleClick = (e) => {
      const target = e.target;
      if (target.classList.contains("placeholder-blank") || target.classList.contains("placeholder-blank-file")) {
        e.preventDefault();
        const key = target.dataset.key;
        if (key) {
            const targetKey = key.replace('_UPLOAD', '');
            const inputEl = document.getElementById(targetKey);
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

    if (name === "EFFECTIVE_DATE") {
      const date = new Date(value);
      setFormData((prev) => ({
        ...prev,
        EFFECTIVE_DATE: value,
        EFFECTIVE_DAY: date.getDate(),
        EFFECTIVE_MONTH: date.toLocaleString("en-US", { month: "long" }),
        EFFECTIVE_YEAR: date.getFullYear(),
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSignatureUpload = (e, party) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () =>
      setFormData((prev) => ({ ...prev, [party]: reader.result }));
    reader.readAsDataURL(file);
  };

  const friendlyKey = (key) => {
    const names = {
      EFFECTIVE_DATE: "Effective Date",
      EFFECTIVE_DAY: "Day",
      EFFECTIVE_MONTH: "Month",
      EFFECTIVE_YEAR: "Year",
      PARTY_1_NAME: "Party 1 Name",
      PARTY_1_ADDRESS: "Party 1 Address",
      PARTY_1_SHORT_NAME: "Party 1 Short Name",
      PARTY_1_SIGNATORY_NAME: "Party 1 Signatory",
      PARTY_1_SIGNATORY_DESIGNATION: "Party 1 Designation",
      PARTY_1_SIGN_PLACE: "Party 1 Sign Place",
      PARTY_2_NAME: "Party 2 Name",
      PARTY_2_ADDRESS: "Party 2 Address",
      PARTY_2_SIGNATORY_NAME: "Party 2 Signatory",
      PARTY_2_SIGNATORY_DESIGNATION: "Party 2 Designation",
      PARTY_2_SIGN_PLACE: "Party 2 Sign Place",
      PROPOSED_TRANSACTION: "Proposed Transaction",
    };
    return names[key] || key.replace(/_/g, " ").toLowerCase();
  };

  const blankSpan = (key) => {
    if (
      key === "EFFECTIVE_DAY" ||
      key === "EFFECTIVE_MONTH" ||
      key === "EFFECTIVE_YEAR"
    ) {
      return formData[key] || "____"; 
    }
    if (key.includes("SIGNATURE")) {
      return `<span class="placeholder-blank-file" data-key="${key}_UPLOAD" title="Upload a signature file"> [Upload Signature] </span>`;
    }

    const text = friendlyKey(key);
    return `<span class="placeholder-blank" data-key="${key}" title="Click to fill '${text}' in the form"> [${text}] </span>`;
  };

  const getPreview = () => {
    if (isLoading) return ""; 
    if (!template) return "<p>No template loaded.</p>";

    let preview = template;
    const regex = /{{\s*([^}]+)\s*}}/g;

    preview = preview.replace(regex, (match, p1) => {
      const key = placeholderToKey(p1.trim());
      const value = formData[key];

      if (key.includes("SIGNATURE") && value) {
        return `<img src="${value}" class="signature-image" alt="Signature" />`;
      }

      if (value) {
        return String(value)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      }

      return blankSpan(key);
    });

    return preview;
  };

  const handleDownloadPDF = async () => {
  setIsDownloading(true);
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/generate`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        document_type: "nda",
        context: formData,
      }),
    });

    if (!response.ok) {
      const errData = await response.text();
      console.error("Server error:", errData);
      throw new Error(`Failed to generate PDF: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "NDA_Agreement.pdf";
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


  const renderField = (
    key,
    label,
    type = "text",
    placeholder = "",
    options = []
  ) => {
    if (type === "select") {
      return (
        <div className="mb-3" key={key}>
          <label htmlFor={key} className="form-label fw-semibold">
            {label}
          </label>
          <select
            id={key}
            name={key}
            value={formData[key]}
            onChange={handleChange}
            className="form-select"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
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
  };

  const renderFileUpload = (key, label, partyKey) => (
    <div className="mb-3" key={key}>
      <label htmlFor={key} className="form-label fw-semibold">
        {label}
      </label>
      <input
        type="file"
        className="form-control"
        id={key} 
        accept="image/*"
        onChange={(e) => handleSignatureUpload(e, partyKey)}
      />
      {formData[partyKey] && <img src={formData[partyKey]} alt="Signature Preview" className="signature-preview" />}
    </div>
  );

  const transactionOptions = [
    { value: "", label: "Select..." },
    { value: "Merger or Acquisition", label: "Merger or Acquisition" },
    { value: "Strategic Partnership", label: "Strategic Partnership" },
    { value: "Software Licensing", label: "Software Licensing" },
    { value: "Investment Review", label: "Investment Review" },
    { value: "Vendor/Supplier Agreement", label: "Vendor/Supplier Agreement" },
    { value: "Employment/Contractor", label: "Employment/Contractor" },
    { value: "Other", label: "Other" },
  ];

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
        
        /* Interactive Styles */
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
        .placeholder-blank-file {
          font-weight: 600;
          color: #8c5d33; /* Earthy brown/gold for signatures */
          background-color: #fff8e1;
          border: 1px dashed #8c5d33;
          padding: 0.1em 0.4em;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          font-size: 0.9em;
          font-family: var(--font-sans);
          display: inline-block;
        }
        .placeholder-blank-file:hover {
          background-color: #ffecc6;
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
        .signature-image {
          max-width: 200px;
          max-height: 80px;
          margin-top: 10px;
          border-bottom: 1px dashed #aaa;
          padding-bottom: 5px;
          display: block;
        }
        .signature-preview {
            max-width: 150px;
            max-height: 60px;
            margin-top: 10px;
            display: block;
            border: 1px solid #ddd;
            padding: 5px;
            border-radius: 4px;
        }
      `}</style>

      <div className="row">
        <div className="col-lg-5">
          <div className="card shadow-sm form-panel">
            <div className="card-header bg-white border-0">
              <h3 className="mb-0 text-secondary-teal">NDA Agreement Details</h3>
            </div>
            <div className="card-body">
              <div className="accordion" id="formSections">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingOne">
                    <button
                      className="accordion-button"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseOne"
                    >
                      Agreement & Terms
                    </button>
                  </h2>
                  <div
                    id="collapseOne"
                    className="accordion-collapse collapse show"
                    data-bs-parent="#formSections"
                  >
                    <div className="accordion-body">
                      {renderField("EFFECTIVE_DATE", "Effective Date", "date")}
                      {renderField(
                        "PROPOSED_TRANSACTION",
                        "Proposed Transaction",
                        "select",
                        "",
                        transactionOptions
                      )}
                    </div>
                  </div>
                </div>

                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingTwo">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseTwo"
                    >
                      Party 1 Details (Disclosing Party)
                    </button>
                  </h2>
                  <div
                    id="collapseTwo"
                    className="accordion-collapse collapse"
                    data-bs-parent="#formSections"
                  >
                    <div className="accordion-body">
                      {renderField(
                        "PARTY_1_NAME",
                        "Party 1 Name",
                        "text",
                        "e.g., Your Company Inc."
                      )}
                      {renderField(
                        "PARTY_1_ADDRESS",
                        "Party 1 Address",
                        "text",
                        "e.g., 123 Main St, Coimbatore"
                      )}
                      {renderField(
                        "PARTY_1_SHORT_NAME",
                        "Short Reference Name (e.g., Discloser)",
                        "text",
                        "e.g., Discloser"
                      )}
                      {renderField(
                        "PARTY_1_SIGNATORY_NAME",
                        "Signatory Name",
                        "text",
                        "e.g., John Doe"
                      )}
                      {renderField(
                        "PARTY_1_SIGNATORY_DESIGNATION",
                        "Signatory Designation",
                        "text",
                        "e.g., CEO"
                      )}
                      {renderField(
                        "PARTY_1_SIGN_PLACE",
                        "Place of Signing",
                        "text",
                        "e.g., Coimbatore"
                      )}
                      {renderFileUpload(
                        "PARTY_1_SIGNATURE_UPLOAD", 
                        "Party 1 Signature Upload",
                        "PARTY_1_SIGNATURE" 
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
                      Party 2 Details (Receiving Party)
                    </button>
                  </h2>
                  <div
                    id="collapseThree"
                    className="accordion-collapse collapse"
                    data-bs-parent="#formSections"
                  >
                    <div className="accordion-body">
                      {renderField(
                        "PARTY_2_NAME",
                        "Party 2 Name",
                        "text",
                        "e.g., Other Company LLC"
                      )}
                      {renderField(
                        "PARTY_2_ADDRESS",
                        "Party 2 Address",
                        "text",
                        "e.g., 456 Business Ave, Bangalore"
                      )}
                      {renderField(
                        "PARTY_2_SIGNATORY_NAME",
                        "Signatory Name",
                        "text",
                        "e.g., Jane Smith"
                      )}
                      {renderField(
                        "PARTY_2_SIGNATORY_DESIGNATION",
                        "Signatory Designation",
                        "text",
                        "e.g., Founder"
                      )}
                      {renderField(
                        "PARTY_2_SIGN_PLACE",
                        "Place of Signing",
                        "text",
                        "e.g., Bangalore"
                      )}
                      {renderFileUpload(
                        "PARTY_2_SIGNATURE_UPLOAD", 
                        "Party 2 Signature Upload",
                        "PARTY_2_SIGNATURE" 
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

        <div className="col-lg-7" ref={previewPanelRef}>
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

export default NDAPage;