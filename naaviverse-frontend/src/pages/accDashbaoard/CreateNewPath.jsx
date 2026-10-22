import React, { useState, useEffect, useRef, useMemo } from 'react';
import './CreateNewPath.scss';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SvgArrowUp } from "../../utils/SvgIcons";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const CustomSelect = ({
  placeholder = 'Select',
  value,
  onChange,
  options = [],
  disabled = false,
  disabledPlaceholder = '',
  searchable = false,
  maxHeight = 220,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const normalizedOptions = (options || []).map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      const lbl = opt.name?.common || opt.name || opt.label || String(opt.value ?? '');
      const val = opt.name?.common || opt.name || opt.value || '';
      return { label: lbl, value: val };
    }
    return { label: String(opt), value: opt };
  });

  const filteredOptions = searchable && searchTerm
    ? normalizedOptions.filter((opt) => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : normalizedOptions;

  const currentSelected = normalizedOptions.find((o) => String(o.value) === String(value));
  const displayLabel = disabled
    ? (disabledPlaceholder || placeholder)
    : (currentSelected?.label || (value ? String(value) : placeholder));

  return (
    <div className={`custom-select-wrapper ${disabled ? 'disabled' : ''}`} ref={dropdownRef}>
      <button
        type="button"
        className={`custom-select-trigger ${isOpen ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            setSearchTerm('');
          }
        }}
        disabled={disabled}
      >
        <span className={`trigger-text ${!value ? 'is-placeholder' : ''}`}>
          {displayLabel}
        </span>
        <svg
          className={`select-arrow ${isOpen ? 'open' : ''}`}
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#5a7085"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="custom-select-menu" style={{ maxHeight }}>
          {searchable && (
            <div className="custom-select-search-box" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                className="custom-select-search-input"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          )}

          <div className="custom-select-options-list">
            <div
              className={`custom-select-option ${!value ? 'selected' : ''}`}
              onClick={() => {
                onChange('');
                setIsOpen(false);
                setSearchTerm('');
              }}
            >
              {placeholder}
            </div>

            {filteredOptions.length === 0 ? (
              <div className="custom-select-no-results">No options found</div>
            ) : (
              filteredOptions.map((opt, i) => {
                const isSelected = String(value) === String(opt.value);
                return (
                  <div
                    key={`${opt.value}-${i}`}
                    className={`custom-select-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                  >
                    {opt.label}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CustomDurationSelect = ({ label, value, onChange, count }) => {
  const options = [...Array(count)].map((_, i) => ({ label: String(i), value: i }));
  return (
    <CustomSelect
      placeholder="Select"
      value={value}
      onChange={onChange}
      options={options}
      searchable={false}
      maxHeight={180}
    />
  );
};

const CreateNewPath = ({
  setpstep,
  setaccsideNav,
  pathSteps,
  setPathSteps,
  setStepCount,
  grade,
  setGrade,
  gradeAvg,
  setGradeAvg,
  curriculum,
  setCurriculum,
  stream,
  setStream,
  finance,
  setFinance,
  personality,
  setPersonality,
  gradeList,
  gradePointAvg,
  curriculumList,
  streamList,
  financeList,
  personalityList,
  countryApiValue,
  handleGrade,
  handleGradeAvg,
  handleCurriculum,
  handleStream,
  handleFinance,
  handlePersonality,
  pathSubmission
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [stepCount, setLocalStepCount] = useState('');

  // University autocomplete
  const [uniSearch, setUniSearch] = useState('');
  const [uniResults, setUniResults] = useState([]);
  const [showUniDropdown, setShowUniDropdown] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [uniHighlight, setUniHighlight] = useState(-1);

  // Program autocomplete
  const [programSearch, setProgramSearch] = useState('');
  const [programResults, setProgramResults] = useState([]);
  const [showProgramDropdown, setShowProgramDropdown] = useState(false);
  const [allUniversityPrograms, setAllUniversityPrograms] = useState([]);
  const [progHighlight, setProgHighlight] = useState(-1);

  // Participant Profile — cascading location
  const [profileStates, setProfileStates] = useState([]);
  const [profileCities, setProfileCities] = useState([]);
  const [preferredLocation, setPreferredLocation] = useState({ address: '', country: '', state: '', city: '' });

  // Academic Target — cascading location
  const [targetStates, setTargetStates] = useState([]);
  const [targetCities, setTargetCities] = useState([]);

  const [duration, setDuration] = useState({ years: '', months: '', days: '' });

  const uniListRef = useRef(null);
  const progListRef = useRef(null);

  // Participant Profile: fetch states when country changes
  useEffect(() => {
    if (!preferredLocation.country) { setProfileStates([]); setProfileCities([]); return; }
    fetch(`${BASE_URL}/api/locations/states?country=${encodeURIComponent(preferredLocation.country)}`)
      .then(r => r.json())
      .then(d => setProfileStates(d.data || []))
      .catch(console.error);
    setPreferredLocation(prev => ({ ...prev, state: '', city: '' }));
    setProfileCities([]);
  }, [preferredLocation.country]);

  // Participant Profile: fetch cities when state changes
  useEffect(() => {
    if (!preferredLocation.country || !preferredLocation.state) { setProfileCities([]); return; }
    fetch(`${BASE_URL}/api/locations/cities?country=${encodeURIComponent(preferredLocation.country)}&state=${encodeURIComponent(preferredLocation.state)}`)
      .then(r => r.json())
      .then(d => setProfileCities(d.data || []))
      .catch(console.error);
    setPreferredLocation(prev => ({ ...prev, city: '' }));
  }, [preferredLocation.state]);

  // Academic Target: fetch states when country changes
  useEffect(() => {
    if (!pathSteps?.country) { setTargetStates([]); setTargetCities([]); return; }
    fetch(`${BASE_URL}/api/locations/states?country=${encodeURIComponent(pathSteps.country)}`)
      .then(r => r.json())
      .then(d => setTargetStates(d.data || []))
      .catch(console.error);
    setPathSteps(prev => ({ ...prev, state: '', city: '' }));
    setTargetCities([]);
  }, [pathSteps?.country]);

  // Academic Target: fetch cities when state changes
  useEffect(() => {
    if (!pathSteps?.country || !pathSteps?.state) { setTargetCities([]); return; }
    fetch(`${BASE_URL}/api/locations/cities?country=${encodeURIComponent(pathSteps.country)}&state=${encodeURIComponent(pathSteps.state)}`)
      .then(r => r.json())
      .then(d => setTargetCities(d.data || []))
      .catch(console.error);
    setPathSteps(prev => ({ ...prev, city: '' }));
  }, [pathSteps?.state]);

  // University search
  useEffect(() => {
    if (uniSearch.length < 2) { setUniResults([]); return; }
    const timeout = setTimeout(() => {
      fetch(`${BASE_URL}/api/university-programs/search?q=${uniSearch}`)
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then(d => { setUniResults(d.data || []); setShowUniDropdown(true); setUniHighlight(-1); })
        .catch(console.error);
    }, 300);
    return () => clearTimeout(timeout);
  }, [uniSearch]);

  // Fetch programs for selected university
  useEffect(() => {
    if (!selectedUniversity) { setAllUniversityPrograms([]); return; }
    fetch(`${BASE_URL}/api/university-programs?university=${encodeURIComponent(selectedUniversity)}`)
      .then(r => r.json())
      .then(d => setAllUniversityPrograms(d.data || []))
      .catch(console.error);
  }, [selectedUniversity]);

  // Filter programs as user types
  useEffect(() => {
    if (!selectedUniversity) return;
    if (programSearch.length < 1) { setProgramResults(allUniversityPrograms); return; }
    setProgramResults(allUniversityPrograms.filter(p => p.toLowerCase().includes(programSearch.toLowerCase())));
    setProgHighlight(-1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programSearch, allUniversityPrograms, selectedUniversity]);

  // Keyboard nav
  const scrollToItem = (ref, index) => {
    if (ref.current) {
      const items = ref.current.querySelectorAll('li');
      if (items[index]) items[index].scrollIntoView({ block: 'nearest' });
    }
  };

  const handleUniKeyDown = (e) => {
    if (!showUniDropdown || !uniResults.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); const n = Math.min(uniHighlight + 1, uniResults.length - 1); setUniHighlight(n); scrollToItem(uniListRef, n); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); const n = Math.max(uniHighlight - 1, 0); setUniHighlight(n); scrollToItem(uniListRef, n); }
    else if (e.key === 'Enter' && uniHighlight >= 0) {
      e.preventDefault();
      const uni = uniResults[uniHighlight];
      setPathSteps(prev => ({ ...prev, destination_institution: uni.name, program: '' }));
      setUniSearch(uni.name); setSelectedUniversity(uni.name); setProgramSearch('');
      setUniResults([]); setShowUniDropdown(false); setUniHighlight(-1);
    } else if (e.key === 'Escape') { setShowUniDropdown(false); setUniHighlight(-1); }
  };

  const handleProgKeyDown = (e) => {
    if (!showProgramDropdown || !programResults.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); const n = Math.min(progHighlight + 1, programResults.length - 1); setProgHighlight(n); scrollToItem(progListRef, n); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); const n = Math.max(progHighlight - 1, 0); setProgHighlight(n); scrollToItem(progListRef, n); }
    else if (e.key === 'Enter' && progHighlight >= 0) {
      e.preventDefault();
      const prog = programResults[progHighlight];
      setPathSteps(prev => ({ ...prev, program: prog })); setProgramSearch(prog);
      setProgramResults([]); setShowProgramDropdown(false); setProgHighlight(-1);
    } else if (e.key === 'Escape') { setShowProgramDropdown(false); setProgHighlight(-1); }
  };

  const handleNextStepClick = () => {
    if (!pathSteps?.nameOfPath || !pathSteps?.nameOfPath.trim()) {
      toast.error('Please enter the name of the path (*)');
      return;
    }
    const hasPersonality = Array.isArray(personality) ? personality.length > 0 : Boolean(personality);
    if (grade.length === 0 || gradeAvg.length === 0 || curriculum.length === 0 || stream.length === 0 || finance.length === 0 || !hasPersonality) {
      alert('Please select at least one option from each category'); return;
    }
    setShowPopup(true);
  };

  const handleContinue = () => {
    if (!stepCount || parseInt(stepCount) < 1) {
      alert("Please enter a valid number of steps");
      return;
    }
    setShowPopup(false);
    const years = parseInt(duration.years) || 0;
    const months = parseInt(duration.months) || 0;
    const days = parseInt(duration.days) || 0;
    const totalDays = (years * 365) + (months * 30) + days;
    const updatedSteps = {
      ...pathSteps,
      duration: { years, months, days, totalDays },
      length: totalDays,
      preferredLocation,
      the_ids: []
    };
    setPathSteps(updatedSteps);
    setStepCount(Number(stepCount));
    pathSubmission(Number(stepCount), updatedSteps);
  };

  const handleCancel = () => { setShowPopup(false); setLocalStepCount(''); };

  const handleMultiSelect = (type, item) => {
    switch (type) {
      case 'grade': handleGrade(item); break;
      case 'gradeAvg': handleGradeAvg(item); break;
      case 'curriculum': handleCurriculum(item); break;
      case 'stream': handleStream(item); break;
      case 'finance': handleFinance(item); break;
      default: break;
    }
  };

  // Memoized, alphabetically sorted country options from countryApiValue
  const sortedCountryOptions = useMemo(() => {
    if (!Array.isArray(countryApiValue)) return [];
    const seen = new Set();
    const list = [];
    for (const item of countryApiValue) {
      const name = item?.name?.common || (typeof item?.name === 'string' ? item.name : '') || item?.country || '';
      const clean = String(name || '').trim();
      if (clean && !seen.has(clean.toLowerCase())) {
        seen.add(clean.toLowerCase());
        list.push({ value: clean, label: clean });
      }
    }
    return list.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
  }, [countryApiValue]);

  const sortedProfileStateOptions = useMemo(() => {
    if (!Array.isArray(profileStates)) return [];
    return [...profileStates]
      .filter(Boolean)
      .sort((a, b) => String(a).localeCompare(String(b), undefined, { sensitivity: 'base' }))
      .map((s) => ({ value: s, label: s }));
  }, [profileStates]);

  const sortedProfileCityOptions = useMemo(() => {
    if (!Array.isArray(profileCities)) return [];
    return [...profileCities]
      .filter(Boolean)
      .sort((a, b) => String(a).localeCompare(String(b), undefined, { sensitivity: 'base' }))
      .map((c) => ({ value: c, label: c }));
  }, [profileCities]);

  const sortedTargetStateOptions = useMemo(() => {
    if (!Array.isArray(targetStates)) return [];
    return [...targetStates]
      .filter(Boolean)
      .sort((a, b) => String(a).localeCompare(String(b), undefined, { sensitivity: 'base' }))
      .map((s) => ({ value: s, label: s }));
  }, [targetStates]);

  const sortedTargetCityOptions = useMemo(() => {
    if (!Array.isArray(targetCities)) return [];
    return [...targetCities]
      .filter(Boolean)
      .sort((a, b) => String(a).localeCompare(String(b), undefined, { sensitivity: 'base' }))
      .map((c) => ({ value: c, label: c }));
  }, [targetCities]);

  return (
    <>
      <div className="new-path-container">
        <div className="new-path-content">

          {/* Basic Information */}
          <div className="form-section">
            <h2 className="section-title">Basic information</h2>

            <div className="form-field">
              <label>What is the name of the path? <span className="required">*</span></label>
              <input type="text" placeholder="e.g., IBDP Engineering Pathway - Germany"
                value={pathSteps?.nameOfPath || ''} onChange={(e) => setPathSteps({ ...pathSteps, nameOfPath: e.target.value })} />
            </div>

            <div className="form-field">
              <label>How long will the path approx take?</label>
              <div className="duration-dropdown-group">
                <div className="duration-select">
                  <label>Years</label>
                  <select
                    className="duration-native-select"
                    value={duration.years}
                    onChange={(e) => setDuration({ ...duration, years: e.target.value })}
                  >
                    <option value="">Select</option>
                    {[...Array(11)].map((_, i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                  <CustomDurationSelect
                    label="Years"
                    value={duration.years}
                    count={11}
                    onChange={(val) => setDuration({ ...duration, years: val })}
                  />
                </div>
                <div className="duration-select">
                  <label>Months</label>
                  <select
                    className="duration-native-select"
                    value={duration.months}
                    onChange={(e) => setDuration({ ...duration, months: e.target.value })}
                  >
                    <option value="">Select</option>
                    {[...Array(12)].map((_, i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                  <CustomDurationSelect
                    label="Months"
                    value={duration.months}
                    count={12}
                    onChange={(val) => setDuration({ ...duration, months: val })}
                  />
                </div>
                <div className="duration-select">
                  <label>Days</label>
                  <select
                    className="duration-native-select"
                    value={duration.days}
                    onChange={(e) => setDuration({ ...duration, days: e.target.value })}
                  >
                    <option value="">Select</option>
                    {[...Array(31)].map((_, i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                  <CustomDurationSelect
                    label="Days"
                    value={duration.days}
                    count={31}
                    onChange={(val) => setDuration({ ...duration, days: val })}
                  />
                </div>
              </div>
            </div>

            <div className="form-field">
              <label>Describe the path <span className="required">*</span></label>
              <textarea placeholder="e.g., This path guides students from IBDP through admission to top German engineering universities."
                value={pathSteps?.description || ''} onChange={(e) => setPathSteps({ ...pathSteps, description: e.target.value })} rows="4" />
            </div>

            <div className="form-field">
              <label>What type of path is it? <span className="required">*</span></label>
              <div className="path-type-group">
                {['Education', 'Career', 'Immigration'].map((type) => (
                  <button key={type} className={`path-type-btn ${pathSteps?.path_type === type.toLowerCase() ? 'active-green' : ''}`}
                    onClick={() => setPathSteps({ ...pathSteps, path_type: type.toLowerCase() })}>{type}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Participant Profile */}
          <div className="form-section">
            <h2 className="section-title">Participant profile</h2>
            <h3 className="section-subtitle">Ideal fit (select at least one from each)</h3>

            <div className="form-field">
              <label>Select ideal grade for participant <span className="required">*</span></label>
              <div className="options-grid">
                {gradeList.map((item) => (
                  <button key={item} className={`option-btn ${grade.includes(item) ? 'selected-green' : ''}`} onClick={() => handleMultiSelect('grade', item)}>{item}</button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label>Select ideal grade point average <span className="required">*</span></label>
              <div className="options-grid">
                {gradePointAvg.map((item) => (
                  <button key={item} className={`option-btn ${gradeAvg.includes(item) ? 'selected-green' : ''}`} onClick={() => handleMultiSelect('gradeAvg', item)}>{item}</button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label>Select ideal curriculum <span className="required">*</span></label>
              <div className="options-grid">
                {curriculumList.map((item) => (
                  <button key={item} className={`option-btn ${curriculum.includes(item) ? 'selected-green' : ''}`} onClick={() => handleMultiSelect('curriculum', item)}>{item}</button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label>Select ideal stream <span className="required">*</span></label>
              <div className="options-grid streams-grid">
                {streamList.map((item) => (
                  <button key={item} className={`option-btn stream-btn ${stream.includes(item) ? 'selected-green' : ''}`} onClick={() => handleMultiSelect('stream', item)}>{item}</button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label>Select ideal financial situation <span className="required">*</span></label>
              <div className="options-grid finance-grid">
                {financeList.map((item) => (
                  <button key={item} className={`option-btn finance-btn ${finance.includes(item) ? 'selected-green' : ''}`} onClick={() => handleMultiSelect('finance', item)}>{item}</button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label>What personality suits this path? <span className="required">*</span> <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "normal", marginLeft: "6px" }}>(Select up to 2)</span></label>
              <div className="personality-grid">
                {personalityList.map((item) => {
                  const isSelected = Array.isArray(personality) ? personality.includes(item) : personality === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      className={`personality-btn ${isSelected ? 'selected-green' : ''}`}
                      onClick={() => handlePersonality(item)}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Participant Profile — Country → State → City */}
            <div className="form-field">
              <label>Participant location</label>
              <div className="profile-location-grid">

                <input type="text" placeholder="Address"
                  value={preferredLocation.address || ''}
                  onChange={(e) => setPreferredLocation({ ...preferredLocation, address: e.target.value })} />

                {/* Country */}
                <select
                  className="native-select-desktop"
                  value={preferredLocation.country}
                  onChange={(e) => setPreferredLocation({ ...preferredLocation, country: e.target.value, state: '', city: '' })}
                >
                  <option value="">Select Country</option>
                  {/* FIX: use index fallback so key is always defined */}
                  {countryApiValue?.map((item, idx) => (
                    <option key={item.name?.common || item.name || idx} value={item.name?.common || item.name}>
                      {item.name?.common || item.name}
                    </option>
                  ))}
                </select>
                <CustomSelect
                  placeholder="Select Country"
                  searchable={true}
                  value={preferredLocation.country}
                  onChange={(val) => setPreferredLocation({ ...preferredLocation, country: val, state: '', city: '' })}
                  options={countryApiValue || []}
                />

                {/* State */}
                <select
                  className="native-select-desktop"
                  value={preferredLocation.state}
                  disabled={!preferredLocation.country || profileStates.length === 0}
                  onChange={(e) => setPreferredLocation({ ...preferredLocation, state: e.target.value, city: '' })}
                  style={{ opacity: preferredLocation.country && profileStates.length > 0 ? 1 : 0.5 }}
                >
                  <option value="">
                    {!preferredLocation.country ? 'Select country first' : profileStates.length === 0 ? 'No states available' : 'Select State'}
                  </option>
                  {/* FIX: state strings are unique within a country */}
                  {profileStates.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <CustomSelect
                  placeholder="Select State"
                  searchable={true}
                  disabled={!preferredLocation.country || profileStates.length === 0}
                  disabledPlaceholder={!preferredLocation.country ? 'Select country first' : 'No states available'}
                  value={preferredLocation.state}
                  onChange={(val) => setPreferredLocation({ ...preferredLocation, state: val, city: '' })}
                  options={profileStates}
                />

                {/* City */}
                <select
                  className="native-select-desktop"
                  value={preferredLocation.city}
                  disabled={!preferredLocation.state || profileCities.length === 0}
                  onChange={(e) => setPreferredLocation({ ...preferredLocation, city: e.target.value })}
                  style={{ opacity: preferredLocation.state && profileCities.length > 0 ? 1 : 0.5 }}
                >
                  <option value="">
                    {!preferredLocation.state ? 'Select state first' : profileCities.length === 0 ? 'No cities available' : 'Select City'}
                  </option>
                  {profileCities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <CustomSelect
                  placeholder="Select City"
                  searchable={true}
                  disabled={!preferredLocation.state || profileCities.length === 0}
                  disabledPlaceholder={!preferredLocation.state ? 'Select state first' : 'No cities available'}
                  value={preferredLocation.city}
                  onChange={(val) => setPreferredLocation({ ...preferredLocation, city: val })}
                  options={profileCities}
                />

              </div>
            </div>
          </div>

          {/* Academic Target */}
          <div className="form-section">
            <h2 className="section-title">Academic target</h2>

            {/* University */}
            <div className="form-field">
              <label>What is the destination of the path? <span className="required">*</span></label>
              <div className="autocomplete-wrapper">
                <input type="text" placeholder="Search university..."
                  value={pathSteps?.destination_institution || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setUniSearch(value);
                    setPathSteps(prev => ({ ...prev, destination_institution: value, program: '' }));
                    setSelectedUniversity(''); setProgramSearch(''); setAllUniversityPrograms([]);
                  }}
                  onKeyDown={handleUniKeyDown}
                  onFocus={() => { if (uniResults.length > 0) setShowUniDropdown(true); }}
                  onBlur={() => setTimeout(() => { setShowUniDropdown(false); setUniHighlight(-1); }, 150)}
                />
                {showUniDropdown && uniResults.length > 0 && (
                  <ul className="autocomplete-dropdown" ref={uniListRef}>
                    {uniResults.map((uni, index) => (
                      // FIX: uni._id can be undefined — use name+index as reliable key
                      <li key={uni._id || `${uni.name}-${index}`}
                        style={{ backgroundColor: uniHighlight === index ? '#e8f5f1' : '' }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setPathSteps(prev => ({ ...prev, destination_institution: uni.name, program: '' }));
                          setUniSearch(uni.name); setSelectedUniversity(uni.name);
                          setProgramSearch(''); setUniResults([]); setShowUniDropdown(false); setUniHighlight(-1);
                        }}
                        onMouseEnter={() => setUniHighlight(index)}>
                        {uni.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Program */}
            <div className="form-field">
              <label>What program will they be studying? <span className="required">*</span></label>
              <div className="autocomplete-wrapper">
                <input type="text"
                  placeholder={selectedUniversity ? "Search program..." : "<SvgArrowUp size={14} /> Select a university first"}
                  value={pathSteps?.program || ''}
                  disabled={!selectedUniversity}
                  style={{ opacity: selectedUniversity ? 1 : 0.5, cursor: selectedUniversity ? 'text' : 'not-allowed' }}
                  onChange={(e) => { setProgramSearch(e.target.value); setPathSteps(prev => ({ ...prev, program: e.target.value })); }}
                  onKeyDown={handleProgKeyDown}
                  onFocus={() => { if (selectedUniversity && allUniversityPrograms.length > 0) { setProgramResults(allUniversityPrograms); setShowProgramDropdown(true); setProgHighlight(-1); } }}
                  onBlur={() => setTimeout(() => { setShowProgramDropdown(false); setProgHighlight(-1); }, 150)}
                />
                {showProgramDropdown && programResults.length > 0 && (
                  <ul className="autocomplete-dropdown" ref={progListRef}>
                    {programResults.map((prog, index) => (
                      // FIX: program strings may not be unique — use string+index
                      <li key={`${prog}-${index}`}
                        style={{ backgroundColor: progHighlight === index ? '#e8f5f1' : '' }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setPathSteps(prev => ({ ...prev, program: prog })); setProgramSearch(prog);
                          setProgramResults([]); setShowProgramDropdown(false); setProgHighlight(-1);
                        }}
                        onMouseEnter={() => setProgHighlight(index)}>
                        {prog}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {selectedUniversity && allUniversityPrograms.length > 0 && (
                <small style={{ color: '#4caf93', marginTop: '4px', display: 'block' }}>
                  {allUniversityPrograms.length} programs available for {selectedUniversity}
                </small>
              )}
              {selectedUniversity && allUniversityPrograms.length === 0 && (
                <small style={{ color: '#999', marginTop: '4px', display: 'block' }}>No mapped programs — type manually.</small>
              )}
            </div>

            {/* Academic Target — Country → State → City */}
            <div className="target-location-stack">

              <div>
                <label>Country</label>
                <select
                  className="native-select-desktop"
                  value={pathSteps?.country || ''}
                  onChange={(e) => setPathSteps(prev => ({ ...prev, country: e.target.value, state: '', city: '' }))}
                >
                  <option value="">Select Country</option>
                  {countryApiValue?.map((item, idx) => (
                    <option key={item.name?.common || item.name || idx} value={item.name?.common || item.name}>
                      {item.name?.common || item.name}
                    </option>
                  ))}
                </select>
                <CustomSelect
                  placeholder="Select Country"
                  searchable={true}
                  value={pathSteps?.country || ''}
                  onChange={(val) => setPathSteps(prev => ({ ...prev, country: val, state: '', city: '' }))}
                  options={countryApiValue || []}
                />
              </div>

              <div>
                <label>State / Province</label>
                <select
                  className="native-select-desktop"
                  value={pathSteps?.state || ''}
                  disabled={!pathSteps?.country || targetStates.length === 0}
                  onChange={(e) => setPathSteps(prev => ({ ...prev, state: e.target.value, city: '' }))}
                >
                  <option value="">
                    {!pathSteps?.country ? 'Select country first' : targetStates.length === 0 ? 'No states available' : 'Select State / Province'}
                  </option>
                  {targetStates.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <CustomSelect
                  placeholder="Select State / Province"
                  searchable={true}
                  disabled={!pathSteps?.country || targetStates.length === 0}
                  disabledPlaceholder={!pathSteps?.country ? 'Select country first' : 'No states available'}
                  value={pathSteps?.state || ''}
                  onChange={(val) => setPathSteps(prev => ({ ...prev, state: val, city: '' }))}
                  options={targetStates}
                />
              </div>

              <div>
                <label>City</label>
                <select
                  className="native-select-desktop"
                  value={pathSteps?.city || ''}
                  disabled={!pathSteps?.state || targetCities.length === 0}
                  onChange={(e) => setPathSteps(prev => ({ ...prev, city: e.target.value }))}
                >
                  <option value="">
                    {!pathSteps?.state ? 'Select state first' : targetCities.length === 0 ? 'No cities available' : 'Select City'}
                  </option>
                  {targetCities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <CustomSelect
                  placeholder="Select City"
                  searchable={true}
                  disabled={!pathSteps?.state || targetCities.length === 0}
                  disabledPlaceholder={!pathSteps?.state ? 'Select state first' : 'No cities available'}
                  value={pathSteps?.city || ''}
                  onChange={(val) => setPathSteps(prev => ({ ...prev, city: val }))}
                  options={targetCities}
                />
              </div>

            </div>
          </div>

          <div className="action-buttons">
            <button className="btn-back" onClick={() => setaccsideNav("Paths")}>Go Back</button>
            <button className="btn-next" onClick={handleNextStepClick}>Next Step →</button>
          </div>
        </div>
      </div>

      {showPopup && (
        <>
          <div className="step-popup-overlay" onClick={handleCancel} />
          <div className="step-popup" onClick={(e) => e.stopPropagation()}>
            <h3 className="step-popup-title">Add Steps to Your Path</h3>
            <p className="step-popup-description">How many steps do you want to add to this path?</p>
            <div className="step-popup-input-wrapper">
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Enter number of steps"
                value={stepCount}
                onChange={(e) => setLocalStepCount(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleContinue();
                  }
                }}
                className="step-popup-input"
                autoFocus
              />
            </div>
            <div className="step-popup-buttons">
              <button className="step-popup-btn step-popup-btn-cancel" onClick={handleCancel}>Cancel</button>
              <button className="step-popup-btn step-popup-btn-continue" onClick={handleContinue}>Continue →</button>
            </div>
          </div>
        </>
      )}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </>
  );
};

export default CreateNewPath;