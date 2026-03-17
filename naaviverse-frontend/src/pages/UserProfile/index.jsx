import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useStore } from "../../components/store/store.ts";
import Dashsidebar from "../../components/dashsidebar/dashsidebar";
import MenuNav from "../../components/MenuNav/index.jsx";
import { LoadingAnimation1 } from "../../components/LoadingAnimation1";
import LevelOneModal from "./LevelOneModal";
import LevelTwoModal from "./LevelTwoModal";
import LevelThreeModal from "./LevelThreeModal";
import downArrow from "../../images/downArrow.svg";
import upArrow from "../../images/upArrow.svg";
import lg1 from "../../static/images/login/lg1.svg";
import "./UserProfile.css";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const UserProfile = () => {
  const navigate = useNavigate();
  const { setsideNav } = useStore();
  
  // Profile data state
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openBox, setOpenBox] = useState(null); // '1', '2', '3', or null
  
  // Modal states
  const [showLevelOneModal, setShowLevelOneModal] = useState(false);
  const [showLevelTwoModal, setShowLevelTwoModal] = useState(false);
  const [showLevelThreeModal, setShowLevelThreeModal] = useState(false);
  
  // User details
  const [userDetails, setUserDetails] = useState(null);
  const [profileDataId, setProfileDataId] = useState(null);

  useEffect(() => {
    setsideNav("");
    const user = getUserFromStorage();
    setUserDetails(user);
  }, []);

  useEffect(() => {
    if (userDetails?.email) {
      fetchProfileData();
    }
  }, [userDetails]);

  const getUserFromStorage = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error("Invalid user in storage", e);
      return null;
    }
  };

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/users/get/${userDetails.email}`);
      const result = response.data;
      
      if (result?.status && result?.data) {
        const profile = result.data;
        setProfileData(profile);
        setProfileDataId(profile._id);
      } else {
        setProfileData(null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfileData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelStatus = (level) => {
    if (!profileData) return "locked";
    const userLevel = profileData.user_level || 0;
    
    if (userLevel >= level) return "completed";
    if (userLevel === level - 1) return "active";
    return "locked";
  };

  const handleBoxClick = (level) => {
    // Only allow opening if level is accessible
    const status = getLevelStatus(level);
    if (status !== "locked") {
      setOpenBox(openBox === level ? null : level);
    }
  };

  const handleCompleteLevel = (level) => {
    if (level === 1) setShowLevelOneModal(true);
    if (level === 2) setShowLevelTwoModal(true);
    if (level === 3) setShowLevelThreeModal(true);
  };

  const handleLevelComplete = async (level) => {
    // Close modal
    if (level === 1) setShowLevelOneModal(false);
    if (level === 2) setShowLevelTwoModal(false);
    if (level === 3) setShowLevelThreeModal(false);
    
    // Refresh profile data
    await fetchProfileData();
    
    // Show success message
    toast.success(`Level ${level} completed successfully!`);
  };

  // Format data for display
  const formatValue = (value) => {
    if (!value || value === "") return "—";
    return value;
  };

  if (isLoading) {
    return (
      <div className="dashboard-main">
        <div className="dashboard-body">
          <Dashsidebar />
          <div className="dashboard-screens">
            <MenuNav searchPlaceholder="Search..." />
            <div className="loading-container">
              <LoadingAnimation1 icon={lg1} width={200} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no profile exists, show create profile button
  if (!profileData) {
    return (
      <div className="dashboard-main">
        <div className="dashboard-body">
          <Dashsidebar />
          <div className="dashboard-screens">
            <MenuNav searchPlaceholder="Search..." />
            <div className="no-profile-container">
              <div className="create-profile-card">
                <h2>Welcome to Naavi!</h2>
                <p>Complete your profile to get started</p>
                <button 
                  className="create-profile-btn"
                  onClick={() => setShowLevelOneModal(true)}
                >
                  Create Your Profile
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Show Level 1 modal for profile creation */}
        {showLevelOneModal && (
          <LevelOneModal
            onClose={() => setShowLevelOneModal(false)}
            onComplete={() => handleLevelComplete(1)}
            userDetails={userDetails}
          />
        )}
        
        <ToastContainer />
      </div>
    );
  }

  const userLevel = profileData.user_level || 0;

  return (
    <div className="dashboard-main">
      <div className="dashboard-body">
        <Dashsidebar />
        
        <div className="dashboard-screens">
          <MenuNav searchPlaceholder="Search..." />
          
          <div className="profile-container">
            <div className="profile-main">
              
              {/* Level 1 Box */}
              <div className={`profile-box level-1 ${getLevelStatus(1)} ${openBox === '1' ? 'expanded' : ''}`}>
                <div 
                  className="profile-box-header"
                  onClick={() => handleBoxClick('1')}
                >
                  <div className="box-header-left">
                    <span className="level-badge">L1</span>
                    <div>
                      <h3>Naavi Profile — Level 1</h3>
                      <p className="box-subtitle">Basic Info & Contact Details</p>
                    </div>
                  </div>
                  <div className="box-header-right">
                    <span className={`status-badge ${getLevelStatus(1)}`}>
                      {getLevelStatus(1) === 'completed' ? '✓ Completed' : 
                       getLevelStatus(1) === 'active' ? 'In Progress' : '🔒 Locked'}
                    </span>
                    {getLevelStatus(1) !== 'locked' && (
                      <img 
                        src={openBox === '1' ? upArrow : downArrow} 
                        alt="toggle" 
                        className="dropdown-arrow"
                      />
                    )}
                  </div>
                </div>
                
                {/* Dropdown Content */}
                {openBox === '1' && (
                  <div className="profile-box-content">
                    <div className="info-grid">
                      <div className="info-item full-width">
                        <label>Profile Picture</label>
                        <div className="profile-pic-display">
                          {profileData.profilePicture ? (
                            <img src={profileData.profilePicture} alt="Profile" />
                          ) : (
                            <div className="profile-pic-placeholder">
                              {profileData.name?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="info-item">
                        <label>Email</label>
                        <p>{formatValue(profileData.email)}</p>
                      </div>
                      <div className="info-item">
                        <label>Name</label>
                        <p>{formatValue(profileData.name)}</p>
                      </div>
                      <div className="info-item">
                        <label>Username</label>
                        <p>{formatValue(profileData.username)}</p>
                      </div>
                      <div className="info-item">
                        <label>User Type</label>
                        <p>{formatValue(profileData.userType)}</p>
                      </div>
                      <div className="info-item">
                        <label>Country</label>
                        <p>{formatValue(profileData.country)}</p>
                      </div>
                      <div className="info-item">
                        <label>State</label>
                        <p>{formatValue(profileData.state)}</p>
                      </div>
                      <div className="info-item">
                        <label>City</label>
                        <p>{formatValue(profileData.city)}</p>
                      </div>
                      <div className="info-item">
                        <label>Postal Code</label>
                        <p>{formatValue(profileData.postalCode)}</p>
                      </div>
                      <div className="info-item">
                        <label>Phone Number</label>
                        <p>{formatValue(profileData.phoneNumber)}</p>
                      </div>
                      <div className="info-item">
                        <label>Status</label>
                        <p>{formatValue(profileData.status)}</p>
                      </div>
                    </div>
                    
                    {getLevelStatus(1) === 'active' && (
                      <button 
                        className="complete-level-btn"
                        onClick={() => handleCompleteLevel(1)}
                      >
                        Complete Level 1
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {/* Level 2 Box */}
              <div className={`profile-box level-2 ${getLevelStatus(2)} ${openBox === '2' ? 'expanded' : ''}`}>
                <div 
                  className="profile-box-header"
                  onClick={() => handleBoxClick('2')}
                >
                  <div className="box-header-left">
                    <span className="level-badge">L2</span>
                    <div>
                      <h3>Naavi Profile — Level 2</h3>
                      <p className="box-subtitle">Academic & Financial Information</p>
                    </div>
                  </div>
                  <div className="box-header-right">
                    <span className={`status-badge ${getLevelStatus(2)}`}>
                      {getLevelStatus(2) === 'completed' ? '✓ Completed' : 
                       getLevelStatus(2) === 'active' ? 'In Progress' : '🔒 Locked'}
                    </span>
                    {getLevelStatus(2) !== 'locked' && (
                      <img 
                        src={openBox === '2' ? upArrow : downArrow} 
                        alt="toggle" 
                        className="dropdown-arrow"
                      />
                    )}
                  </div>
                </div>
                
                {/* Dropdown Content */}
                {openBox === '2' && (
                  <div className="profile-box-content">
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Grade</label>
                        <p>{formatValue(profileData.grade)}</p>
                      </div>
                      <div className="info-item">
                        <label>School</label>
                        <p>{formatValue(profileData.school)}</p>
                      </div>
                      <div className="info-item">
                        <label>Curriculum</label>
                        <p>{formatValue(profileData.curriculum)}</p>
                      </div>
                      <div className="info-item">
                        <label>Stream</label>
                        <p>{formatValue(profileData.stream)}</p>
                      </div>
                      <div className="info-item">
                        <label>Financial Situation</label>
                        <p>{formatValue(profileData.financialSituation)}</p>
                      </div>
                      <div className="info-item">
                        <label>Performance</label>
                        <p>{formatValue(profileData.performance)}</p>
                      </div>
                      <div className="info-item full-width">
                        <label>LinkedIn</label>
                        <p className="linkedin-link">{formatValue(profileData.linkedin)}</p>
                      </div>
                    </div>
                    
                    {getLevelStatus(2) === 'active' && (
                      <button 
                        className="complete-level-btn"
                        onClick={() => handleCompleteLevel(2)}
                      >
                        Complete Level 2
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {/* Level 3 Box */}
              <div className={`profile-box level-3 ${getLevelStatus(3)} ${openBox === '3' ? 'expanded' : ''}`}>
                <div 
                  className="profile-box-header"
                  onClick={() => handleBoxClick('3')}
                >
                  <div className="box-header-left">
                    <span className="level-badge">L3</span>
                    <div>
                      <h3>Naavi Profile — Level 3</h3>
                      <p className="box-subtitle">Personality & Interests</p>
                    </div>
                  </div>
                  <div className="box-header-right">
                    <span className={`status-badge ${getLevelStatus(3)}`}>
                      {getLevelStatus(3) === 'completed' ? '✓ Completed' : 
                       getLevelStatus(3) === 'active' ? 'In Progress' : '🔒 Locked'}
                    </span>
                    {getLevelStatus(3) !== 'locked' && (
                      <img 
                        src={openBox === '3' ? upArrow : downArrow} 
                        alt="toggle" 
                        className="dropdown-arrow"
                      />
                    )}
                  </div>
                </div>
                
                {/* Dropdown Content */}
                {openBox === '3' && (
                  <div className="profile-box-content">
                    <div className="info-grid">
                      <div className="info-item full-width">
                        <label>Personality Type</label>
                        <p>{formatValue(profileData.personality)}</p>
                      </div>
                    </div>
                    
                    {getLevelStatus(3) === 'active' && (
                      <button 
                        className="complete-level-btn"
                        onClick={() => handleCompleteLevel(3)}
                      >
                        Complete Level 3
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals for completing levels */}
      {showLevelOneModal && (
        <LevelOneModal
          onClose={() => setShowLevelOneModal(false)}
          onComplete={() => handleLevelComplete(1)}
          userDetails={userDetails}
          existingData={profileData}
        />
      )}
      
      {showLevelTwoModal && (
        <LevelTwoModal
          onClose={() => setShowLevelTwoModal(false)}
          onComplete={() => handleLevelComplete(2)}
          profileDataId={profileDataId}
          existingData={profileData}
        />
      )}
      
      {showLevelThreeModal && (
        <LevelThreeModal
          onClose={() => setShowLevelThreeModal(false)}
          onComplete={() => handleLevelComplete(3)}
          profileDataId={profileDataId}
          existingData={profileData}
        />
      )}
      
      <ToastContainer />
    </div>
  );
};

export default UserProfile;