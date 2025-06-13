import React, { useEffect, useState } from "react";
import { useStore } from "../../components/store/store.ts";
import "./journey.scss";
import Skeleton from "react-loading-skeleton";
import axios from "axios";
import { useCoinContextData } from "../../context/CoinContext";
import CurrentStep from "../../pages/CurrentStep/index.jsx";

// images
// import arrow from "./arrow.svg";

const JourneyPage = () => {
  const { selectedPathItem, setSelectedPathItem, setShowPathDetails, setStepServices } =
    useCoinContextData();
    const [loading, setLoading] = useState(false);
  // let userDetails = JSON.parse(localStorage.getItem("user"));
  // const email = userDetails?.user?.email;

  useEffect(() => {
    setLoading(true);
    let selectedPathData = JSON.parse(localStorage.getItem("selectedPath"));
    if (selectedPathData) {
      // console.log(selectedPathData, "selected path name");
      axios
        .get(
          `/api/paths/get?status=active?nameOfPath=${selectedPathData}`
        )
        .then((response) => {
          let result = response?.data?.data[0];
          // console.log(result, "selectedPathData result");
          setSelectedPathItem(result);
          setLoading(false);
        })
        .catch((error) => {
          console.log(error, "error in fetching selectedPathData result");
        });
    }
  }, []);

  useEffect(() => {
    console.log(selectedPathItem, "wkjefkjwbfkwjebfwef")
  }, [selectedPathItem])

  const [showSelectedPath, setShowSelectedPath] = useState(null)


  const [productDataArray, setProductDataArray] = useState([]);
  const [productKeys, setProductKeys] = useState(null);


  const fetchProductData = async (apiKey) => {
    try {
      const apiUrl = `https://comms.globalxchange.io/gxb/product/get?product_id=${apiKey}`;
      const response = await axios.get(apiUrl);
      const productData = response.data.products[0];
      return productData;

      return null; // Return null for items that already exist in the array
    } catch (error) {
      console.error(`Error fetching productt data for key ${apiKey}:`, error);
      return null;
    }
  };

  const fetchData = async () => {
    setProductDataArray([]);
    console.log(productKeys, "ewlkhflkwheflwerf");
    if (productKeys && Array.isArray(productKeys)) { // Check if productKeys exists and is an array
      const fetchDataPromises = productKeys.map((id) => fetchProductData(id)); // Map over the IDs directly

      try {
        const results = await Promise.all(fetchDataPromises);
        const updatedProductDataArray = results.filter(Boolean);
        setProductDataArray([...updatedProductDataArray]);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    } else {
      console.warn("Product keys is not a valid array:", productKeys);
    }
  };
  useEffect(() => {
    // Fetch updated product data when productKeys change
    fetchData();
  }, [productKeys]);

  return (
    <div className="journeypage">
      <div className="journey-top-area">
        <div>Your Selected Path:</div>
        {loading ? (
          <Skeleton width={150} height={30} />
        ) : (
          <div className="bold-text">
            {selectedPathItem?.length > 0
              ? selectedPathItem?.university
              : ""}
          </div>
        )}
        {/* {loading ? (
          <Skeleton width={500} height={20} />
        ) : (
          <div className="journey-des">
            {selectedPathItem?.length > 0 ? selectedPathItem?.description : ""}
          </div>
        )} */}
        <div
          className="goBack-div"
          onClick={() => {
            setShowPathDetails(false);
            localStorage.removeItem("selectedPath");
            setSelectedPathItem([]);
          }}
        >
          Go Back
        </div>
      </div>
      {showSelectedPath ? 
          <CurrentStep productDataArray={productDataArray} selectedPathId={selectedPathItem?._id} showSelectedPath={showSelectedPath} selectedPath={selectedPathItem}/> :
      <div className="journey-steps-area">
        {loading
          ? Array(6)
              .fill("")
              .map((e, i) => {
                return (
                  <div className="each-j-step relative-div" key={i}>
                    <div className="each-j-img">
                      <Skeleton width={75} height={75} />
                    </div>
                    <div className="each-j-step-text">
                      <Skeleton width={200} height={30} />
                    </div>
                    <div className="each-j-step-text1">
                      <Skeleton width={250} height={25} />
                    </div>
                    <div className="each-j-amount-div">
                      <div className="each-j-amount">
                        <Skeleton width={100} height={30} />
                      </div>
                    </div>
                  </div>
                );
              })
          : selectedPathItem?.length > 0
          ? selectedPathItem?.StepDetails?.map((e, i) => {
              return (
                <div className="each-j-step relative-div" key={i} 
                onClick={() => {
                  setShowSelectedPath(e)
                  setProductKeys(e?.product_ids)
                  console.log(e, "kjwebfkewjfkwjf")
                  setStepServices(e?.ConnectedServices)
                  
                }}>
                  <div className="each-j-img">
                    <img src={e?.icon} alt="" />
                  </div>
                  <div className="each-j-step-text">{e?.name}</div>
                  <div className="each-j-step-text1">{e?.description}</div>
                  <div className="each-j-amount-div">
                    <div className="each-j-amount">{e?.cost}</div>
                  </div>
                </div>
              );
            })
          : ""}
      </div>
      }
    </div>
  );
};

export default JourneyPage;
