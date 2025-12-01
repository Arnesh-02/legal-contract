import React, { useState } from "react";
import { Search } from "lucide-react";
import { advocates } from "../components/advocates";
import { useNavigate } from "react-router-dom";

export default function AdvocatesPage() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState({
    specialization: "",
    minRating: "",
    minExperience: "",
  });

  const specializations = [...new Set(advocates.map(a => a.specialization))];

  const filteredAdvocates = advocates.filter(a => {
    const matchesSearch =
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.specialization.toLowerCase().includes(query.toLowerCase());

    const matchesSpecialization =
      !filter.specialization || a.specialization === filter.specialization;

    const matchesRating =
      !filter.minRating || a.rating >= Number(filter.minRating);

    const matchesExperience =
      !filter.minExperience ||
      Number(a.experience.split(" ")[0]) >= Number(filter.minExperience);

    return matchesSearch && matchesSpecialization && matchesRating && matchesExperience;
  });

  return (
    <div className="advocates-wrapper">
      
      <h2 className="adv-title">Find an Advocate</h2>
      <p className="adv-sub">Search and connect with top legal professionals</p>

      {/* 🔍 Search Bar */}
      <div className="adv-search-box">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Search by name or specialization..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* 🎛 Filters */}
      <div className="adv-filters">
        <select
          onChange={(e) =>
            setFilter((f) => ({ ...f, specialization: e.target.value }))
          }
        >
          <option value="">All Specializations</option>
          {specializations.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select
          onChange={(e) =>
            setFilter((f) => ({ ...f, minRating: e.target.value }))
          }
        >
          <option value="">Rating (Any)</option>
          <option value="4.5">4.5+</option>
          <option value="4.8">4.8+</option>
        </select>

        <select
          onChange={(e) =>
            setFilter((f) => ({ ...f, minExperience: e.target.value }))
          }
        >
          <option value="">Experience</option>
          <option value="3">3+ yrs</option>
          <option value="5">5+ yrs</option>
          <option value="7">7+ yrs</option>
        </select>
      </div>

      {/* Advocate Grid */}
      <div className="adv-grid">
        {filteredAdvocates.map((adv) => (
          <div
            key={adv.id}
            className="adv-card"
            onClick={() => navigate(`/advocates/${adv.id}`)}
          >
            <img src={adv.photo} alt={adv.name} className="adv-img" />

            <div className="adv-details">
              <h3>{adv.name}</h3>
              <p className="adv-special">{adv.specialization}</p>

              <div className="adv-rating">
                ⭐ {adv.rating} <span className="reviews">({adv.reviews})</span>
              </div>

              <p className="adv-price">{adv.price}</p>
            </div>
          </div>
        ))}
      </div>

      {filteredAdvocates.length === 0 && (
        <p className="no-results">No advocates found. Try different filters.</p>
      )}
    </div>
  );
}
