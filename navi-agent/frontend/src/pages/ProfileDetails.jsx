import React, { useState, useEffect } from "react";
import "./ProfileDetails.scss";
import { IconCheck, IconArrowLeft } from "./Icons";
import PersonalityGeography from "../components/segmentFields/PersonalityGeography";
import AcademicFields from "../components/segmentFields/AcademicFields";
import JobsCareersFields from "../components/segmentFields/JobsCareersFields";
import NonAcademicCounsellingFields from "../components/segmentFields/NonAcademicCounsellingFields";
import PracticalSkillsFields from "../components/segmentFields/PracticalSkillsFields";

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://127.0.0.1:8001" : "");

export default function ProfileDetails({ profile, onProfileUpdated, onBack }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Pure student signals state — NO destination / future goal / path fields
  const [personalityGeography, setPersonalityGeography] = useState({});
  const [academics, setAcademics] = useState({});
  const [practicalSkills, setPracticalSkills] = useState({});
  const [jobsCareers, setJobsCareers] = useState({});
  const [nonAcademicCounselling, setNonAcademicCounselling] = useState({});

  // Location API states
  const [countriesList, setCountriesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Initialize and synchronize state when profile prop changes
  useEffect(() => {
    if (profile) {
      setPersonalityGeography(
        profile.personalityGeography || {
          name: profile.name || "",
          age: "",
          country: profile.country || "",
          state: profile.state || "",
          city: profile.city || "",
          financialSituation: profile.financialSituation || "",
          scholarshipRequirement: "",
          personalitySignal: profile.personality || "",
          interests: "",
          skills: "",
          preferences: "",
        }
      );

      setAcademics(
        profile.academics || {
          educationStage: "undergraduate",
          degreeType: profile.degreeType || profile.degree_type || "",
          gradeLevel: profile.grade || "",
          curriculum: profile.curriculum || "",
          academicStream: profile.stream || "",
          schoolOrCollege: profile.school || "",
          currentPerformance: profile.performance || "",
        }
      );

      setPracticalSkills(
        profile.practicalSkills || {
          targetSkill: "",
          skillCategory: "",
          skillLevel: "",
          learningMode: "",
          projectType: "",
        }
      );

      setJobsCareers(
        profile.jobsCareers || {
          currentRole: "",
          yearsOfExperience: "",
          industry: "",
          employmentType: "",
        }
      );

      setNonAcademicCounselling(
        profile.nonAcademicCounselling || {
          concernArea: "",
          currentChallenge: "",
          supportTypeNeeded: "",
        }
      );
    }
  }, [profile]);

  const fetchCountries = async () => {
    setLoadingCountries(true);
    try {
      const res = await fetch("https://countriesnow.space/api/v0.1/countries/iso");
      const json = await res.json();
      if (!json.error) {
        const sorted = (json.data || []).sort((a, b) => a.name.localeCompare(b.name));
        setCountriesList(sorted);
      }
    } catch (err) {
      console.error("Failed to fetch countries", err);
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchStates = async (countryName) => {
    setLoadingStates(true);
    try {
      const res = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: countryName }),
      });
      const json = await res.json();
      if (!json.error) {
        const sorted = (json.data?.states || []).sort((a, b) => a.name.localeCompare(b.name));
        setStatesList(sorted);
      } else {
        setStatesList([]);
      }
    } catch (err) {
      console.error("Failed to fetch states", err);
      setStatesList([]);
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchCities = async (countryName, stateName) => {
    setLoadingCities(true);
    try {
      const res = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: countryName, state: stateName }),
      });
      const json = await res.json();
      if (!json.error) {
        const sorted = (json.data || []).sort((a, b) => a.localeCompare(b));
        setCitiesList(sorted);
      } else {
        setCitiesList([]);
      }
    } catch (err) {
      console.error("Failed to fetch cities", err);
      setCitiesList([]);
    } finally {
      setLoadingCities(false);
    }
  };

  useEffect(() => {
    if (isEditing && countriesList.length === 0) {
      fetchCountries();
    }
  }, [isEditing]);

  const currentCountry = personalityGeography.country;
  const currentState = personalityGeography.state;

  useEffect(() => {
    if (isEditing && currentCountry) {
      fetchStates(currentCountry);
    } else {
      setStatesList([]);
      setCitiesList([]);
    }
  }, [currentCountry, isEditing]);

  useEffect(() => {
    if (isEditing && currentCountry && currentState) {
      fetchCities(currentCountry, currentState);
    } else {
      setCitiesList([]);
    }
  }, [currentState, currentCountry, isEditing]);

  const handleCountryChange = (e) => {
    const val = e.target.value;
    setPersonalityGeography((prev) => ({
      ...prev,
      country: val,
      state: "",
      city: "",
    }));
  };

  const handleStateChange = (e) => {
    const val = e.target.value;
    setPersonalityGeography((prev) => ({
      ...prev,
      state: val,
      city: "",
    }));
  };

  const handleCityChange = (e) => {
    const val = e.target.value;
    setPersonalityGeography((prev) => ({
      ...prev,
      city: val,
    }));
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      const email = profile?.email || "";
      if (!email) throw new Error("User email is missing");

      const payload = {
        ...profile,
        email,
        // Pure student signals only — no destination / path fields
        personalityGeography,
        academics,
        practicalSkills,
        jobsCareers,
        nonAcademicCounselling,
        // Sync name from personalityGeography
        name: personalityGeography.name || profile?.name || "",
      };

      const res = await fetch(`${API}/api/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update profile signals");
      const saved = await res.json();

      if (onProfileUpdated) {
        onProfileUpdated(saved);
      }
      if (saved && saved.email) {
        localStorage.setItem(`nv_profile_${saved.email.toLowerCase()}`, JSON.stringify(saved));
      }

      setMessage({ text: "Student signals updated successfully!", type: "success" });
      setIsEditing(false);
    } catch (err) {
      console.error("Save error:", err);
      setMessage({ text: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    const name = personalityGeography?.name || profile?.name || "Student";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase() || "SS";
  };

  return (
    <div className="profile-details-container">
      {/* Header Back Button */}
      <div className="profile-header-nav">
        <button className="nav-back-btn" onClick={onBack}>
          <IconArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      <div className="profile-card-wrapper">
        {/* Hero Banner */}
        <div className="profile-hero-banner">
          <div className="profile-avatar-circle">
            <span className="profile-avatar-initials">{getInitials()}</span>
          </div>
          <div className="profile-hero-info">
            <h2>Student Signals</h2>
            <p className="profile-hero-email">
              Who is this student? Personal, academic, financial, and characteristic information.
            </p>
          </div>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div className={`profile-message-alert ${message.type}`}>
            {message.type === "success" && <IconCheck size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="profile-info-form">
          <div className="profile-form-grid">
            {/* Personal Info + Location + Financial + Characteristics */}
            <PersonalityGeography
              data={personalityGeography}
              onChange={(field, val) =>
                setPersonalityGeography((prev) => ({ ...prev, [field]: val }))
              }
              isEditing={isEditing}
              countriesList={countriesList}
              statesList={statesList}
              citiesList={citiesList}
              loadingCountries={loadingCountries}
              loadingStates={loadingStates}
              loadingCities={loadingCities}
              onCountryChange={handleCountryChange}
              onStateChange={handleStateChange}
              onCityChange={handleCityChange}
            />

            {/* Academic Information — Stage-Adaptive */}
            <AcademicFields
              data={academics}
              onChange={(field, val) => setAcademics((prev) => ({ ...prev, [field]: val }))}
              isEditing={isEditing}
            />

            {/* Practical Skills — optional student context */}
            <PracticalSkillsFields
              data={practicalSkills}
              onChange={(field, val) => setPracticalSkills((prev) => ({ ...prev, [field]: val }))}
              isEditing={isEditing}
            />

            {/* Jobs & Careers — optional student context */}
            <JobsCareersFields
              data={jobsCareers}
              onChange={(field, val) => setJobsCareers((prev) => ({ ...prev, [field]: val }))}
              isEditing={isEditing}
            />

            {/* Non-Academic Counselling — optional student context */}
            <NonAcademicCounsellingFields
              data={nonAcademicCounselling}
              onChange={(field, val) =>
                setNonAcademicCounselling((prev) => ({ ...prev, [field]: val }))
              }
              isEditing={isEditing}
            />
          </div>

          {/* Actions Bar */}
          <div className="profile-form-actions">
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="profile-btn btn-cancel"
                  onClick={() => {
                    if (profile) {
                      setPersonalityGeography(profile.personalityGeography || {});
                      setAcademics(profile.academics || {});
                      setPracticalSkills(profile.practicalSkills || {});
                      setJobsCareers(profile.jobsCareers || {});
                      setNonAcademicCounselling(profile.nonAcademicCounselling || {});
                    }
                    setIsEditing(false);
                    setMessage({ text: "", type: "" });
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="profile-btn btn-save" disabled={saving}>
                  {saving ? "Saving Changes..." : "Save Student Signals"}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="profile-btn btn-edit"
                onClick={() => setIsEditing(true)}
              >
                Edit Student Signals
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
