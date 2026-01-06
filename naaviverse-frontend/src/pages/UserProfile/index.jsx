import React, { useState, useRef, useEffect, useContext } from "react";
import styles from "./level3.module.scss"
import './LevelTwoProfile.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../accDashbaoard/accDashboard.scss";
import { useStore } from "../../components/store/store.ts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Dashsidebar from "../../components/dashsidebar/dashsidebar";
import {
  GetFollowersPerAccount,
  GetCategoriesAcc,
  GetAllCustomerLicenses,
  // GetLogServices,
  // GetAllCurrencies,
  // CreatePopularService,
  CheckStatusNaaviProfile,
} from "../../services/accountant";
import * as jose from "jose";
import { LoadingAnimation1 } from "../../components/LoadingAnimation1";
import {
  InputDivsCheck,
  InputDivsTextArea1,
  InputDivsWithMT,
  InputDivsWithColorCode,
  InputDivCounty,
} from "../../components/createAccountant/CreatePlanB";
import {

  InputDivsCheckFunctionality,
  InputDivsCheckFunctionality1,
  ImageUploadDivCoverPic1,
  ImageUploadProfilePic2,
  ImageUploadDivProfilePic,
  ImageUploadDivCoverPic,
} from "../accProfile/AccProfile";

// images
import searchic from "../../static/images/dashboard/searchic.svg";
import downarrow from "../../static/images/dashboard/downarrow.svg";
import uploadv from "../../static/images/dashboard/uploadv.svg";
import profile from "../../static/images/dashboard/profile.svg";
import closepop from "../../static/images/dashboard/closepop.svg";
import profilea from "../../static/images/dashboard/profilea.svg";
import support from "../../static/images/dashboard/support.svg";
import settings from "../../static/images/dashboard/settings.svg";
import sidearrow from "../../static/images/dashboard/sidearrow.svg";
import logout from "../../static/images/dashboard/logout.svg";
import upgif from "../../static/images/dashboard/upgif.gif";
import lg1 from "../../static/images/login/lg1.svg";
import close from "../../images/close.svg";
import colorArrow from "../../images/colorArrow.svg";
import edit from "../../images/edit.svg";
import downArrow from "../../images/downArrow.svg";
import upArrow from "../../images/upArrow.svg";
import LevelThree from "./LevelThree.jsx";
// import { useCoinContextData } from "../../context/CoinContext.js";
import MenuNav from "../../components/MenuNav/index.jsx";
import AWS from "aws-sdk";
import uploadGrey from "../../images/uploadGrey.svg";


