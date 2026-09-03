import {
  IconBook,
  IconBrain,
  IconBuilding,
  IconGlobe,
  IconMap,
  IconPackage,
  IconPin,
  IconRoute,
  IconTarget,
  IconUser,
} from "./Icons";

function readProfile() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return Object.keys(user).length > 0 ? user : null;
  } catch {
    return null;
  }
}

function value(profile, key) {
  return profile?.[key]?.trim?.() || profile?.[key] || "Not available";
}

function nestedValue(profile, section, key) {
  const sectionData = profile?.[section] || {};
  return sectionData?.[key]?.trim?.() || sectionData?.[key] || "Not available";
}

function ProfileField({ Icon, label, value }) {
  return (
    <div className="profile-view-field">
      <div className="profile-view-icon"><Icon size={18} /></div>
      <div>
        <div className="profile-view-label">{label}</div>
        <div className="profile-view-value">{value}</div>
      </div>
    </div>
  );
}

export default function ProfileSummary({ profile }) {
  const data = profile || readProfile();

  // Pull from structured student signals, falling back to legacy flat fields
  const pg = data?.personalityGeography || {};
  const ac = data?.academics || {};

  const studentName = pg.name || data?.name || "Not available";
  const country = pg.country || data?.country || "Not available";
  const state = pg.state || data?.state || "Not available";
  const city = pg.city || data?.city || "Not available";
  const financialSituation = pg.financialSituation || data?.financialSituation || "Not available";
  const personalitySignal = pg.personalitySignal || data?.personality || "Not available";

  const educationStage = ac.educationStage || "undergraduate";
  const gradeLevel = ac.gradeLevel || data?.grade || "Not available";
  const curriculum = ac.curriculum || data?.curriculum || "Not available";
  const degreeType = ac.degreeType || data?.degreeType || data?.degree_type || "Not available";
  const academicStream = ac.academicStream || data?.stream || "Not available";
  const schoolOrCollege = ac.schoolOrCollege || ac.schoolName || data?.school || "Not available";
  const performance = ac.currentPerformance || data?.performance || "Not available";

  const fields = [
    { Icon: IconUser, label: "Name", value: studentName },
    { Icon: IconGlobe, label: "Country", value: country },
    { Icon: IconMap, label: "State", value: state },
    { Icon: IconPin, label: "City", value: city },
    { Icon: IconBook, label: "Education Stage", value: educationStage === "school" ? "School Student" : educationStage === "postgraduate" ? "Postgraduate Student" : "Undergraduate Student" },
    { Icon: IconBook, label: educationStage === "school" ? "Grade" : "Degree Type", value: educationStage === "school" ? gradeLevel : degreeType },
    { Icon: IconBook, label: "Curriculum", value: curriculum },
    { Icon: IconRoute, label: "Stream / Major", value: academicStream },
    { Icon: IconBuilding, label: educationStage === "school" ? "School" : "College / University", value: schoolOrCollege },
    { Icon: IconTarget, label: "Performance", value: performance },
    { Icon: IconPackage, label: "Financial Situation", value: financialSituation },
    { Icon: IconBrain, label: "Personality Signal", value: personalitySignal },
  ];

  return (
    <div className="page profile-view-page">
      <div className="profile-view-header">
        <div>
          <div className="pill pill-teal">Student Signals Summary</div>
          <h1 className="display-title" style={{ marginTop: 14, fontSize: "28px", fontWeight: "500" }}>
            Student Profile
          </h1>
          <p className="profile-view-sub">
            These student signals describe who the student is — personal, academic, financial, and characteristic information.
          </p>
        </div>
        <div className="profile-view-avatar">
          {(studentName || "N").slice(0, 1).toUpperCase()}
        </div>
      </div>

      {!data ? (
        <div className="card profile-empty">
          <IconUser size={34} />
          <div>
            <h2>No saved profile found</h2>
            <p>Your onboarding profile data was not found in this browser.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="card profile-overview-card">
            <div>
              <div className="section-label">Student Location</div>
              <h2 style={{ fontSize: "20px", fontWeight: "500", margin: "8px 0 0 0" }}>
                {[city, state, country].filter(v => v && v !== "Not available").join(", ") || "Location unavailable"}
              </h2>
            </div>
            <div className="profile-location-pill">
              <IconPin size={16} />
              {[city, state, country].filter(v => v && v !== "Not available").join(", ") || "Location unavailable"}
            </div>
          </div>

          <div className="profile-view-grid">
            {fields.map(item => (
              <ProfileField key={item.label} {...item} />
            ))}
          </div>
        </>
      )}

      <style>{`
        .profile-view-page {
          max-width: 980px;
        }
        .profile-view-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 24px;
        }
        .profile-view-sub {
          max-width: 560px;
          margin-top: 12px;
          color: var(--text2);
          line-height: 1.7;
          font-size: 15px;
        }
        .profile-view-avatar {
          width: 56px;
          height: 56px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          background: linear-gradient(135deg, var(--accent), var(--blue));
          font-family: var(--font-display);
          font-size: 26px;
          flex-shrink: 0;
          box-shadow: var(--shadow-md);
        }
        .profile-overview-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
          border-color: rgba(43, 174, 142, 0.22);
          background: linear-gradient(135deg, #fff, rgba(214, 242, 236, 0.55));
        }
        .profile-overview-card h2 {
          margin: 8px 0 0 0;
          font-size: 20px;
          font-weight: 500;
          color: var(--text);
          font-family: var(--font-display);
        }
        .profile-location-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 12px;
          border-radius: 999px;
          background: #fff;
          border: 1px solid var(--border);
          color: var(--text2);
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }
        .profile-view-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }
        .profile-view-field {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 18px;
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: var(--shadow);
        }
        .profile-view-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          color: var(--accent2);
          background: var(--accent-soft);
          flex-shrink: 0;
        }
        .profile-view-label {
          margin-bottom: 4px;
          font-size: 11px;
          color: var(--text3);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 700;
        }
        .profile-view-value {
          color: var(--text);
          font-size: 14px;
          line-height: 1.5;
          font-weight: 500;
        }
        .profile-empty {
          display: flex;
          align-items: center;
          gap: 16px;
          color: var(--text2);
        }
        .profile-empty svg {
          color: var(--accent);
          flex-shrink: 0;
        }
        .profile-empty h2 {
          margin-bottom: 4px;
          color: var(--text);
          font-size: 18px;
          font-weight: 500;
        }
        .profile-empty p {
          color: var(--text2);
          font-size: 14px;
        }

        @media (max-width: 720px) {
          .profile-view-header,
          .profile-overview-card {
            flex-direction: column;
            align-items: flex-start;
          }
          .profile-view-grid {
            grid-template-columns: 1fr;
          }
          .profile-location-pill {
            white-space: normal;
          }
        }
      `}</style>
    </div>
  );
}
