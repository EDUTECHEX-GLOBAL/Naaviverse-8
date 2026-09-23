import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Country, State, City } from "country-state-city";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ── Country-specific mobile phone number digit rules ──────────────────────────
// Supports exact length (e.g. India: 10, Australia: 9) and variable lengths (e.g. Germany: 10-11, Brazil: 10-11, Indonesia: 9-12)
const COUNTRY_MOBILE_RULES = {
  // North America & Caribbean (NANP + others)
  US: [10], CA: [10], MX: [10], AG: [10], AI: [10], AS: [10], BB: [10], BM: [10],
  BS: [10], DM: [10], DO: [10], GD: [10], GU: [10], JM: [10], KN: [10], KY: [10],
  LC: [10], MP: [10], MS: [10], PR: [10], SX: [10], TC: [10], TT: [7, 10], VC: [10],
  VG: [10], VI: [10], CU: [8], HT: [8],
  // Asia
  IN: [10], CN: [11], JP: [10], KR: [9, 10], SG: [8], MY: [9, 10], ID: [9, 10, 11, 12],
  PH: [10], VN: [9], TH: [9], PK: [10], BD: [10], LK: [9], NP: [10], MM: [8, 9, 10],
  HK: [8], TW: [9], MO: [8], KH: [8, 9], LA: [9, 10], MN: [8], AF: [9], BT: [8],
  BN: [7], MV: [7],
  // Middle East
  AE: [9], SA: [9], QA: [8], KW: [8], BH: [8], OM: [8], IL: [9], JO: [9],
  LB: [7, 8], IQ: [10], IR: [10], SY: [9], YE: [9], PS: [9],
  // Europe
  GB: [10], DE: [10, 11], FR: [9], IT: [9, 10], ES: [9], NL: [9], BE: [9],
  CH: [9], AT: [10, 11, 12, 13], SE: [9], NO: [8], DK: [8], FI: [9, 10],
  IE: [9], PT: [9], PL: [9], CZ: [9], SK: [9], HU: [9], RO: [9], BG: [8, 9],
  GR: [10], TR: [10], RU: [10], UA: [9], BY: [9], RS: [8, 9], HR: [8, 9],
  SI: [8], BA: [8], AL: [9], MK: [8], ME: [8], IS: [7], LU: [9], MT: [8],
  CY: [8], EE: [7, 8], LV: [8], LT: [8], MD: [8], GE: [9], AM: [8], AZ: [9],
  KZ: [10], UZ: [9], KG: [9], TJ: [9], TM: [8], AD: [6], FO: [6], GI: [8],
  GL: [6], LI: [7, 8, 9], MC: [8, 9], SM: [6, 10],
  // Oceania
  AU: [9], NZ: [8, 9, 10], FJ: [7], PG: [8], NC: [6], PF: [8], WS: [7],
  TO: [5, 7], VU: [7], SB: [7],
  // Central & South America
  BR: [10, 11], AR: [10], CL: [9], CO: [10], PE: [9], VE: [10], EC: [9],
  BO: [8], PY: [9], UY: [8], CR: [8], PA: [8], GT: [8], HN: [8], SV: [8],
  NI: [8], BZ: [7], GY: [7], SR: [7], AW: [7], CW: [7, 8],
  // Africa
  ZA: [9], NG: [10], EG: [10], KE: [9], GH: [9], ET: [9], TZ: [9], UG: [9],
  DZ: [9], MA: [9], TN: [8], SD: [9], AO: [9], MZ: [9], ZW: [9], ZM: [9],
  SN: [9], CM: [9], CI: [10], RW: [9], MG: [9], MU: [8], NA: [9], BW: [8],
  BJ: [8], BF: [8], BI: [8], CV: [7], CF: [8], TD: [8], CD: [9], CG: [9],
  DJ: [8], GQ: [9], ER: [7], GA: [7, 8], GM: [7], GN: [9], GW: [7], LR: [7, 8],
  LY: [9], MW: [9], ML: [8], MR: [8], NE: [8], SL: [8], SO: [8, 9], SS: [9],
  SZ: [8], TG: [8]
};