const UserProfile = () => {
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  const { accsideNav, setaccsideNav, ispopular, setispopular, setsideNav } =
    useStore();
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchaseLoading, setIsPurchaseLoading] = useState(false);
  const [isCatoading, setIsCatLoading] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [followCount, setfollowCount] = useState(0);
  const [followData, setfollowData] = useState([]);
  const [coverImageS3url, setCoverImageS3url] = useState("");
  const [pstep, setpstep] = useState(1);
  const [selectNew, setselectNew] = useState("");
  const [billingType, setbillingType] = useState("");
  const [categoriesData, setcategoriesData] = useState([]);
  const [purchaseData, setPurchaseData] = useState([]);
  const [selectCategory, setselectCategory] = useState("");
  const [serviceNameInput, setServiceNameInput] = useState("");
  const [serviceCodeInput, setServiceCodeInput] = useState("");
  const [productLabel, setProductLabel] = useState("");
  const [serviceTagline, setServiceTagline] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const [isCurrencies, setIsCurrencies] = useState(false);
  const [allCurrencies, setallCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState({});
  const [firstMonthPrice, setfirstMonthPrice] = useState("");
  const [monthlyPrice, setmonthlyPrice] = useState("");
  const [gracePeriod, setgracePeriod] = useState("");
  const [secondChargeAttempt, setsecondChargeAttempt] = useState("");
  const [thirdChargeAttempt, setthirdChargeAttempt] = useState("");
  const [image, setImage] = useState(null);
  const [checking, setChecking] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [isServicesAcc, setIsServicesAcc] = useState(false);
  const [servicesAcc, setservicesAcc] = useState([]);
  const [isProfileData, setIsProfileData] = useState(false);
  const [profileDataId, setProfileDataId] = useState();
  const [profileData, setProfileData] = useState({});
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(true);
const [accountStatusFetched, setAccountStatusFetched] = useState(false);






  // If you're using this state, define it:
  const [selectedDropDown, setSelectedDropDown] = useState("");
  const [uploading, setUploading] = useState(false);
  const setFunc = (value) => {
    setProfilePicture(value);
  };



  // create user profile level one
  const [createBrandProfile, setCreateBrandProfile] = useState(false);
  const [createBrandProfileStep, setCreateBrandProfileStep] = useState(1);
  const [profilePicture, setProfilePicture] = useState();
  const [fullName, setFullName] = useState();
  const [phoneNo, setPhoneNo] = useState();
  const [userName, setUserName] = useState("");
  const [country, setCountry] = useState();
  const [selectState, setSelectState] = useState();
  const [city, setCity] = useState();
  const [postalCode, setPostalCode] = useState();
  const [isloading, setIsloading] = useState(false);
  const [accStatus, setAccStatus] = useState("");
  const [showLevel, setShowLevel] = useState(null);
  const [hidden1, setHidden1] = useState(false);
  const [hidden2, setHidden2] = useState(false);
  const [hidden3, setHidden3] = useState(false);
  const [userNameAvailable, setUserNameAvailable] = useState(false);
  const [changing, setChanging] = useState(false);
  const [loading, setLoading] = useState(false);

  let navigate = useNavigate();

  // edit accountant data
  const [editProfilePic, setEditProfilePic] = useState(false);
  const [editCountry, setEditCountry] = useState(false);
  const [editAddress, setEditAddress] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(false);
  const [editPhoneNo, setEditPhoneNo] = useState(false);
  const [editDescription, setEditDescription] = useState(false);
  const [editCoverPic, setEditCoverPic] = useState(false);
  const [editColorCode, setEditColorCode] = useState(false);
  const [editPartneringInstitutions, setEditPartneringInstitutions] =
    useState(false);
  const [editCategory, setEditCategory] = useState(false);
  const [editSubCategory, setEditSubCategory] = useState(false);
  const [editSpecialities, setEditSpecialities] = useState(false);

  //accountant profile new values
  const [newAddress, setNewAddress] = useState();
  const [newDisplayName, setNewDisplayName] = useState();
  const [newPhoneNo, setNewPhoneNo] = useState();
  const [newDescription, setNewDescription] = useState();
  const [newColorCode, setNewColorCode] = useState();
  const [newCountry, setNewCountry] = useState();
  const [newPartneringInstitutions, setNewPartneringInstitutions] = useState();
  const [newAutoDeposit, setNewAutoDeposit] = useState();
  const [newCashBack, setNewCashBack] = useState();
  const [newCategory, setNewCategory] = useState(false);
  const [newSubCategory, setNewSubCategory] = useState();
  const [newSpecialities, setNewSpecialities] = useState(false);
  const [newCoverPic, setNewCoverPic] = useState(false);
  const [newProfilePic, setNewProfilePic] = useState();
  const [previewUrl, setPreviewUrl] = useState(null);


  const userDetails = JSON.parse(localStorage.getItem("user"));

  // upload part starts here
  // AWS.config.update({
  //   accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  //   secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  //   region: process.env.REACT_APP_AWS_REGION
  // });

  // // Create an S3 instance
  // const s3 = new AWS.S3();

  // const uploadCoverImage = async (file) => {
  //   const params = {
  //     Bucket: 'naaviprofileuploads',
  //     Key: file.name,
  //     Body: file,
  //     ContentType: file.type,
  //   };

  //   try {
  //     const result = await s3.upload(params).promise();
  //     console.log('File uploaded successfully:', result);

  //     // Update profilePicture state with the URL of the uploaded image
  //     setProfilePicture(result.Location); // Use result.Location to get the URL
  //   } catch (error) {
  //     console.error('Error uploading file:', error);
  //   }
  // };

  // upload end here

  // profile level 2
const [createLevelTwo, setCreateLevelTwo] = useState(false); // FIXED: uppercase 'L'
const [createLevelThree, setCreateLevelThree] = useState(false);
const [levelTwoStep, setLevelTwoStep] = useState(1);
const [levelTwoFields, setLevelTwoFields] = useState({
  financialSituation: "",
  school: "",
  performance: "",
  curriculum: "",
  stream: "",
  grade: "",
  linkedin: "",
});
const [levelTwoLoading, setLevelTwoLoading] = useState(false);
const [allLev2Filled, setAllLev2Filled] = useState(false);

const areAllLev2KeysFilled = (state) => {
  for (const key in state) {
    if (state[key] === "") {
      setAllLev2Filled(false);
      return;
    }
  }
  setAllLev2Filled(true);
};

useEffect(() => {
  areAllLev2KeysFilled(levelTwoFields);
}, [levelTwoFields]);


  const handleCategories = () => {
    setIsCatLoading(true);
    GetCategoriesAcc()
      .then((res) => {
        let result = res.data;
        if (result.status) {
          setcategoriesData(result.categories);
          setIsCatLoading(false);
        }
      })
      .catch((err) => {
        setIsCatLoading(false);
        console.log(err, "jkjkk");
        toast.error("Something Went Wrong!", {
          position: toast.POSITION.TOP_RIGHT,
        });
      });
  };

  // const handleGetCurrencies = () => {
  //   setIsCurrencies(true);
  //   GetAllCurrencies()
  //     .then((res) => {
  //       let result = res.data;
  //       if (result.status) {
  //         setallCurrencies(result.coins);
  //         setIsCurrencies(false);
  //       }
  //     })
  //     .catch((err) => {
  //       console.log(err, "jkjkk");
  //       setIsCurrencies(false);
  //       toast.error("Something Went Wrong!", {
  //         position: toast.POSITION.TOP_RIGHT,
  //       });
  //     });
  // };




  const handleCheckUsername = async () => {
    if (!userName) return;
    setChecking(true); // <-- Start loading
    try {
      const res = await axios.get('/api/users/check-username?username=' + userName);
      setUserNameAvailable(res.data.available); // <-- Available or unavailable
    } catch (err) {
      setUserNameAvailable(null); // <-- Error checking
    }
    setChecking(false); // <-- Stop loading
  };






  // <div style={{ display: "flex", alignItems: "center" }}>
  //   <InputDivsCheckFunctionality1
  //     heading="Select a username *"
  //     placeholderText="Username..."
  //     setFunc={value => {
  //       setUserName(value);
  //       setUserNameAvailable(null);
  //     }}
  //     funcValue={userName}
  //     userNameAvailable={userNameAvailable}
  //   />
  //   <button
  //     type="button"
  //     onClick={handleCheckUsername}
  //     disabled={checking}
  //     style={{
  //       marginLeft: "8px",
  //       background:
  //         checking ? "#ffc107" : // Yellow while checking
  //           userNameAvailable === true ? "#28a745" : // Green if available
  //             userNameAvailable === false ? "#dc3545" : // Red if unavailable
  //               "#263657", // Default color
  //       color: "#fff",
  //       border: "none",
  //       borderRadius: "20px",
  //       padding: "0.7rem 1.5rem",
  //       fontWeight: "bold",
  //       cursor: checking ? "not-allowed" : "pointer"
  //     }}
  //   >
  //     {checking ? "Checking..." : "Check"}
  //   </button>

  //   {userNameAvailable === true && (
  //     <span style={{ color: "green" }}>Username is available</span>
  //   )}
  //   {userNameAvailable === false && userName && (
  //     <span style={{ color: "red" }}>Username is unavailable</span>
  //   )}




  //   <button
  //     type="button"
  //     style={{
  //       marginLeft: "8px",
  //       background: "#263657",
  //       color: "#fff",
  //       border: "none",
  //       borderRadius: "20px",
  //       padding: "0.7rem 1.5rem",
  //       fontWeight: "bold",
  //       cursor: "pointer"
  //     }}
  //     onClick={handleCheckUsername}
  //   >
  //     Check
  //   </button>
  // </div>
  // {
  //   userNameAvailable === true && (
  //     <span style={{ color: "green" }}>Username is available</span>
  //   )
  // }
  // {
  //   userNameAvailable === false && (
  //     <span style={{ color: "red" }}>Username is unavailable</span>
  //   )
  // }


  const [countryApiValue, setCountryApiValue] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(""); // Store selected country
  const [stateApiValue, setStateApiValue] = useState([]);
  const [cityApiValue, setCityApiValue] = useState([]);

  // Fetch countries
  useEffect(() => {
    axios.get('/api/countries')
      .then((response) => {
        const sortedCountries = response.data.sort((a, b) =>
          a.name.common.localeCompare(b.name.common)
        );
        setCountryApiValue(sortedCountries);
      })
      .catch((error) => {
        console.error('Error fetching countries:', error);
      });
  }, []);

  // Fetch states
  useEffect(() => {
    axios.get('/api/states')
      .then((response) => {
        setStateApiValue(response.data);
      })
      .catch((error) => {
        console.error('Error fetching states:', error);
      });
  }, []);

  // Fetch cities
  useEffect(() => {
    axios.get('http://localhost:4545/api/cities')
      .then((response) => {
        setCityApiValue(response.data);
      })
      .catch((error) => {
        console.error('Error fetching cities:', error);
      });
  }, []);


  const resetpop = () => {
    setispopular(false);
    setpstep(1);
    setbillingType("");
    setselectNew("");
    setselectCategory("");
    setcategoriesData([]);
    setSearch("");
    setSelectedCurrency({});
    setServiceNameInput("");
    setServiceCodeInput("");
    setProductLabel("");
    setServiceTagline("");
    setServiceDescription("");
    setfirstMonthPrice("");
    setmonthlyPrice("");
    setgracePeriod("");
    setsecondChargeAttempt("");
    setthirdChargeAttempt("");
    setfirstMonthPrice("");
    setmonthlyPrice("");
    setgracePeriod("");
    setsecondChargeAttempt("");
    setthirdChargeAttempt("");
    setCoverImageS3url("");
    setImage(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileInputChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setUploading(true); // Show uploading indicator

    // Generate a preview URL
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result); // Set preview URL
    reader.readAsDataURL(selectedFile); // Read file as Data URL

    try {
      // Fetch presigned URL from backend
      const response = await fetch('/api/get-presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get presigned URL: ${response.statusText}`);
      }

      const data = await response.json();
      const presignedUrl = data.presignedUrl;

      if (!presignedUrl) {
        throw new Error('Presigned URL not received from server');
      }

      // Upload the file to S3 using the presigned URL
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': selectedFile.type,
        },
        body: selectedFile,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
      }

      console.log('✅ File uploaded successfully');

      // Generate the file URL
      const fileUrl = `https://thenaaviversebucket.s3.amazonaws.com/${selectedFile.name}`;
      setProfilePicture(fileUrl); // Update the profile picture state

    } catch (error) {
      console.error('❌ Error uploading file:', error);
    } finally {
      setUploading(false); // Hide uploading indicator
    }
  };


  const handleFinalSubmit = () => {
    setIsSubmit(true);
    let userDetails = JSON.parse(localStorage.getItem("user"));
    let objmonthly = {
      email: userDetails.email,
      token: userDetails.idToken,
      product_code: serviceCodeInput,
      product_name: serviceNameInput,
      product_icon: coverImageS3url,
      revenue_account: userDetails.email,
      client_app: "naavi",
      product_category_code: "CoE",
      sub_category_code: "",
      custom_product_label: productLabel,
      points_creation: false,
      sub_text: serviceTagline,
      full_description: serviceDescription,
      first_purchase: {
        price: firstMonthPrice !== "" ? parseFloat(firstMonthPrice) : 0,
        coin: selectedCurrency.coinSymbol,
      },
      billing_cycle: {
        monthly: {
          price:
            billingType === "One Time"
              ? firstMonthPrice !== ""
                ? parseFloat(firstMonthPrice)
                : 0
              : monthlyPrice !== ""
                ? parseFloat(monthlyPrice)
                : 0,
          coin: selectedCurrency.coinSymbol,
        },
      },
      grace_period:
        billingType === "One Time"
          ? 0
          : gracePeriod !== ""
            ? parseFloat(gracePeriod)
            : 0,
      first_retry:
        billingType === "One Time"
          ? 0
          : secondChargeAttempt !== ""
            ? parseFloat(secondChargeAttempt)
            : 0,
      second_retry:
        billingType === "One Time"
          ? 0
          : thirdChargeAttempt !== ""
            ? parseFloat(thirdChargeAttempt)
            : 0,
      staking_allowed: false,
      staking_details: {},
    };

    let objone = {
      email: userDetails.email,
      token: userDetails.idToken,
      product_code: serviceCodeInput,
      product_name: serviceNameInput,
      product_icon: coverImageS3url,
      revenue_account: userDetails.email,
      client_app: "naavi",
      product_category_code: "CoE",
      sub_category_code: "",
      custom_product_label: productLabel,
      points_creation: false,
      sub_text: serviceTagline,
      full_description: serviceDescription,
      first_purchase: {
        price: firstMonthPrice !== "" ? parseFloat(firstMonthPrice) : 0,
        coin: selectedCurrency.coinSymbol,
      },
      billing_cycle: {
        lifetime: {
          price:
            billingType === "One Time"
              ? firstMonthPrice !== ""
                ? parseFloat(firstMonthPrice)
                : 0
              : monthlyPrice !== ""
                ? parseFloat(monthlyPrice)
                : 0,
          coin: selectedCurrency.coinSymbol,
        },
      },
      grace_period:
        billingType === "One Time"
          ? 0
          : gracePeriod !== ""
            ? parseFloat(gracePeriod)
            : 0,
      first_retry:
        billingType === "One Time"
          ? 0
          : secondChargeAttempt !== ""
            ? parseFloat(secondChargeAttempt)
            : 0,
      second_retry:
        billingType === "One Time"
          ? 0
          : thirdChargeAttempt !== ""
            ? parseFloat(thirdChargeAttempt)
            : 0,
      staking_allowed: false,
      staking_details: {},
    };

    let obj = billingType === "One Time" ? objone : objmonthly;
    // CreatePopularService(obj)
    //   .then((res) => {
    //     let result = res.data;
    //     if (result.status) {
    //       setpstep(7);
    //       setbillingType("");
    //       setselectNew("");
    //       setselectCategory("");
    //       setcategoriesData([]);
    //       setSearch("");
    //       setSelectedCurrency({});
    //       setServiceNameInput("");
    //       setServiceCodeInput("");
    //       setProductLabel("");
    //       setServiceTagline("");
    //       setServiceDescription("");
    //       setfirstMonthPrice("");
    //       setmonthlyPrice("");
    //       setgracePeriod("");
    //       setsecondChargeAttempt("");
    //       setthirdChargeAttempt("");
    //       setfirstMonthPrice("");
    //       setmonthlyPrice("");
    //       setgracePeriod("");
    //       setsecondChargeAttempt("");
    //       setthirdChargeAttempt("");
    //       setIsSubmit(false);
    //       setCoverImageS3url("");
    //       setImage(null);
    //     }
    //   })
    //   .catch((err) => {
    //     setIsSubmit(false);
    //   });
  };

 useEffect(() => {
  setsideNav("");
  handleProfileData();
}, []);


  const myTimeout1 = () => {
    setTimeout(reload1, 3000);
  };

  function reload1() {
    //setCreateBrandProfile(false);
    setCreateBrandProfileStep(1);
    setProfilePicture("");
    setFullName("");
    setUserName("");
    setSelectState("");
    setCity("");
    setPhoneNo("");
    setPostalCode("");
    handleProfileData();
    setCreateLevelTwo(false);
    setLevelTwoStep(1);
    setLevelTwoFields({
      financialSituation: "",
      school: "",
      performance: "",
      curriculum: "",
      stream: "",
      grade: "",
      linkedin: "",
    });
  }

  const handleProfileData = async () => {
    const mailId = userDetails?.email;

try {
  const response = await axios.get(`/api/users/get/${mailId}`);
  const result = response.data;

  console.log("API Response:", result);

  if (result?.status) {
    const profile = result?.data;
    const userLevel = profile?.user_level || 0;

    // 🔥 SINGLE SOURCE OF TRUTH → user_level
    if (!profile || userLevel === 0) {
      // PROFILE NOT STARTED / INCOMPLETE
      setIsProfileData(false);
      setIsProfileIncomplete(true);
      setCreateBrandProfile(true);
      setCreateBrandProfileStep(1);
      setProfileData({});
      return;
    }

    // PROFILE EXISTS / COMPLETED
    setIsProfileIncomplete(false);
    setCreateBrandProfile(false);
    setIsProfileData(true);
    setProfileData(profile);
    setProfileDataId(profile?._id);
    setPreviewUrl(profile?.profilePicture || "");

    manageLevelAccess(userLevel);
  } else {
    // USER NOT FOUND
    console.log("User profile not found. Redirecting to create profile.");
    setIsProfileData(false);
    setIsProfileIncomplete(true);
    setCreateBrandProfile(true);
    setCreateBrandProfileStep(1);
    setProfileData({});
  }
} catch (err) {
  console.error("Error fetching profile data:", err);
  setIsProfileData(false);
  setIsProfileIncomplete(true);
  setCreateBrandProfile(true);
  setCreateBrandProfileStep(1);
  setProfileData({});
}
  }

  /**
   * Function to dynamically manage button access and behavior based on user level.
   * @param {number} userLevel - The current level of the user.
   */
  const manageLevelAccess = (userLevel) => {
    if (userLevel === 1) {
      console.log('User is at Level 1. Enabling Level 2 button.');
    } else if (userLevel === 2) {
      console.log('User is at Level 2. Enabling Level 3 button.');
    } else if (userLevel === 3) {
      console.log('User has completed all levels.');
    } else {
      console.log('User is at an undefined level or no levels completed.');
    }

    // Add any additional logic here to update state or apply changes to the UI dynamically
  };


  const levelOneProfile = async (email) => {
    if (!fullName || !selectedCountry || !selectState || !city || !postalCode || !profilePicture || !userName || !phoneNo) {
      alert('Please fill out all fields');
      return;
    }

    const body = {
      email: userDetails?.email,
      name: fullName,
      country: selectedCountry,
      state: selectState,
      city,
      postalCode,
      profilePicture,
      username: userName,
      phoneNumber: `+91${phoneNo}`,
    };

    try {
      const response = await axios.post(`/api/users/add`, body);
      const result = response?.data;

      if (result?.status) {
        console.log('Profile created successfully.');
        setIsProfileData(true);
        setCreateBrandProfile(false);

        // Fetch the updated profile data
        await handleProfileData();
      } else {
        console.error('Error creating profile');
      }
    } catch (error) {
      console.error('Error in levelOneProfile:', error);
    }
  };

 useEffect(() => {
  if (userDetails?.email) {
    accountantStatus();
  }
}, [userDetails?.email]);


