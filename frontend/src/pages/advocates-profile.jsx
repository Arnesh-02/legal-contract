import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { advocates } from "../components/advocates";
import { PhoneCall } from "lucide-react";

export default function AdvocateProfile() {
  const { id } = useParams();
  const advocate = advocates.find((a) => a.id === Number(id));

  const [date, setDate] = useState("");
  const [success, setSuccess] = useState(false);

  if (!advocate) return <h2>Advocate not found</h2>;

  const handleBooking = () => {
    if (!date) {
      alert("Please choose a preferred date!");
      return;
    }
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <>
      {/* 🚀 NEW POP-UP NOTIFICATION CONTAINER */}
      {success && (
        <div className="notification-container">
          <p className="success-msg-popup">
            ✅ Consultation Booked Successfully!
          </p>
        </div>
      )}

      <div className="profile-wrapper">
        <div className="profile-card">
          <img src={advocate.photo} className="profile-img" />

          <div className="profile-info">
            <h2>{advocate.name}</h2>
            <p className="profile-spec">{advocate.specialization}</p>

            {/* Displaying both Summary and Description (as per previous step) */}
            <p className="profile-summary">{advocate.summary}</p> 
            <p className="profile-desc">{advocate.description}</p>

            <p><strong>Experience:</strong> {advocate.experience}</p>
            <p><strong>Rating:</strong> ⭐ {advocate.rating} ({advocate.reviews})</p>
            <p className="adv-price"><strong>Consultation:</strong> {advocate.price}</p>

            <div className="booking-box">
              <label>Select preferred date:</label>
              <input
                type="date"
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} 
              />

              <button className="book-btn" onClick={handleBooking}>
                <PhoneCall size={18} /> Book a Call
              </button>
              
              {/* REMOVED: The old success message is gone from here */}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