const getCountryPhoneRules = (isoCode) => {
  const custom = COUNTRY_MOBILE_RULES[isoCode];
  const lengths = custom || [7, 8, 9, 10, 11, 12, 13, 14, 15];
  const minLength = Math.min(...lengths);
  const maxLength = Math.max(...lengths);

  let formatDescription = "";
  if (lengths.length === 1) {
    formatDescription = `exactly ${lengths[0]} digits`;
  } else if (maxLength - minLength === lengths.length - 1) {
    formatDescription = `${minLength} to ${maxLength} digits`;
  } else {
    formatDescription = `${lengths.join(" or ")} digits`;
  }

  let placeholder = "9876543210";
  if (lengths[0] === 8) placeholder = "98765432";
  else if (lengths[0] === 9) placeholder = "987654321";
  else if (lengths[0] === 10) placeholder = "9876543210";
  else if (lengths[0] === 11) placeholder = "98765432100";
  else if (lengths[0] === 7) placeholder = "9876543";

  return {
    lengths,
    minLength,
    maxLength,
    formatDescription,
    placeholder,
  };
};

const LevelOneModal = ({
  inline = false,
  creation = false,
  userDetails,
  existingData,
  existingDocId,
  onClose,
  onComplete,
}) => {
  const [loading,          setLoading]          = useState(false);
  const [uploading,        setUploading]        = useState(false);
  const [previewUrl,       setPreviewUrl]       = useState(existingData?.profilePicture || "");

  const [formData, setFormData] = useState({
    name:           existingData?.name           || "",
    username:       existingData?.username       || "",
    phoneNumber:    existingData?.phoneNumber    || "",
    country:        existingData?.country        || "India",
    state:          existingData?.state          || "",
    city:           existingData?.city           || "",
    postalCode:     existingData?.postalCode     || "",
    profilePicture: existingData?.profilePicture || "",
    email:          existingData?.email          || userDetails?.email || "",
    userType:       existingData?.userType       || "student",
  });

  // ── Country code + phone number split ─────────────────────────────────────
  const [selectedPhoneIso, setSelectedPhoneIso] = useState("IN");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneDigits, setPhoneDigits] = useState("");

  // All countries from library
  const allCountries = useMemo(() => {
    return Country.getAllCountries().sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Dial code options enriched with country-specific mobile phone digit rules
  const dialCodeOptions = useMemo(() => {
    const seen = new Set();
    const list = [];
    allCountries.forEach((c) => {
      if (c.phonecode) {
        const formattedCode = c.phonecode.startsWith("+") ? c.phonecode : `+${c.phonecode}`;
        const key = `${c.isoCode}-${formattedCode}`;
        if (!seen.has(key)) {
          seen.add(key);
          const rules = getCountryPhoneRules(c.isoCode);
          list.push({
            code: formattedCode,
            isoCode: c.isoCode,
            name: c.name,
            label: `${formattedCode} (${c.isoCode} - ${c.name})`,
            lengths: rules.lengths,
            minLength: rules.minLength,
            maxLength: rules.maxLength,
            formatDescription: rules.formatDescription,
            placeholder: rules.placeholder,
          });
        }
      }
    });
    return list.sort((a, b) => a.isoCode.localeCompare(b.isoCode));
  }, [allCountries]);

  // Current selected country for phone number rules
  const currentPhoneCountry = useMemo(() => {
    return (
      dialCodeOptions.find((c) => c.isoCode === selectedPhoneIso) ||
      dialCodeOptions.find((c) => c.code === countryCode) ||
      dialCodeOptions.find((c) => c.isoCode === "IN") ||
      dialCodeOptions[0] ||
      {
        lengths: [10],
        minLength: 10,
        maxLength: 10,
        formatDescription: "exactly 10 digits",
        placeholder: "9876543210",
        name: "India",
        code: "+91",
        isoCode: "IN",
      }
    );
  }, [dialCodeOptions, selectedPhoneIso, countryCode]);

  // Handler for phone country code dropdown change
  const handlePhoneCountryChange = (isoCode) => {
    setSelectedPhoneIso(isoCode);
    const countryObj = dialCodeOptions.find((c) => c.isoCode === isoCode);
    if (countryObj) {
      setCountryCode(countryObj.code);
      // Auto-trim extra digits if existing phoneDigits exceeds new country's limit
      setPhoneDigits((prev) => prev.slice(0, countryObj.maxLength));
    }
  };

  // Typeahead support: when user types first two letters (e.g. "IN", "US") or country name, jump immediately
  const phoneTypeaheadQueryRef = useRef("");
  const phoneTypeaheadTimerRef = useRef(null);

  const handlePhoneCodeKeyDown = (e) => {
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      clearTimeout(phoneTypeaheadTimerRef.current);
      phoneTypeaheadQueryRef.current += e.key.toLowerCase();
      const q = phoneTypeaheadQueryRef.current;

      phoneTypeaheadTimerRef.current = setTimeout(() => {
        phoneTypeaheadQueryRef.current = "";
      }, 1000);

      const found =
        dialCodeOptions.find((opt) => opt.isoCode.toLowerCase() === q) ||
        dialCodeOptions.find((opt) => opt.isoCode.toLowerCase().startsWith(q)) ||
        dialCodeOptions.find((opt) => opt.name.toLowerCase().startsWith(q)) ||
        dialCodeOptions.find((opt) => opt.code.replace(/\+/g, "").startsWith(q));

      if (found) {
        handlePhoneCountryChange(found.isoCode);
      }
    }
  };

  // Find selected country object
  const selectedCountryObj = useMemo(() => {
    if (!formData.country) return null;
    return allCountries.find(
      (c) => c.name.toLowerCase() === formData.country.toLowerCase() || c.isoCode.toLowerCase() === formData.country.toLowerCase()
    );
  }, [allCountries, formData.country]);

  // States for selected country
  const availableStates = useMemo(() => {
    if (!selectedCountryObj) return [];
    return State.getStatesOfCountry(selectedCountryObj.isoCode).sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedCountryObj]);

  // Find selected state object
  const selectedStateObj = useMemo(() => {
    if (!formData.state || !availableStates.length) return null;
    return availableStates.find(
      (s) => s.name.toLowerCase() === formData.state.toLowerCase() || s.isoCode.toLowerCase() === formData.state.toLowerCase()
    );
  }, [availableStates, formData.state]);

  // Cities for selected state
  const availableCities = useMemo(() => {
    if (!selectedCountryObj || !selectedStateObj) return [];
    return City.getCitiesOfState(selectedCountryObj.isoCode, selectedStateObj.isoCode).sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedCountryObj, selectedStateObj]);

  // Parse existing phoneNumber into code + digits on mount or when existingData arrives
  useEffect(() => {
    const ph = existingData?.phoneNumber || "";
    if (ph) {
      const match = ph.match(/^(\+\d{1,4})\s*(.*)$/);
      if (match) {
        const code = match[1];
        const rawDigits = match[2].replace(/[^\d]/g, "");
        setCountryCode(code);
        const countryByName = dialCodeOptions.find(
          (c) => c.name.toLowerCase() === (existingData.country || formData.country || "").toLowerCase()
        );
        const countryByCode = dialCodeOptions.find((c) => c.code === code);
        const selected = (countryByName && countryByName.code === code) ? countryByName : (countryByCode || countryByName);
        if (selected) {
          setSelectedPhoneIso(selected.isoCode);
          setPhoneDigits(rawDigits.slice(0, selected.maxLength));
        } else {
          setPhoneDigits(rawDigits);
        }
      } else {
        const rawDigits = ph.replace(/[^\d]/g, "");
        const countryByName = dialCodeOptions.find(
          (c) => c.name.toLowerCase() === (existingData.country || formData.country || "").toLowerCase()
        );
        if (countryByName) {
          setSelectedPhoneIso(countryByName.isoCode);
          setCountryCode(countryByName.code);
          setPhoneDigits(rawDigits.slice(0, countryByName.maxLength));
        } else {
          setPhoneDigits(rawDigits);
        }
      }
    } else if (existingData?.country) {
      const countryByName = dialCodeOptions.find(
        (c) => c.name.toLowerCase() === existingData.country.toLowerCase()
      );
      if (countryByName) {
        setSelectedPhoneIso(countryByName.isoCode);
        setCountryCode(countryByName.code);
      }
    }
  }, [existingData?.phoneNumber, existingData?.country, dialCodeOptions]);

  const [userNameAvailable, setUserNameAvailable] = useState(null);
  const [checkingUsername,  setCheckingUsername]  = useState(false);

  // ── Track original username to skip re-check when unchanged ──────────────
  const originalUsername = existingData?.username || "";
  const isUsernameUnchanged = formData.username === originalUsername;

  // ── Sync formData when parent passes fresh existingData after save + re-fetch ──
  useEffect(() => {
    if (!existingData) return;
    setFormData({
      name:           existingData.name           || "",
      username:       existingData.username       || "",
      phoneNumber:    existingData.phoneNumber    || "",
      country:        existingData.country        || "India",
      state:          existingData.state          || "",
      city:           existingData.city           || "",
      postalCode:     existingData.postalCode     || "",
      profilePicture: existingData.profilePicture || "",
      email:          existingData.email          || userDetails?.email || "",
      userType:       existingData.userType       || "student",
    });
    setPreviewUrl(existingData.profilePicture || "");
    setUserNameAvailable(null);
  }, [existingData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (name === "username") setUserNameAvailable(null);
  };

  // ── Country selection handler ─────────────────────────────────────────────
  const handleCountryChange = (e) => {
    const countryName = e.target.value;
    setFormData((p) => ({ ...p, country: countryName, state: "", city: "" }));

    const match = dialCodeOptions.find(
      (c) => c.name.toLowerCase() === countryName.toLowerCase()
    ) || allCountries.find(
      (c) => c.name.toLowerCase() === countryName.toLowerCase()
    );

    if (match) {
      if (match.isoCode) {
        setSelectedPhoneIso(match.isoCode);
      }
      const code = match.code || (match.phonecode?.startsWith("+") ? match.phonecode : `+${match.phonecode}`);
      if (code) {
        setCountryCode(code);
      }
      const max = match.maxLength || 15;
      setPhoneDigits((prev) => prev.slice(0, max));
    }
  };

  // ── State selection handler ───────────────────────────────────────────────
  const handleStateChange = (e) => {
    const stateName = e.target.value;
    setFormData((p) => ({ ...p, state: stateName, city: "" }));
  };

  // ── City selection handler ────────────────────────────────────────────────
  const handleCityChange = (e) => {
    setFormData((p) => ({ ...p, city: e.target.value }));
  };

  // ── Automatic City & State lookup from Postal Code ───────────────────────
  const [fetchingCity, setFetchingCity] = useState(false);
  const postalTimerRef = useRef(null);

  const cleanPostalPlaceName = (raw) => {
    if (!raw) return "";
    return raw
      .replace(/\s+[HSB]\s*\.?O\.?$/i, "")
      .replace(/\s*\([^)]*\)/g, "")
      .replace(/\s*(City|GPO|North|South|East|West|Central)$/gi, "")
      .trim();
  };

  const lookupPostalCode = async (postalCodeVal, countryName) => {
    const trimmed = (postalCodeVal || "").trim();
    if (!trimmed || trimmed.length < 3) return;

    setFetchingCity(true);
    try {
      const isIndia = !countryName || countryName.toLowerCase() === "india" || /^\d{6}$/.test(trimmed);
      let detectedCity = "";
      let detectedState = "";

      const countryIso = (selectedCountryObj?.isoCode || selectedPhoneIso || (isIndia ? "IN" : "US")).toLowerCase();
      const tasks = [];

      // Task 1: Zippopotam
      tasks.push(
        fetch(`https://api.zippopotam.us/${countryIso}/${encodeURIComponent(trimmed)}`, { signal: AbortSignal.timeout(8000) })
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            if (d && d.places && d.places.length > 0) {
              const place = d.places[0];
              const cName = cleanPostalPlaceName(place["place name"]);
              if (cName) return { city: cName, state: place["state"] || "" };
            }
            throw new Error("No place");
          })
      );

      // Task 2: India Post API
      if (isIndia && /^\d{6}$/.test(trimmed)) {
        tasks.push(
          fetch(`https://api.postalpincode.in/pincode/${trimmed}`, { signal: AbortSignal.timeout(8000) })
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
              const res = d && d[0];
              if (res && res.Status === "Success" && res.PostOffice && res.PostOffice.length > 0) {
                const po = res.PostOffice[0];
                const cleanBlock = (po.Block || "").replace(/\s*\(Urban\)/i, "").replace(/\s*\(Rural\)/i, "").trim();
                const cleanDiv = (po.Division || "").replace(/\s*(City|GPO|North|South|East|West|Central)/gi, "").trim();
                let extractedCity = "";
                if (cleanDiv && cleanDiv !== po.District && !po.District.toLowerCase().includes(cleanDiv.toLowerCase())) {
                  extractedCity = cleanDiv;
                } else if (cleanBlock && cleanBlock !== po.District && cleanBlock !== "Shaikpet" && !po.District.toLowerCase().includes(cleanBlock.toLowerCase())) {
                  extractedCity = cleanBlock;
                } else {
                  extractedCity = po.District || po.Division || po.Name || "";
                }
                const cName = cleanPostalPlaceName(extractedCity);
                if (cName) return { city: cName, state: po.State || "" };
              }
              throw new Error("No PO");
            })
        );
      }

      let resObj = null;
      try {
        resObj = await Promise.any(tasks);
      } catch (raceErr) {
        // Fallback: OpenStreetMap Nominatim
        try {
          const countryParam = countryName || "India";
          const nomRes = await fetch(
            `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(trimmed)}&country=${encodeURIComponent(countryParam)}&format=json&addressdetails=1`,
            { signal: AbortSignal.timeout(6000) }
          );
          if (nomRes.ok) {
            const nomData = await nomRes.json();
            if (nomData && nomData.length > 0) {
              const addr = nomData[0].address;
              const nCity = addr.city || addr.town || addr.village || addr.county || addr.state_district || "";
              resObj = { city: cleanPostalPlaceName(nCity), state: addr.state || "" };
            }
          }
        } catch (e) {}
      }

      if (resObj) {
        detectedCity = resObj.city;
        detectedState = resObj.state;
      }

      if (detectedCity) {
        const currentIso = selectedCountryObj?.isoCode || (isIndia ? "IN" : "US");
        const statesForCountry = State.getStatesOfCountry(currentIso);

        let stateToSet = formData.state;
        if (detectedState) {
          const matchedState = statesForCountry.find(
            (s) =>
              s.name.toLowerCase() === detectedState.toLowerCase() ||
              s.name.toLowerCase().includes(detectedState.toLowerCase()) ||
              detectedState.toLowerCase().includes(s.name.toLowerCase())
          );
          if (matchedState) {
            stateToSet = matchedState.name;
          }
        }

        let cityToSet = detectedCity;
        if (stateToSet) {
          const stateObj = statesForCountry.find((s) => s.name.toLowerCase() === stateToSet.toLowerCase());
          if (stateObj) {
            const citiesInState = City.getCitiesOfState(currentIso, stateObj.isoCode);
            const exactCity = citiesInState.find((c) => c.name.toLowerCase() === detectedCity.toLowerCase());
            const partialCity = citiesInState.find(
              (c) =>
                c.name.toLowerCase().includes(detectedCity.toLowerCase()) ||
                detectedCity.toLowerCase().includes(c.name.toLowerCase())
            );
            if (exactCity) {
              cityToSet = exactCity.name;
            } else if (partialCity) {
              cityToSet = partialCity.name;
            }
          }
        }

        setFormData((prev) => ({
          ...prev,
          state: stateToSet || prev.state,
          city: cityToSet,
        }));
      }
    } catch (err) {
      console.warn("Postal code city detection error:", err.message);
    } finally {
      setFetchingCity(false);
    }
  };

  const handlePostalCodeChange = (e) => {
    const val = e.target.value;
    setFormData((p) => ({ ...p, postalCode: val }));

    clearTimeout(postalTimerRef.current);
    const trimmed = val.trim();
    if (trimmed.length >= 3) {
      postalTimerRef.current = setTimeout(() => {
        lookupPostalCode(trimmed, formData.country);
      }, 400);
    }
  };

  const handlePostalCodeBlur = (e) => {
    clearTimeout(postalTimerRef.current);
    const trimmed = e.target.value.trim();
    if (trimmed.length >= 3) {
      lookupPostalCode(trimmed, formData.country);
    }
  };

  // ── Username check — skip API call if username hasn't changed ─────────────
  const handleCheckUsername = async () => {
    if (!formData.username) return;

    if (isUsernameUnchanged) {
      setUserNameAvailable(true);
      return;
    }

    setCheckingUsername(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/users/check-username?username=${formData.username}`
      );
      setUserNameAvailable(res.data.available);
    } catch {
      setUserNameAvailable(false);
    } finally {
      setCheckingUsername(false);
    }
  };

  // ── Form validation — unchanged username is implicitly valid ──────────────
  const isFormValid = () =>
    formData.name &&
    formData.username &&
    phoneDigits &&
    (currentPhoneCountry.lengths ? currentPhoneCountry.lengths.includes(phoneDigits.length) : true) &&
    formData.country &&
    formData.state &&
    formData.city &&
    formData.postalCode &&
    userNameAvailable !== false &&
    (isUsernameUnchanged || userNameAvailable === true);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024)    { toast.error("Max file size is 5MB");         return; }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);

    try {
      const res = await fetch(`${BASE_URL}/api/upload/get-presigned-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });
      if (!res.ok) throw new Error("Upload URL request failed");
      const data = await res.json();
      if (!data.presignedUrl) throw new Error("No presigned URL");

      await fetch(data.presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const fileUrl = data.fileUrl
        || `https://thenaaviversebucket.s3.amazonaws.com/${file.name}`;

      setFormData((p) => ({ ...p, profilePicture: fileUrl }));
      toast.success("Image uploaded");
    } catch (err) {
      console.warn("Image upload skipped (optional):", err.message);
      toast.warn("Image upload skipped — you can add a picture later");
      setFormData((p) => ({ ...p, profilePicture: "" }));
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePic = () => {
    setFormData((p) => ({ ...p, profilePicture: "" }));
    setPreviewUrl("");
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = ["name", "username", "country", "state", "city", "postalCode"];
    for (const f of required) {
      if (!formData[f]) {
        toast.error(`Please fill in ${f.replace(/([A-Z])/g, " $1").toLowerCase()}`);
        return;
      }
    }
    if (!phoneDigits) {
      toast.error("Please fill in phone number");
      return;
    }

    // Validate phone number length based on selected country's rules
    const allowedLengths = currentPhoneCountry?.lengths || [];
    if (allowedLengths.length > 0 && !allowedLengths.includes(phoneDigits.length)) {
      const countryName = currentPhoneCountry?.name || "the selected country";
      if (allowedLengths.length === 1) {
        toast.error(`Phone number for ${countryName} must be exactly ${allowedLengths[0]} digits`);
      } else {
        toast.error(
          `Phone number for ${countryName} must be ${currentPhoneCountry.formatDescription || `${currentPhoneCountry.minLength} to ${currentPhoneCountry.maxLength} digits`}`
        );
      }
      return;
    }

    if (userNameAvailable === false) {
      toast.error("That username is already taken — please choose another");
      return;
    }

    // If username was changed but availability wasn't checked yet, force a check
    if (!isUsernameUnchanged && userNameAvailable === null) {
      toast.error("Please check username availability before saving");
      return;
    }

    setLoading(true);
    try {
      const email = userDetails?.email || formData.email;
      const fullPhone = `${countryCode}${phoneDigits}`;
      const body  = {
        ...formData,
        email,
        phoneNumber: fullPhone,
      };

      let response;
      const editId = existingData?._id || existingDocId;

      if (editId && !creation) {
        // ── Edit mode: PUT /api/users/update/:id ────────────────────────────
        response = await axios.put(`${BASE_URL}/api/users/update/${editId}`, body);
      } else {
        // ── Creation mode: POST /api/users/add ─────────────────────────────
        response = await axios.post(`${BASE_URL}/api/users/add`, body);
      }

      if (response.data?.status) {
        const savedId = response.data?.data?._id || editId;

        // ── Persist pic + name to localStorage so sidebar updates instantly ─
        if (formData.profilePicture) {
          localStorage.setItem("userProfilePic", formData.profilePicture);
        }

        try {
          const raw    = localStorage.getItem("user");
          const parsed = raw ? JSON.parse(raw) : {};
          const updated = parsed?.user
            ? { ...parsed, user: { ...parsed.user, name: formData.name } }
            : { ...parsed, name: formData.name };
          localStorage.setItem("user", JSON.stringify(updated));
          localStorage.setItem("userName", formData.name);
        } catch {}

        if (typeof onComplete === "function") onComplete(savedId);
      } else {
        toast.error(response.data?.message || "Failed to save profile");
      }
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
      // Surface username-taken error from backend
      const msg = err.response?.data?.message || "";
      if (msg.toLowerCase().includes("username")) {
        toast.error("That username is already taken — please choose another");
        setUserNameAvailable(false);
      } else {
        toast.error(msg || "An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="up-form-wrap">
        <div className="up-form-title">
          {creation ? "Step 1 — Basic Information" : "Edit Basic Information"}
        </div>
        <div className="up-form-desc">
          {creation
            ? "Tell us about yourself to get started."
            : "Update your personal & contact details."}
        </div>

        {/* ── Profile Picture ─────────────────────────────────────────────── */}
        <div className="up-form-group">
          <label className="up-form-label">Profile Picture (optional)</label>
          <div className="up-pic-wrap">
            <div
              className="up-pic-circle"
              onClick={() => document.getElementById("up-pic-input").click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="preview" />
              ) : (
                <span className="up-pic-placeholder">Click<br />to upload</span>
              )}
            </div>
            <input
              id="up-pic-input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
            <div className="up-pic-actions">
              <button
                type="button"
                className="up-upload-btn"
                disabled={uploading}
                onClick={() => document.getElementById("up-pic-input").click()}
              >
                {uploading ? "Uploading…" : "Choose Image"}
              </button>
              {previewUrl && (
                <button type="button" className="up-remove-btn" onClick={handleRemovePic}>
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Name + Username ─────────────────────────────────────────────── */}
        <div className="up-form-row">
          <div className="up-form-group">
            <label className="up-form-label">Full Name *</label>
            <input
              className="up-input"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="up-form-group">
            <label className="up-form-label">Username *</label>
            <div className="up-username-row">
              <input
                className="up-input"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
              />
              <button
                type="button"
                className="up-check-btn"
                onClick={handleCheckUsername}
                disabled={!formData.username || checkingUsername}
              >
                {checkingUsername ? "…" : "Check"}
              </button>
            </div>

            {/* ── Availability feedback ────────────────────────────────────── */}
            {userNameAvailable === true && (
              <div className="up-username-ok">✓ Username available</div>
            )}
            {userNameAvailable === false && (
              <div className="up-username-err">✗ Username already taken</div>
            )}
            {userNameAvailable === null && isUsernameUnchanged && formData.username && (
              <div className="up-username-ok" style={{ opacity: 0.6 }}>
                ✓ Current username
              </div>
            )}
            {userNameAvailable === null && !isUsernameUnchanged && formData.username && (
              <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
                Click "Check" to verify availability
              </div>
            )}
          </div>
        </div>

        {/* ── Phone Number with Country Code ──────────────────────────────── */}
        <div className="up-form-group">
          <label className="up-form-label">Phone Number *</label>
          <div className="up-phone-row">
            <select
              className="up-select up-phone-code"
              value={selectedPhoneIso}
              onChange={(e) => handlePhoneCountryChange(e.target.value)}
              onKeyDown={handlePhoneCodeKeyDown}
            >
              {dialCodeOptions.map((opt) => (
                <option key={`${opt.isoCode}-${opt.code}`} value={opt.isoCode}>
                  {opt.isoCode} ({opt.code})
                </option>
              ))}
            </select>
            <input
              className="up-input up-phone-input"
              type="tel"
              inputMode="numeric"
              value={phoneDigits}
              maxLength={currentPhoneCountry.maxLength}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, currentPhoneCountry.maxLength);
                setPhoneDigits(val);
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "Backspace" ||
                  e.key === "Delete" ||
                  e.key === "Tab" ||
                  e.key === "ArrowLeft" ||
                  e.key === "ArrowRight" ||
                  e.key === "ArrowUp" ||
                  e.key === "ArrowDown" ||
                  e.key === "Enter" ||
                  e.ctrlKey ||
                  e.metaKey
                ) {
                  return;
                }
                if (!/^\d$/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              placeholder={currentPhoneCountry.placeholder}
              required
            />
          </div>
        </div>

        {/* ── Country + State ─────────────────────────────────────────────── */}
        <div className="up-form-row">
          <div className="up-form-group">
            <label className="up-form-label">Country *</label>
            <select
              className="up-select"
              name="country"
              value={formData.country}
              onChange={handleCountryChange}
              required
            >
              <option value="">Select Country</option>
              {allCountries.map((c) => (
                <option key={c.isoCode} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="up-form-group">
            <label className="up-form-label">State *</label>
            <select
              className="up-select"
              name="state"
              value={formData.state}
              onChange={handleStateChange}
              required
              disabled={!availableStates.length}
            >
              <option value="">
                {!formData.country
                  ? "Select country first"
                  : availableStates.length
                  ? "Select State"
                  : "No states found"}
              </option>
              {availableStates.map((s) => (
                <option key={`${s.countryCode}-${s.isoCode}`} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── City + Postal ────────────────────────────────────────────────── */}
        <div className="up-form-row">
          <div className="up-form-group">
            <label className="up-form-label">
              City * {fetchingCity && <span style={{ textTransform: "none", fontSize: "11px", fontWeight: "400", color: "var(--teal)" }}>Auto-detecting...</span>}
            </label>
            {availableCities.length > 0 ? (
              <select
                className="up-select"
                name="city"
                value={formData.city}
                onChange={handleCityChange}
                required
              >
                <option value="">Select City</option>
                {formData.city && !availableCities.some((c) => c.name.toLowerCase() === formData.city.toLowerCase()) && (
                  <option value={formData.city}>{formData.city}</option>
                )}
                {availableCities.map((c, idx) => (
                  <option key={`${c.countryCode}-${c.stateCode}-${c.name}-${idx}`} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="up-input"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleCityChange}
                placeholder={formData.state ? "Type your city" : "Select state first"}
                required
              />
            )}
          </div>

          <div className="up-form-group">
            <label className="up-form-label">Postal Code *</label>
            <input
              className="up-input"
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handlePostalCodeChange}
              onBlur={handlePostalCodeBlur}
              placeholder="Enter postal code"
              required
            />
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="up-form-footer">
          {onClose && !creation && (
            <button type="button" className="up-btn-cancel" onClick={onClose}>
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="up-btn-primary"
            disabled={loading || uploading}
          >
            {loading ? "Saving…" : creation ? "Continue →" : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default LevelOneModal;