const accountantStatus = async () => {

  
  try {
    const userEmail = userDetails?.email;

    console.log("Fetching account status for:", userEmail);

    const response = await axios.get(
      `http://localhost:4545/api/users/get/${userEmail}`
    );

    console.log("Account status response:", response.data);

    const category = response?.data?.data?.category;

    if (category === "marketmakers") {
      setAccStatus("Private");
    } else if (category === "accountants") {
      setAccStatus("Public");
    } else {
      setAccStatus("Unknown");
    }
  } catch (error) {
    console.error("Error fetching account status:", error);
  }
};

// ⭐ ADD THIS BELOW THE FUNCTION ⭐
  useEffect(() => {
    if (userDetails?.email) {
      accountantStatus();
    }
  }, [userDetails?.email]);



const changeStatus = async (value) => {
  setChanging(true);

  console.warn("⚠ changeStatus(): skipped dead teller2 API");

  // Fake success
  setAccStatus(value === "marketmakers" ? "Private" : "Public");
  setChanging(false);
};


  const debounce = (fn, delay) => {
    let timerId;
    return (...args) => {
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  };

  // const fetchData = debounce(async () => {
  //   try {
  //     const response = await axios.get(
  //       `/api/users/get`
  //     );

  //     const data = response.data;
  //     // console.log(data, "username data");

  //     if (data?.data && data?.status && userName.length < 1) {
  //       setUserNameAvailable(false);
  //     } else if (!data?.data && data?.status && userName.length > 0) {
  //       setUserNameAvailable(true);
  //     } else {
  //       setUserNameAvailable(false);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching username data:", error);
  //     setUserNameAvailable(false); // Set false in case of an error
  //   }
  // }, 200);

  // useEffect(() => {
  //   fetchData();
  // }, [userName]);
  // const fetchData1 = debounce(async () => {
  //   const response = await fetch(
  //     `https://teller2.apimachine.com/lxUser/checkBankerTag?bankerTag=${brandUserName}`
  //   );
  //   const data = await response.json();
  //   // console.log(data, "username data");
  //   if (data?.data && data?.status && brandUserName.length < 1) {
  //     setUserNameAvailable1(false);
  //   } else if (!data?.data && data?.status && brandUserName.length > 0) {
  //     setUserNameAvailable1(true);
  //   } else {
  //     setUserNameAvailable1(false);
  //   }
  // }, 200);

  // useEffect(() => {
  //   fetchData1();
  // }, [brandUserName]);

  const myTimeout = () => {
    setTimeout(reload, 2000);
  };

  function reload() {
    if (editAddress) {
      setEditAddress(false);
      setNewAddress("");
    } else if (editDisplayName) {
      setEditDisplayName(false);
      setNewDisplayName("");
    } else if (editDescription) {
      setEditDescription(false);
      setNewDescription("");
    } else if (editPhoneNo) {
      setEditPhoneNo(false);
      setNewPhoneNo("");
    } else if (editColorCode) {
      setEditColorCode(false);
      setNewColorCode("");
    } else if (editCountry) {
      setEditCountry(false);
      setNewCountry("");
    }
    // else if (editPartneringInstitutions) {
    //   setEditPartneringInstitutions(false);
    //   setNewPartneringInstitutions("");
    // } else if (editCategory) {
    //   setEditCategory(false);
    //   setNewCategory("");
    // } else if (editSubCategory) {
    //   setEditSubCategory(false);
    //   setNewSubCategory("");
    // } else if (editSpecialities) {
    //   setEditSpecialities(false);
    //   setNewSpecialities("");
    // }
    else if (editCoverPic) {
      setEditCoverPic(false);
      setNewCoverPic("");
    } else if (editProfilePic) {
      setEditProfilePic(false);
      setNewProfilePic("");
    }
    handleProfileData();
  }

const editData = async (field, value) => {
  setLoading(true);

  console.warn("⚠ editData(): skipped dead teller2 API");

  // Fallback: update UI only
  myTimeout();
  setLoading(false);
};

  const levelTwoProfile = () => {
    if (profileDataId) {
      console.log(levelTwoFields, "body");
      console.log(profileDataId, "profileDataIddddd");
      setLevelTwoLoading(true);
      axios
        .put(
          `/api/users/update/${profileDataId}`,
          levelTwoFields
        )
        .then((response) => {
          let result = response?.data;
          // console.log(result, "levelTwoProfile result");
          if (result?.status) {
            setLevelTwoLoading(false);
            setLevelTwoStep(7);
            myTimeout1();
          } else {
            setLevelTwoLoading(false);
          }
        })
        .catch((error) => {
          console.log(error, "error in levelTwoProfile");
        });
    }
  };

  const handleChange = () => {
    if (showDrop) {
      setShowDrop(false);
    }
    navigate("/dashboard/users");
  };

useEffect(() => {
  console.log("PROFILE DEBUG =>", {
    isProfileIncomplete,
    createBrandProfile,
    createBrandProfileStep,
  });
}, [isProfileIncomplete, createBrandProfile]);


  return (
    <div>
      <div className="dashboard-main">
        <div className="dashboard-body">
          <div>
            <Dashsidebar handleChange={handleChange} />
          </div>
          <div
  className="dashboard-screens"
  onClick={(e) => {
    if (e.target.classList.contains("dashboard-screens")) {
      resetpop();
    }
  }}
>

            <div style={{ height: "100%" }}>
              <MenuNav
                showDrop={showDrop}
                setShowDrop={setShowDrop}
                // searchTerm={search}
                // setSearchterm={setSearch}
                searchPlaceholder="Search..."
              />
              <>
                {isProfileData ? (
                  <div
                    className="pf-main"
                    onClick={() => setShowDrop(false)}
                    style={{ padding: "0", height: "calc(100% - 70px)" }}
                  >
                    <div className="pf-left">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          height: "4rem",
                          width: "100%",
                          cursor: "pointer",
                          borderBottom: "0.5px solid #E5E5E5",
                          padding: "0 35px",
                        }}
                        onClick={() => {
                          if (showLevel === 1) {
                            setShowLevel(null);
                          } else {
                            setShowLevel(1);
                          }
                          // setHidden1(!hidden1);
                          // if (hidden2) {
                          //   setHidden2(false);
                          // }
                        }}
                      >
                        <div
                          style={{
                            fontSize: "17px",
                            fontWeight: "500",
                            color: "#1F304F",
                          }}
                        >
                          Naavi Profile Level 1
                        </div>
                        {/* <div
                          
                        >
                          <img src={previewUrl} alt="" />
                        </div> */}
                      </div>

                      <div
                        style={{
                          display: showLevel === 1 ? "flex" : "none",
                          flexDirection: "column",
                          padding: "0 35px",
                          width: "100%",
                          // height: "calc(100% - 4rem)",
                          // overflowY: "scroll",
                          borderBottom: "0.5px solid #e5e5e5",
                        }}
                      >
                        <div
                          style={{
                            marginTop: "30px",
                            position: "relative",
                            width: "100px",
                            height: "100px",
                          }}
                        >
                          {/* <div
                            className="editIconDiv"
                            style={{ top: "-7px", right: "3px" }}
                            onClick={() => {
                              setEditProfilePic(true);
                            }}
                          >
                            <img src={edit} alt="" />
                          </div> */}
                          <img
                            style={{
                              width: "100px",
                              height: "100px",
                              borderRadius: "50%",
                              border: "0.5px solid #e5e5e5",
                            }}
                            src={previewUrl}
                            alt=""
                          />
                        </div>
                        <div className="pfl-box">
                          <div className="pfl-boxl">
                            <div className="pfl-box-label">Email</div>
                            <div
                              className="pfl-box-inp"
                              style={{ textTransform: "lowercase" }}
                            >
                              {profileData?.email}
                            </div>
                          </div>
                          <div className="pfl-boxr">
                            <div className="pfl-box-label">Name</div>
                            <div className="pfl-box-inp">
                              {profileData?.name}
                            </div>
                          </div>
                        </div>
                        <div className="pfl-box">
                          <div className="pfl-boxl">
                            <div className="pfl-box-label">Username</div>
                            <div className="pfl-box-inp">
                              {profileData?.username}
                            </div>
                          </div>
                          <div className="pfl-boxr">
                            <div className="pfl-box-label">User Type</div>
                            <div className="pfl-box-inp">
                              {profileData?.userType}
                            </div>
                          </div>
                        </div>
                        <div className="pfl-box">
                          <div className="pfl-boxl">
                            <div className="pfl-box-label">Country</div>
                            <div className="pfl-box-inp">
                              {/* <div
                                className="editIconDiv"
                                onClick={() => {
                                  setEditCountry(true);
                                }}
                              >
                                <img src={edit} alt="" />
                              </div> */}
                              {profileData?.country}
                            </div>
                          </div>
                          <div className="pfl-boxr">
                            <div className="pfl-box-label">State</div>
                            <div className="pfl-box-inp">
                              {/* <div
                                className="editIconDiv"
                                onClick={() => {
                                  setEditAddress(true);
                                }}
                              >
                                <img src={edit} alt="" />
                              </div> */}
                              <span>{profileData?.state}</span>
                            </div>
                          </div>
                        </div>
                        <div className="pfl-box">
                          <div className="pfl-boxl">
                            <div className="pfl-box-label">City</div>
                            <div className="pfl-box-inp">
                              {/* <div
                                className="editIconDiv"
                                onClick={() => {
                                  setEditCountry(true);
                                }}
                              >
                                <img src={edit} alt="" />
                              </div> */}
                              {profileData?.city}
                            </div>
                          </div>
                          <div className="pfl-boxr">
                            <div className="pfl-box-label">Postal code</div>
                            <div className="pfl-box-inp">
                              {/* <div
                                className="editIconDiv"
                                onClick={() => {
                                  setEditAddress(true);
                                }}
                              >
                                <img src={edit} alt="" />
                              </div> */}
                              <span>{profileData?.postalCode}</span>
                            </div>
                          </div>
                        </div>
                        <div className="pfl-box">
                          <div className="pfl-boxr">
                            <div className="pfl-box-label">Phone Number</div>
                            <div className="pfl-box-inp">
                              {/* <div
                                className="editIconDiv"
                                onClick={() => {
                                  setEditPhoneNo(true);
                                }}
                              >
                                <img src={edit} alt="" />
                              </div> */}
                              {profileData?.phoneNumber}
                            </div>
                          </div>
                          <div className="pfl-boxl">
                            <div className="pfl-box-label">Status</div>
                            <div className="pfl-box-inp">
                              {/* <div
                                className="editIconDiv"
                                onClick={() => {
                                  setEditDisplayName(true);
                                }}
                              >
                                <img src={edit} alt="" />
                              </div> */}
                              {profileData?.status}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          height: "4rem",
                          width: "100%",
                          cursor:
                            profileData?.user_level > 1
                              ? "pointer"
                              : "not-allowed",
                          borderBottom: "0.5px solid #E5E5E5",
                          padding: "0 35px",
                        }}
                        onClick={() => {
                          if (profileData?.user_level > 1) {
                            if (showLevel === 2) {
                              setShowLevel(null);
                            } else {
                              setShowLevel(2);
                            }
                          }
                        }}
                      >
                        <div
                          style={{
                            fontSize: "17px",
                            fontWeight: "500",
                            color: "#1F304F",
                          }}
                        >
                          Naavi Profile Level 2
                        </div>
                        <div
                          style={{
                            transform: showLevel === 2 ? "rotate(180deg)" : "",
                            opacity: profileData?.user_level > 1 ? "1" : "0.25",
                          }}
                        >
                          <img src={downArrow} alt="" />
                        </div>
                      </div>

                      <div
                        style={{
                          display: showLevel === 2 ? "flex" : "none",
                          flexDirection: "column",
                          padding: "0 35px",
                          width: "100%",
                          // height: "calc(100% - 4rem)",
                          // overflowY: "scroll",
                          borderBottom: "0.5px solid #e5e5e5",
                        }}
                      >
                        <div className="pfl-box">
                          <div className="pfl-boxl">
                            <div className="pfl-box-label">Grade</div>
                            <div className="pfl-box-inp">
                              {profileData?.grade}
                            </div>
                          </div>
                          <div className="pfl-boxr">
                            <div className="pfl-box-label">School</div>
                            <div className="pfl-box-inp">
                              {profileData?.school}
                            </div>
                          </div>
                        </div>
                        <div className="pfl-box">
                          <div className="pfl-boxl">
                            <div className="pfl-box-label">Curriculum</div>
                            <div className="pfl-box-inp">
                              {profileData?.curriculum}
                            </div>
                          </div>
                          <div className="pfl-boxr">
                            <div className="pfl-box-label">Stream</div>
                            <div className="pfl-box-inp">
                              {profileData?.stream}
                            </div>
                          </div>
                        </div>
                        <div className="pfl-box">
                          <div className="pfl-boxl">
                            <div className="pfl-box-label">
                              Financial Position
                            </div>
                            <div className="pfl-box-inp">
                              {/* <div
                                className="editIconDiv"
                                onClick={() => {
                                  setEditCountry(true);
                                }}
                              >
                                <img src={edit} alt="" />
                              </div> */}
                              {profileData?.financialSituation}
                            </div>
                          </div>
                          <div className="pfl-boxr">
                            <div className="pfl-box-label">Performance</div>
                            <div className="pfl-box-inp">
                              {/* <div
                                className="editIconDiv"
                                onClick={() => {
                                  setEditAddress(true);
                                }}
                              >
                                <img src={edit} alt="" />
                              </div> */}
                              <span>{profileData?.performance}</span>
                            </div>
                          </div>
                        </div>
                        <div className="pfl-box">
                          <div className="pfl-boxl">
                            <div className="pfl-box-label">Linkedin</div>
                            <div
                              className="pfl-box-inp"
                              style={{ textTransform: "lowercase" }}
                            >
                              {/* <div
                                className="editIconDiv"
                                onClick={() => {
                                  setEditCountry(true);
                                }}
                              >
                                <img src={edit} alt="" />
                              </div> */}
                              {profileData?.linkedin}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          height: "4rem",
                          width: "100%",
                          cursor:
                            profileData?.user_level === 3
                              ? "pointer"
                              : "not-allowed",
                          borderBottom: "0.5px solid #E5E5E5",
                          padding: "0 35px",
                        }}
                        onClick={() => {
                          if (profileData?.user_level > 2) {
                            if (showLevel === 3) {
                              setShowLevel(null);
                            } else {
                              setShowLevel(3);
                            }
                          }
                        }}
                      >
                        <div
                          style={{
                            fontSize: "17px",
                            fontWeight: "500",
                            color: "#1F304F",
                          }}
                        >
                          Naavi Profile Level 3
                        </div>
                        <div
                          style={{
                            transform: showLevel === 3 ? "rotate(180deg)" : "",
                            opacity: profileData?.user_level > 2 ? "1" : "0.25",
                          }}
                        >
                          <img src={downArrow} alt="" />
                        </div>
                      </div>
                      <div
                        style={{
                          display: showLevel === 3 ? "flex" : "none",
                          flexDirection: "column",
                          padding: "0 35px",
                          width: "100%",
                          // height: "calc(100% - 4rem)",
                          // overflowY: "scroll",
                          borderBottom: "0.5px solid #e5e5e5",
                          paddingTop: "20px",
                          paddingBottom: "20px",
                        }}
                      >
                        <div className="pfl-boxl">
                          <div className="pfl-box-label">Personality</div>
                          <div className="pfl-box-inp">
                            {profileData?.personality}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className="pf-right"
                      style={{ minWidth: "30%", height: "100%" }}
                    >
                      <div className="pfr-1" style={{ padding: "0" }}>
                        <div
                          style={{
                            height: "50%",
                            borderBottom: "0.5px solid #ebebeb",
                            padding: "0 30px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-evenly",
                          }}
                        >
                          <div className="pfr-head">Complete Level 2</div>
                          <div
                            className="pfr-btn1"
                            style={{
                              marginTop: "0",
                              color: "white",
                              background:
                                profileData?.user_level === 1
                                  ? "#59A2DD"
                                  : "#8ED8C6",
                              alignItems: "center",
                              cursor:
                                profileData?.user_level === 1
                                  ? "pointer"
                                  : "not-allowed",
                            }}
                            onClick={() => {
                              // console.log(profileDataId, "profileDataId");
                              if (profileData?.user_level === 1) {
                                setCreateLevelTwo(true);
                              }
                            }}
                          >
                            {profileData?.user_level === 2
                              ? "Completed"
                              : profileData?.user_level === 3
                                ? "Completed"
                                : "Start Now"}
                          </div>
                        </div>
                        <div
                          style={{
                            height: "50%",
                            padding: "0 30px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-evenly",
                          }}
                        >
                          <div className="pfr-head">Complete Level 3</div>

                          <div
                            onClick={(e) => {
                              if (profileData?.user_level < 3) {
                                setCreateLevelThree(true);
                              }
                            }}
                            className="pfr-btn1"
                            style={{
                              marginTop: "0",
                              color: "white",
                              background:
                                profileData?.user_level === 2
                                  ? "#59A2DD"
                                  : "#8ED8C6",
                              alignItems: "center",
                              cursor:
                                profileData?.user_level === 2
                                  ? "pointer"
                                  : "not-allowed",
                            }}
                          >
                            {profileData?.user_level === 3
                              ? "Completed"
                              : "Start Now"}
                          </div>
                        </div>
                      </div>
                      <div className="pfr-1">
                        <div>
                          <div className="pfr-head">Change Password</div>
                          <div className="pfr-desc">
                            Click Here To Change Your Password. You Will Need To Verify Your Email Again To Reset Your Password.
                          </div>
                        </div>
                        <button
                          className="pfr-btn"
                          style={{
                            background: "#59A2DD",
                            color: "#fff",
                            cursor: "pointer",
                            border: "none",
                            borderRadius: "2rem",
                            fontWeight: 600,
                            padding: "1rem 2.5rem",
                            margin: "1rem 0",
                            opacity: 1 // always enabled
                          }}
                          onClick={() => setShowChangePasswordModal(true)}
                        >
                          Change Password
                        </button>
                      </div>
                      <div className="pfr-2">
                        <div>
                          <div className="pfr-head">Enable 2FA</div>
                          <div className="pfr-desc">
                            For An Additional Layer Of Security You Can Enable 2 Factor Authentication Via Google Authenticator.
                          </div>
                        </div>
                        <button
                          className="pfr-btn"
                          style={{
                            background: "#59A2DD",
                            color: "#fff",
                            cursor: "pointer",
                            border: "none",
                            borderRadius: "2rem",
                            fontWeight: 600,
                            padding: "1rem 2.5rem",
                            margin: "1rem 0",
                            opacity: 1 // always enabled
                          }}
                          onClick={() => setShow2FAModal(true)}
                        >
                          Enable 2FA
                        </button>
                      </div>


                      {changing && (
                        <div
                          className="loading-component"
                          style={{
                            top: "70px",
                            right: "0",
                            minWidth: "calc(80vw - 56%)",
                            height: "calc(100% - 70px)",
                            position: "absolute",
                            display: "flex",
                          }}
                        >
                          <LoadingAnimation1 icon={lg1} width={200} />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {isProfileIncomplete && (
                      <div
  className="create-acc"
  onClick={() => {
    setIsProfileIncomplete(true);
    setCreateBrandProfile(true);
    setCreateBrandProfileStep(1);
    setShowDrop(false);
  }}
>

                        <div>Complete Your User Profile</div>
                        <div>
                          <img src={colorArrow} alt="" />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            </div>
          </div>
        </div>
      </div>

      <>
        {ispopular ? (
          <div
            className="acc-popular"
            onClick={() => setShowDrop(false)}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="acc-popular-top">
              <div className="acc-popular-head">
                {pstep > 1 ? "New Service" : "Popular Actions"}
              </div>
              <div
                className="acc-popular-img-box"
                onClick={() => resetpop()}
                style={{ cursor: "pointer" }}
              >
                <img className="acc-popular-img" src={closepop} alt="" />
              </div>
            </div>
            <>
              {pstep === 1 ? (
                <div>
                  <div className="acc-step-text">New</div>
                  <div>
                    <div
                      className="acc-step-box"
                      onClick={() => {
                        setselectNew("Service");
                        setpstep(2);
                      }}
                      style={{
                        background: selectNew === "Service" ? "#182542" : "",
                        color: selectNew === "Service" ? "#FFF" : "",
                      }}
                    >
                      Service
                    </div>
                    <div
                      className="acc-step-box"
                      onClick={() => {
                        setselectNew("Task");
                        setpstep(2);
                      }}
                      style={{
                        background: selectNew === "Task" ? "#182542" : "",
                        color: selectNew === "Task" ? "#FFF" : "",
                      }}
                    >
                      Task
                    </div>
                    <div
                      className="acc-step-box"
                      onClick={() => {
                        setselectNew("Article");
                        setpstep(2);
                      }}
                      style={{
                        background: selectNew === "Article" ? "#182542" : "",
                        color: selectNew === "Article" ? "#FFF" : "",
                      }}
                    >
                      Article
                    </div>
                    <div
                      className="acc-step-box"
                      onClick={() => {
                        setselectNew("Video");
                        setpstep(2);
                      }}
                      style={{
                        background: selectNew === "Video" ? "#182542" : "",
                        color: selectNew === "Video" ? "#FFF" : "",
                      }}
                    >
                      Video
                    </div>
                  </div>
                </div>
              ) : pstep === 2 ? (
                <div>
                  <div className="acc-step-text">Select Billing Type</div>
                  <div>
                    <div
                      className="acc-step-box"
                      onClick={() => {
                        setbillingType("Monthly Subscription");
                        handleCategories();
                        setpstep(3);
                      }}
                      style={{
                        background:
                          billingType === "Monthly Subscription"
                            ? "#182542"
                            : "",
                        color:
                          billingType === "Monthly Subscription" ? "#FFF" : "",
                      }}
                    >
                      Monthly Subscription
                    </div>
                    <div
                      className="acc-step-box"
                      onClick={() => {
                        setbillingType("One Time");
                        handleCategories();
                        setpstep(3);
                      }}
                      style={{
                        background: billingType === "One Time" ? "#182542" : "",
                        color: billingType === "One Time" ? "#FFF" : "",
                      }}
                    >
                      One Time
                    </div>
                    <div
                      className="acc-step-box"
                      // onClick={() => {
                      //   setbillingType("Staking");
                      //   handleCategories();
                      //   setpstep(3);
                      // }}
                      style={{
                        opacity: "0.4",
                        cursor: "not-allowed",
                        background: billingType === "Staking" ? "#182542" : "",
                        color: billingType === "Staking" ? "#FFF" : "",
                      }}
                    >
                      Staking
                    </div>
                  </div>
                  <div
                    className="goBack"
                    onClick={() => {
                      setpstep(1);
                      setbillingType("");
                    }}
                  >
                    Go Back
                  </div>
                </div>
              ) : pstep === 3 ? (
                <div>
                  <div className="acc-step-text">
                    How would you categorize this product?
                  </div>
                  <>
                    {isCatoading ? (
                      <div className="acc-step-allbox">
                        {[1, 2, 3].map((each, i) => (
                          <div className="acc-step-box">
                            <Skeleton style={{ width: "150px" }} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="acc-step-allbox">
                        {categoriesData.map((each, i) => (
                          <div
                            className="acc-step-box"
                            onClick={() => {
                              setselectCategory(each.name);
                              setpstep(4);
                            }}
                            style={{
                              background:
                                selectCategory === each.name ? "#182542" : "",
                              color: selectCategory === each.name ? "#FFF" : "",
                            }}
                          >
                            {each.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                  <div
                    className="goBack"
                    onClick={() => {
                      setpstep(2);
                      setselectCategory("");
                    }}
                  >
                    Go Back
                  </div>
                </div>
              ) : pstep === 4 ? (
                <div>
                  <div className="acc-step-text">Service Information</div>
                  <div className="acc-step-allbox1">
                    <div className="acc-upload">
                      <div className="acc-upload-title">
                        Upload Profile Image
                      </div>
                      <div className="acc-upload-imgbox">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileInputChange}
                          style={{ display: "none" }}
                          ref={fileInputRef}
                        />
                        <img
                          className="acc-upload-img"
                          src={
                            isUploadLoading
                              ? upgif
                              : coverImageS3url !== ""
                                ? coverImageS3url
                                : uploadv
                          }
                          alt=""
                          onClick={handleImageClick}
                        />
                      </div>
                    </div>
                    <div className="acc-step-box">
                      <input
                        className="acc-step-input"
                        type="text"
                        placeholder="Service Name"
                        value={serviceNameInput}
                        onChange={(e) => setServiceNameInput(e.target.value)}
                      />
                    </div>
                    <div className="acc-step-box">
                      <input
                        className="acc-step-input"
                        type="text"
                        placeholder="Service Code"
                        value={serviceCodeInput}
                        onChange={(e) => setServiceCodeInput(e.target.value)}
                      />
                    </div>
                    <div className="acc-step-box">
                      <input
                        className="acc-step-input"
                        type="text"
                        placeholder="Product Label"
                        value={productLabel}
                        onChange={(e) => setProductLabel(e.target.value)}
                      />
                    </div>
                    <div className="acc-step-box">
                      <input
                        className="acc-step-input"
                        type="text"
                        placeholder="Service Tagline"
                        value={serviceTagline}
                        onChange={(e) => setServiceTagline(e.target.value)}
                      />
                    </div>
                    <div className="acc-step-box1">
                      <textarea
                        className="acc-step-input1"
                        type="text"
                        placeholder="Service Description"
                        value={serviceDescription}
                        onChange={(e) => setServiceDescription(e.target.value)}
                      />
                    </div>
                    <div>
                      <div
                        className="goNext"
                        onClick={() => {
                          // handleGetCurrencies();
                          setpstep(5);
                        }}
                      >
                        Next Step
                      </div>
                      <div
                        className="goBack1"
                        onClick={() => {
                          setpstep(3);
                          setServiceNameInput("");
                          setServiceCodeInput("");
                          setProductLabel("");
                          setServiceTagline("");
                          setServiceDescription("");
                          setCoverImageS3url("");
                          setImage(null);
                        }}
                      >
                        Go Back
                      </div>
                    </div>
                  </div>
                </div>
              ) : pstep === 5 ? (
                <div>
                  <div className="acc-step-text">
                    What currency do you want to collect?
                  </div>
                  <>
                    {isCurrencies ? (
                      <div className="acc-step-allbox">
                        {[1, 2, 3].map((each, i) => (
                          <div className="acc-step-box">
                            <Skeleton style={{ width: "150px" }} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="acc-step-allbox">
                        {allCurrencies.map((each, i) => (
                          <div
                            className="acc-step-box"
                            onClick={() => {
                              setSelectedCurrency(each);
                              setpstep(6);
                            }}
                            style={{
                              background:
                                selectedCurrency === each ? "#182542" : "",
                              color: selectedCurrency === each ? "#FFF" : "",
                            }}
                          >
                            {each.coinName}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                  <div
                    className="goBack"
                    onClick={() => {
                      setpstep(4);
                      setSelectedCurrency({});
                    }}
                  >
                    Go Back
                  </div>
                </div>
              ) : pstep === 6 ? (
                <div>
                  <div className="acc-step-text">Pricing Information</div>
                  <div className="acc-step-allbox1">
                    <div className="acc-step-box">
                      <input
                        className="acc-step-input2"
                        type="number"
                        placeholder={
                          billingType === "One Time"
                            ? "Service Price"
                            : "First Months Price"
                        }
                        value={firstMonthPrice}
                        onChange={(e) => setfirstMonthPrice(e.target.value)}
                        onWheel={(e) => e.target.blur()}
                      />
                      <div className="acc-step-feildHead">
                        {selectedCurrency.coinSymbol}
                      </div>
                    </div>
                    <div
                      className="acc-step-box"
                      style={{
                        display: billingType === "One Time" ? "none" : "",
                      }}
                    >
                      <input
                        className="acc-step-input2"
                        type="number"
                        placeholder="Monthly Price"
                        value={monthlyPrice}
                        onChange={(e) => setmonthlyPrice(e.target.value)}
                        onWheel={(e) => e.target.blur()}
                      />
                      <div className="acc-step-feildHead">
                        {selectedCurrency.coinSymbol}
                      </div>
                    </div>
                    <div
                      className="acc-step-box"
                      style={{
                        display: billingType === "One Time" ? "none" : "",
                      }}
                    >
                      <input
                        className="acc-step-input2"
                        type="number"
                        placeholder="Grace Period"
                        value={gracePeriod}
                        onChange={(e) => setgracePeriod(e.target.value)}
                        onWheel={(e) => e.target.blur()}
                      />
                      <div className="acc-step-feildHead">Days</div>
                    </div>
                    <div
                      className="acc-step-box"
                      style={{
                        display: billingType === "One Time" ? "none" : "",
                      }}
                    >
                      <input
                        className="acc-step-input2"
                        type="number"
                        placeholder="Second Charge Attempt"
                        value={secondChargeAttempt}
                        onChange={(e) => setsecondChargeAttempt(e.target.value)}
                        onWheel={(e) => e.target.blur()}
                      />
                      <div className="acc-step-feildHead">Days</div>
                    </div>
                    <div
                      className="acc-step-box"
                      style={{
                        display: billingType === "One Time" ? "none" : "",
                      }}
                    >
                      <input
                        className="acc-step-input2"
                        type="number"
                        placeholder="Third Charge Attempt"
                        value={thirdChargeAttempt}
                        onChange={(e) => setthirdChargeAttempt(e.target.value)}
                        onWheel={(e) => e.target.blur()}
                      />
                      <div className="acc-step-feildHead">Days</div>
                    </div>
                    <div>
                      <div
                        style={{
                          position:
                            billingType === "One Time" ? "fixed" : "initial",
                          bottom: billingType === "One Time" ? "0px" : "",
                        }}
                      >
                        <div
                          className="goNext"
                          onClick={() => {
                            handleFinalSubmit();
                          }}
                        >
                          Submit
                        </div>
                        <div
                          className="goBack1"
                          onClick={() => {
                            setpstep(5);
                            setfirstMonthPrice("");
                            setmonthlyPrice("");
                            setgracePeriod("");
                            setsecondChargeAttempt("");
                            setthirdChargeAttempt("");
                          }}
                        >
                          Go Back
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    {isSubmit ? (
                      <div className="popularlogo">
                        <img className="popularlogoimg" src={lg1} alt="" />
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              ) : pstep === 7 ? (
                <div className="success-box">
                  You Have Successfully Created A New Service
                </div>
              ) : (
                ""
              )}
            </>
          </div>
        ) : (
          ""
        )}
      </>



      <>
        {createBrandProfile && (
  <div
    className={createLevelThree ? "popularS1" : "popularS"}
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 999999,        // 🔥 KEY FIX
      background: "white",
      overflowY: "auto",
    }}
  >
            {createBrandProfileStep === 1 && (
              <>
                <div className="head-txt" style={{ height: "4rem" }}>
                  <div>Naavi Profile Level One</div>
                  <div
                    onClick={() => {
                      setCreateBrandProfile(false);
                      setUserName("");
                      setFullName("");
                      setProfilePicture("");
                      setSelectedCountry("");
                      setSelectState("");
                      setCity("");
                      setPostalCode("");
                    }}
                    className="close-div"
                  >
                    <img src={close} alt="" />
                  </div>
                </div>
                <div
                  className="overall-div"
                  style={{ height: "calc(100% - 4rem)" }}
                >
                  <div
                    style={{
                      marginBottom: "0.5rem",
                      fontSize: "1rem",
                      marginTop: "2rem",
                    }}
                  >
                    Upload Profile Picture *
                  </div>
                  <ImageUploadDivCoverPic
  setFunc={setProfilePicture}
  funcValue={profilePicture}
/>

                  <div
                    className="imageUploadDiv"
                    onClick={() => setSelectedDropDown("")}
                    style={{
                      minWidth: "140px",
                      minHeight: "140px",
                      maxWidth: "140px",
                      maxHeight: "140px",
                      border: "0.5px solid #e7e7e7",
                      borderRadius: "50%",
                    }}
                  >
                    {profilePicture ? (
                      <div
                        className="imageDiv"
                        style={{ height: "100%", width: "100%", marginRight: "0" }}
                      >
                        <img
                          src={`${profilePicture}?${new Date().getTime()}`}  // Display uploaded profile picture
                          alt="UploadedProfilePic"
                          className="profileImg"
                          htmlFor="profileUpdateImg"
                          style={{ width: "100%", height: "100%" }}
                        />
                      </div>
                    ) : (
                      <label
                        htmlFor="profileUpdateImg"
                        className="uploadFileDiv"
                        style={{
                          width: "100%",
                          height: "100%",
                          marginBottom: "0",
                        }}
                      >
                        <input
                          className="uploadNewPic"
                          type="file"
                          onChange={(e) => {
                            handleFileInputChange(e, setFunc, setUploading);
                          }}
                          accept="image/*"
                          id="profileUpdateImg"
                        />

                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            border: "0.5px solid #2c7cb2 ",
                            borderRadius: "50%",
                          }}
                        >
                          {uploading ? (
                            <div>Uploading...</div>
                          ) : (
                            <div>
                              <img
                                src={uploadGrey}  // Placeholder image while uploading
                                alt="UploadPlaceholder"
                                style={{ width: "40px", height: "40px" }}
                              />
                            </div>
                          )}
                        </div>
                      </label>
                    )}

                  </div>
                  <InputDivsWithMT
                    heading="What is your full name? *"
                    placeholderText="Name.."
                    setFunc={setFullName}
                    funcValue={fullName}
                  />
                  <InputDivsWithMT
                    heading="What is your phone number? *"
                    placeholderText="+91"
                    setFunc={setPhoneNo}
                    funcValue={phoneNo}
                  />
                  {/* <InputDivsCheckFunctionality1
                    heading="Select a username *"
                    placeholderText="Username..."
                    setFunc={setUserName}
                    funcValue={userName}
                    userNameAvailable={userNameAvailable}
                  /> */}
                  {/* <InputDivCounty
                    heading="What country are you from?"
                    placeholderText="Click here to select"
                    setFunc={setCountry}
                    funcValue={country}
                  /> */}
                  <div style={{ paddingTop: "30px" }}>What country are you from? *</div>
                  <div className={styles.inputDivs} style={{ border: "1px solid #2c7cb2", borderRadius: "30px", fontSize: "13px", fontWeight: "500", paddingLeft: "10px" }}>
                    <select
                      name="country"
                      id="country"
                      style={{ border: "none", padding: "1rem", width: "90%", fontSize: "16px" }}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                    >
                      <option value="">New Country..</option>
                     {countryApiValue?.map((item) => (
  <option key={item.cca2} value={item?.name?.common}>

                          {item?.name?.common}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ paddingTop: "30px" }}>What state are you from? *</div>
                  <div className={styles.inputDivs} style={{ border: "1px solid #2c7cb2", borderRadius: "30px", fontSize: "13px", fontWeight: "500", paddingLeft: "10px" }}>
                    <select
                      name="state"
                      id="state"
                      style={{ border: "none", padding: "1rem", width: "90%", fontSize: "16px" }}
                      onChange={(e) => setSelectState(e.target.value)}
                      value={selectState}
                    >
                      <option value="">Select State..</option>
                      {stateApiValue?.map((item) => (
                        <option key={item._id || item.name} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <InputDivsWithMT
                    heading="What city are you from?"
                    placeholderText="City..."
                    setFunc={setCity}
                    funcValue={city}
                  />

                  <div className="stepBtns" style={{ marginTop: "3.5rem" }}>
                    <div
                      style={{
                        background: "#1F304F",
                        width: "48%",
                        minHeight: "3.5rem",
                        maxHeight: "3.5rem",
                      }}
                      onClick={() => {
                        setCreateBrandProfile(false);
                        setUserName("");
                        setFullName("");
                        setProfilePicture("");
                        setSelectedCountry("");
                        setSelectState("");
                        setCity("");
                        setPostalCode("");
                      }}
                    >
                      Go Back
                    </div>
                    <div
                      style={{
                        opacity:
                          profilePicture &&
                            fullName &&
                            userName.length > 0 &&
                            userNameAvailable &&
                            selectedCountry &&
                            selectState &&
                            city &&
                            postalCode &&
                            phoneNo
                            ? "1"
                            : "0.25",
                        cursor:
                          profilePicture &&
                            fullName &&
                            userName.length > 0 &&
                            userNameAvailable &&
                            selectedCountry &&
                            selectState &&
                            city &&
                            postalCode &&
                            phoneNo
                            ? "pointer"
                            : "not-allowed",
                        background: "#59A2DD",
                        width: "48%",
                      }}
                      onClick={() => {
                        if (
                          profilePicture &&
                          fullName &&
                          userName.length > 0 &&
                          userNameAvailable &&
                          selectedCountry &&
                          selectState &&
                          city &&
                          postalCode &&
                          phoneNo
                        ) {
                          levelOneProfile();
                        }
                      }}
                    >
                      Next Step
                    </div>
                  </div>
                </div>
                {isloading && (
                  <div
                    className="loading-component"
                    style={{
                      top: "0",
                      left: "0",
                      width: "100%",
                      height: "100%",
                      position: "absolute",
                      display: "flex",
                    }}
                  >
                    <LoadingAnimation1 icon={lg1} width={200} />
                  </div>
                )}
              </>
            )}

            {createBrandProfileStep === 2 && (
              <div className="successMsg">
                You Have Successfully Created Your Naavi Profile.
              </div>
            )}
          </div>
        )}
      </>

<>
  {createLevelTwo && (
    <div className="popularS">
      {levelTwoStep === 7 && (
        <div className="successMsg">
          You Have Successfully Created Your Naavi Profile Level 2.
        </div>
      )}
      <div className="head-txt">
        <div>Naavi Profile Level Two</div>
        <div
          onClick={() => {
            setCreateLevelTwo(false);
            setLevelTwoFields({
              financialSituation: "",
              school: "",
              performance: "",
              curriculum: "",
              stream: "",
              grade: "",
              linkedin: "",
            });
          }}
          className="close-div"
        >
          <img src={close} alt="" />
        </div>
      </div>
      <div className="overall-div">
        {levelTwoStep === 1 && (
          <div className="form-content">
            {/* Financial Situation - Grid Layout */}
            <div className="question-section">
              <div className="question-title">
                What is your current financial situation? *
              </div>
              <div className="grid-options">
                <div
                  className="option-btn"
                  onClick={() => {
                    setLevelTwoFields((prev) => ({
                      ...prev,
                      financialSituation: "0-25Lakhs",
                    }));
                  }}
                  style={{
                    background:
                      levelTwoFields?.financialSituation === "0-25Lakhs"
                        ? "linear-gradient(89deg,#47b4d5,#29449d)"
                        : "#f5f5f5",
                    color:
                      levelTwoFields?.financialSituation === "0-25Lakhs"
                        ? "white"
                        : "#333",
                  }}
                >
                  0-25 Lakhs
                </div>
                <div
                  className="option-btn"
                  onClick={() => {
                    setLevelTwoFields((prev) => ({
                      ...prev,
                      financialSituation: "25-75Lakhs",
                    }));
                  }}
                  style={{
                    background:
                      levelTwoFields?.financialSituation === "25-75Lakhs"
                        ? "linear-gradient(89deg,#47b4d5,#29449d)"
                        : "#f5f5f5",
                    color:
                      levelTwoFields?.financialSituation === "25-75Lakhs"
                        ? "white"
                        : "#333",
                  }}
                >
                  25 Lakhs - 75 Lakhs
                </div>
                <div
                  className="option-btn"
                  onClick={() => {
                    setLevelTwoFields((prev) => ({
                      ...prev,
                      financialSituation: "75Lakhs-3CR",
                    }));
                  }}
                  style={{
                    background:
                      levelTwoFields?.financialSituation === "75Lakhs-3CR"
                        ? "linear-gradient(89deg,#47b4d5,#29449d)"
                        : "#f5f5f5",
                    color:
                      levelTwoFields?.financialSituation === "75Lakhs-3CR"
                        ? "white"
                        : "#333",
                  }}
                >
                  75 Lakhs - 3 CR
                </div>
                <div
                  className="option-btn"
                  onClick={() => {
                    setLevelTwoFields((prev) => ({
                      ...prev,
                      financialSituation: "3CR+",
                    }));
                  }}
                  style={{
                    background:
                      levelTwoFields?.financialSituation === "3CR+"
                        ? "linear-gradient(89deg,#47b4d5,#29449d)"
                        : "#f5f5f5",
                    color:
                      levelTwoFields?.financialSituation === "3CR+" ? "white" : "#333",
                  }}
                >
                  3 CR+
                </div>
              </div>
            </div>

            {/* School and Grade in one row */}
            <div className="form-row">
              <div className="form-group">
                <div className="question-title">
                  What school do you currently attend? *
                </div>
                <div className="input-container">
                  <input
                    type="text"
                    placeholder="Enter name.."
                    value={levelTwoFields?.school}
                    onChange={(e) => {
                      setLevelTwoFields((prev) => ({
                        ...prev,
                        school: e.target.value,
                      }));
                    }}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <div className="question-title">
                  What grade are you in? *
                </div>
                <div className="grade-options">
                  {["9", "10", "11", "12"].map((grade) => (
                    <div
                      key={grade}
                      className="grade-btn"
                      onClick={() => {
                        setLevelTwoFields((prev) => ({
                          ...prev,
                          grade: grade,
                        }));
                      }}
                      style={{
                        background:
                          levelTwoFields?.grade === grade
                            ? "linear-gradient(89deg,#47b4d5,#29449d)"
                            : "#f5f5f5",
                        color: levelTwoFields?.grade === grade ? "white" : "#333",
                      }}
                    >
                      {grade}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Grade Point Average */}
            <div className="question-section">
              <div className="question-title">
                What is your current grade point average? *
              </div>
              <div className="grid-options performance-grid">
                {[
                  "0%-35%",
                  "36%-60%", 
                  "61%-75%",
                  "76%-85%",
                  "86%-95%",
                  "96%-100%"
                ].map((range) => (
                  <div
                    key={range}
                    className="option-btn"
                    onClick={() => {
                      setLevelTwoFields((prev) => ({
                        ...prev,
                        performance: range,
                      }));
                    }}
                    style={{
                      background:
                        levelTwoFields?.performance === range
                          ? "linear-gradient(89deg,#47b4d5,#29449d)"
                          : "#f5f5f5",
                      color: levelTwoFields?.performance === range ? "white" : "#333",
                    }}
                  >
                    {range}
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum */}
            <div className="question-section">
              <div className="question-title">
                What curriculum are you pursuing? *
              </div>
              <div className="grid-options">
                {["IB", "IGCSE", "CBSE", "ICSE", "Nordic"].map((curriculum) => (
                  <div
                    key={curriculum}
                    className="option-btn"
                    onClick={() => {
                      setLevelTwoFields((prev) => ({
                        ...prev,
                        curriculum: curriculum,
                      }));
                    }}
                    style={{
                      background:
                        levelTwoFields?.curriculum === curriculum
                          ? "linear-gradient(89deg,#47b4d5,#29449d)"
                          : "#f5f5f5",
                      color: levelTwoFields?.curriculum === curriculum ? "white" : "#333",
                    }}
                  >
                    {curriculum}
                  </div>
                ))}
              </div>
            </div>

            {/* Stream */}
            <div className="question-section">
              <div className="question-title">
                What stream are you pursuing? *
              </div>
              <div className="grid-options">
                {["MPC", "BIPC", "CEC", "MEC", "HEC"].map((stream) => (
                  <div
                    key={stream}
                    className="option-btn"
                    onClick={() => {
                      setLevelTwoFields((prev) => ({
                        ...prev,
                        stream: stream,
                      }));
                    }}
                    style={{
                      background:
                        levelTwoFields?.stream === stream
                          ? "linear-gradient(89deg,#47b4d5,#29449d)"
                          : "#f5f5f5",
                      color: levelTwoFields?.stream === stream ? "white" : "#333",
                    }}
                  >
                    {stream}
                  </div>
                ))}
              </div>
            </div>

            {/* LinkedIn - Larger Section with Specific Classes */}
<div className="linkedin-question-section">
  <div className="linkedin-question-title">
    What is your Linkedin? *
  </div>
  <div className="linkedin-input-full">
    <input
      type="text"
      placeholder="Enter your LinkedIn profile URL..."
      value={levelTwoFields?.linkedin}
      onChange={(e) => {
        setLevelTwoFields((prev) => ({
          ...prev,
          linkedin: e.target.value,
        }));
      }}
    />
  </div>
</div>

            {/* Submit Buttons - Keep your original button structure */}
            <div className="stepBtns">
              <div
                style={{
                  background: "#1F304F",
                  width: "48%",
                  height: "3.5rem",
                  opacity: "0.5",
                  cursor: "not-allowed",
                }}
              >
                Go Back
              </div>
              <div
                style={{
                  height: "3.5rem",
                  background: "#59A2DD",
                  width: "48%",
                  cursor: allLev2Filled ? "pointer" : "not-allowed",
                  opacity: allLev2Filled ? "1" : "0.5",
                }}
                onClick={() => {
                  if (allLev2Filled) {
                    levelTwoProfile();
                  }
                }}
              >
                Submit
              </div>
            </div>
          </div>
        )}

        {levelTwoLoading && (
          <div className="loading-component">
            <LoadingAnimation1 icon={lg1} width={200} />
          </div>
        )}
      </div>
    </div>
  )}
</>

{/* Level Three Section - ADD THIS */}
{createLevelThree && (
  <LevelThree
    profileData={profileData}
    createLevelThree={createLevelThree}
    setCreateLevelThree={setCreateLevelThree}
    handleProfileData={handleProfileData}
    profileDataId={profileDataId}
  />
)}
      {editCountry && (
        <div className="popularS">
          <div className="head-txt">
            <div>Edit Country</div>
            <div
              onClick={() => {
                setEditCountry(false);
                setNewCountry("");
              }}
              className="close-div"
            >
              <img src={close} alt="" />
            </div>
          </div>

          <div
            className="overall-div"
            style={{ height: "calc(100% - 10.5rem)" }}
          >
            <div className="each-action1">
              <div>{profileData?.country}</div>
            </div>
            <div className="line-container">
              <div className="linee"></div>
              <div className="new-txt">New</div>
              <div className="linee"></div>
            </div>
            <div className="each-action1">

              <input
                type="text"
                placeholder="New Country.."
                onChange={(e) => {
                  setNewCountry(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="stepBtns" style={{ height: "4.5rem" }}>
            <div
              style={{
                opacity: newCountry ? "1" : "0.25",
                cursor: newCountry ? "pointer" : "not-allowed",
                background: "#59A2DD",
              }}
              onClick={() => {
                if (newCountry) {
                  editData("country", newCountry);
                }
              }}
            >
              Submit Edit
            </div>
          </div>

          {loading && (
            <div
              className="loading-component"
              style={{
                top: "0",
                right: "0",
                width: "100%",
                height: "calc(100% - 70px)",
                position: "absolute",
                display: "flex",
              }}
            >
              <LoadingAnimation1 icon={lg1} width={200} />
            </div>
          )}
        </div>
      )}

      {editAddress && (
        <div className="popularS">
          <div className="head-txt">
            <div>Edit Address</div>
            <div
              onClick={() => {
                setEditAddress(false);
                setNewAddress("");
              }}
              className="close-div"
            >
              <img src={close} alt="" />
            </div>
          </div>

          <div
            className="overall-div"
            style={{ height: "calc(100% - 10.5rem)" }}
          >
            <div className="each-action1">
              <div>{profileData?.address}</div>
            </div>
            <div className="line-container">
              <div className="linee"></div>
              <div className="new-txt">New</div>
              <div className="linee"></div>
            </div>
            <div className="each-action1">
              <input
                type="text"
                placeholder="New Address.."
                onChange={(e) => {
                  setNewAddress(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="stepBtns" style={{ height: "4.5rem" }}>
            <div
              style={{
                opacity: newAddress ? "1" : "0.25",
                cursor: newAddress ? "pointer" : "not-allowed",
                background: "#59A2DD",
              }}
              onClick={() => {
                if (newAddress) {
                  editData("address", newAddress);
                }
              }}
            >
              Submit Edit
            </div>
          </div>

          {loading && (
            <div
              className="loading-component"
              style={{
                top: "0",
                right: "0",
                width: "100%",
                height: "calc(100% - 70px)",
                position: "absolute",
                display: "flex",
              }}
            >
              <LoadingAnimation1 icon={lg1} width={200} />
            </div>
          )}
        </div>
      )}

      {editDisplayName && (
        <div className="popularS">
          <div className="head-txt">
            <div>Edit Display Name</div>
            <div
              onClick={() => {
                setEditDisplayName(false);
                setNewDisplayName("");
              }}
              className="close-div"
            >
              <img src={close} alt="" />
            </div>
          </div>

          <div
            className="overall-div"
            style={{ height: "calc(100% - 10.5rem)" }}
          >
            <div className="each-action1">
              <div>{profileData?.displayName}</div>
            </div>
            <div className="line-container">
              <div className="linee"></div>
              <div className="new-txt">New</div>
              <div className="linee"></div>
            </div>
            <div className="each-action1">
              <input
                type="text"
                placeholder="New Display Name.."
                onChange={(e) => {
                  setNewDisplayName(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="stepBtns" style={{ height: "4.5rem" }}>
            <div
              style={{
                opacity: newDisplayName ? "1" : "0.25",
                cursor: newDisplayName ? "pointer" : "not-allowed",
                background: "#59A2DD",
              }}
              onClick={() => {
                if (newDisplayName) {
                  editData("displayName", newDisplayName);
                }
              }}
            >
              Submit Edit
            </div>
          </div>

          {loading && (
            <div
              className="loading-component"
              style={{
                top: "0",
                right: "0",
                width: "100%",
                height: "calc(100% - 70px)",
                position: "absolute",
                display: "flex",
              }}
            >
              <LoadingAnimation1 icon={lg1} width={200} />
            </div>
          )}
        </div>
      )}

      {editPhoneNo && (
        <div className="popularS">
          <div className="head-txt">
            <div>Edit Phone Number</div>
            <div
              onClick={() => {
                setEditPhoneNo(false);
                setNewPhoneNo("");
              }}
              className="close-div"
            >
              <img src={close} alt="" />
            </div>
          </div>

          <div
            className="overall-div"
            style={{ height: "calc(100% - 10.5rem)" }}
          >
            <div className="each-action1">
              <div>{profileData?.phone}</div>
            </div>
            <div className="line-container">
              <div className="linee"></div>
              <div className="new-txt">New</div>
              <div className="linee"></div>
            </div>
            <div className="each-action1">
              <input
                type="number"
                placeholder="New Phone Number.."
                onChange={(e) => {
                  setNewPhoneNo(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="stepBtns" style={{ height: "4.5rem" }}>
            <div
              style={{
                opacity: newPhoneNo ? "1" : "0.25",
                cursor: newPhoneNo ? "pointer" : "not-allowed",
                background: "#59A2DD",
              }}
              onClick={() => {
                if (newPhoneNo) {
                  editData("phone", newPhoneNo);
                }
              }}
            >
              Submit Edit
            </div>
          </div>

          {loading && (
            <div
              className="loading-component"
              style={{
                top: "0",
                right: "0",
                width: "100%",
                height: "calc(100% - 70px)",
                position: "absolute",
                display: "flex",
              }}
            >
              <LoadingAnimation1 icon={lg1} width={200} />
            </div>
          )}
        </div>
      )}

      {editDescription && (
        <div className="popularS">
          <div className="head-txt">
            <div>Edit Description</div>
            <div
              onClick={() => {
                setEditDescription(false);
                setNewDescription("");
              }}
              className="close-div"
            >
              <img src={close} alt="" />
            </div>
          </div>

          <div
            className="overall-div"
            style={{ height: "calc(100% - 10.5rem)" }}
          >
            <div className="each-action1">
              <div>{profileData?.description}</div>
            </div>
            <div className="line-container">
              <div className="linee"></div>
              <div className="new-txt">New</div>
              <div className="linee"></div>
            </div>
            <div className="each-action1">
              <input
                type="text"
                placeholder="New Description.."
                onChange={(e) => {
                  setNewDescription(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="stepBtns" style={{ height: "4.5rem" }}>
            <div
              style={{
                opacity: newDescription ? "1" : "0.25",
                cursor: newDescription ? "pointer" : "not-allowed",
                background: "#59A2DD",
              }}
              onClick={() => {
                if (newDescription) {
                  editData("description", newDescription);
                }
              }}
            >
              Submit Edit
            </div>
          </div>

          {loading && (
            <div
              className="loading-component"
              style={{
                top: "0",
                right: "0",
                width: "100%",
                height: "calc(100% - 70px)",
                position: "absolute",
                display: "flex",
              }}
            >
              <LoadingAnimation1 icon={lg1} width={200} />
            </div>
          )}
        </div>
      )}

      {editColorCode && (
        <div className="popularS">
          <div className="head-txt">
            <div>Edit Colour Code</div>
            <div
              onClick={() => {
                setEditColorCode(false);
                setNewColorCode("");
              }}
              className="close-div"
            >
              <img src={close} alt="" />
            </div>
          </div>

          <div
            className="overall-div"
            style={{ height: "calc(100% - 10.5rem)" }}
          >
            <div className="each-action1" style={{ position: "relative" }}>
              <div>{profileData?.colorCode}</div>
              <div
                className="bgColorDiv"
                style={{
                  background: `#${profileData?.colorCode}`,
                }}
              ></div>
            </div>
            <div className="line-container">
              <div className="linee"></div>
              <div className="new-txt">New</div>
              <div className="linee"></div>
            </div>
            <div className="each-action1" style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="New Colour Code.."
                onChange={(e) => {
                  setNewColorCode(e.target.value);
                }}
              />
              <div
                className="bgColorDiv"
                style={{
                  background: newColorCode ? `#${newColorCode}` : "transparent",
                }}
              ></div>
            </div>
          </div>

          <div className="stepBtns" style={{ height: "4.5rem" }}>
            <div
              style={{
                opacity: newColorCode ? "1" : "0.25",
                cursor: newColorCode ? "pointer" : "not-allowed",
                background: "#59A2DD",
              }}
              onClick={() => {
                if (newColorCode) {
                  editData("colorCode", newColorCode);
                }
              }}
            >
              Submit Edit
            </div>
          </div>

          {loading && (
            <div
              className="loading-component"
              style={{
                top: "0",
                right: "0",
                width: "100%",
                height: "calc(100% - 70px)",
                position: "absolute",
                display: "flex",
              }}
            >
              <LoadingAnimation1 icon={lg1} width={200} />
            </div>
          )}
        </div>
      )}

      {editProfilePic && (
        <div className="popularS">
          <div className="head-txt">
            <div>Edit Profile Picture</div>
            <div
              onClick={() => {
                setEditProfilePic(false);
                setNewProfilePic("");
              }}
              className="close-div"
            >
              <img src={close} alt="" />
            </div>
          </div>

          <div
            className="overall-div"
            style={{ height: "calc(100% - 10.5rem)" }}
          >
            <div
              className="each-action1"
              style={{ border: "none", justifyContent: "center" }}
            >
              <div style={{ height: "120px", width: "120px" }}>
                <img
                  src={profileData?.profilePicURL}
                  alt=""
                  style={{
                    height: "100%",
                    width: "100%",
                    borderRadius: "50%",
                    border: "0.5px solid #e5e5e5",
                  }}
                />
              </div>
            </div>
            <div className="line-container">
              <div className="linee"></div>
              <div className="new-txt">New</div>
              <div className="linee"></div>
            </div>
            <div
              className="each-action1"
              style={{ border: "none", justifyContent: "center" }}
            >
              <ImageUploadDivProfilePic
                setFunc={setNewProfilePic}
                funcValue={newProfilePic}
              />
            </div>
          </div>

          <div className="stepBtns" style={{ height: "4.5rem" }}>
            <div
              style={{
                opacity: newProfilePic ? "1" : "0.25",
                cursor: newProfilePic ? "pointer" : "not-allowed",
                background: "#59A2DD",
              }}
              onClick={() => {
                if (newProfilePic) {
                  editData("profilePicURL", newProfilePic);
                }
              }}
            >
              Submit Edit
            </div>
          </div>

          {loading && (
            <div
              className="loading-component"
              style={{
                top: "0",
                right: "0",
                width: "100%",
                height: "calc(100% - 70px)",
                position: "absolute",
                display: "flex",
              }}
            >
              <LoadingAnimation1 icon={lg1} width={200} />
            </div>
          )}
        </div>
      )}

      {editCoverPic && (
        <div className="popularS">
          <div className="head-txt">
            <div>Edit Cover Photo</div>
            <div
              onClick={() => {
                setEditCoverPic(false);
                setNewCoverPic("");
              }}
              className="close-div"
            >
              <img src={close} alt="" />
            </div>
          </div>

          <div
            className="overall-div"
            style={{ height: "calc(100% - 10.5rem)" }}
          >
            <div
              className="each-action1"
              style={{ height: "12rem", padding: "0" }}
            >
              <div style={{ height: "100%", width: "100%" }}>
                <img
                  src={profileData?.coverPicURL}
                  alt=""
                  style={{ height: "100%", width: "100%" }}
                />
              </div>
            </div>
            <div className="line-container">
              <div className="linee"></div>
              <div className="new-txt">New</div>
              <div className="linee"></div>
            </div>
            <div
              className="each-action1"
              style={{ height: "12rem", padding: "0" }}
            >
              <ImageUploadDivCoverPic
                setFunc={setNewCoverPic}
                funcValue={newCoverPic}
              />
            </div>
          </div>

          <div className="stepBtns" style={{ height: "4.5rem" }}>
            <div
              style={{
                opacity: newCoverPic ? "1" : "0.25",
                cursor: newCoverPic ? "pointer" : "not-allowed",
                background: "#59A2DD",
              }}
              onClick={() => {
                if (newCoverPic) {
                  editData("coverPicURL", newCoverPic);
                }
              }}
            >
              Submit Edit
            </div>
          </div>

          {loading && (
            <div
              className="loading-component"
              style={{
                top: "0",
                right: "0",
                width: "100%",
                height: "calc(100% - 70px)",
                position: "absolute",
                display: "flex",
              }}
            >
              <LoadingAnimation1 icon={lg1} width={200} />
            </div>
          )}
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default UserProfile;