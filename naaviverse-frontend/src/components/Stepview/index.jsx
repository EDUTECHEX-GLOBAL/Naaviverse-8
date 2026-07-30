import React, { useState, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import axios from "axios";
import { useCoinContextData } from "../../context/CoinContext";
import "./stepview.scss";
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const Stepview = () => {
  const { searchTerm } = useCoinContextData();

  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState([]);
  const [servicesByStep, setServicesByStep] = useState({});

  // -------------------------------------------
  // FETCH ALL STEPS
  // -------------------------------------------
  useEffect(() => {
    setLoading(true);

    axios
      .get(`${BASE_URL}/api/steps/get`)
      .then((response) => {
        const result = response?.data?.data || [];
        setSteps(result);

        // fetch services for each step
        result.forEach((step) => {
          fetchServices(step._id);
        });

        setLoading(false);
      })
      .catch((error) => {
        console.log("Error fetching steps:", error);
        setLoading(false);
      });
  }, []);

  // -------------------------------------------
  // FETCH SERVICES FOR A SPECIFIC STEP
  // -------------------------------------------
  const fetchServices = (step_id) => {
    axios
      .get(`${BASE_URL}/api/steps/getall/${step_id}`) // YOUR actual API
      .then((response) => {
        const services = response?.data?.services || [];

        // group by service type
        const grouped = {
          Distributor: services.filter((s) => s.type === "Distributor"),
          Vendor: services.filter((s) => s.type === "Vendor"),
          Mentor: services.filter((s) => s.type === "Mentor"),
          Institution: services.filter((s) => s.type === "Institution"),
        };

        setServicesByStep((prev) => ({
          ...prev,
          [step_id]: grouped,
        }));
      })
      .catch((error) => console.log("Error fetching services:", error));
  };

  // -------------------------------------------
  // SEARCH FILTER
  // -------------------------------------------
  const filteredSteps = steps.filter((step) =>
    step?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  return (
    <div className="stepViewPage">

      <div className="stepviewNav">
        <div className="step-name-div">Step Name</div>
        <div className="step-description-div">Macro / Micro / Nano</div>
      </div>

      <div className="stepviewContent">
        {loading ? (
          Array(10)
            .fill("")
            .map((_, i) => (
              <div className="each-sv-data" key={i}>
                <div className="each-sv-name">
                  <Skeleton width={100} height={30} />
                </div>
                <div className="each-sv-desc">
                  <Skeleton width={200} height={30} />
                </div>
              </div>
            ))
        ) : (
          filteredSteps.map((step, i) => {
            const services = servicesByStep[step._id] || {};

            return (
              <div className="each-step-full-block" key={i}>
                
                {/* Step Header */}
{/* Step Header */}
<div className="each-sv-data">
  <div className="each-sv-name">{step?.name}</div>

  <div className="each-sv-desc">
    {/* MACRO */}
    <b>Macro:</b>{" "}
    {step?.macro_description || step?.description || "—"}
    <br />

    {/* MICRO */}
    <b>Micro:</b>{" "}
    {step?.micro_description
      ? step.micro_description
          .split("\n")
          .map((line, idx) => (
            <div key={idx}>• {line}</div>
          ))
      : "—"}
    <br />

    {/* NANO */}
    <b>Nano:</b>{" "}
    {step?.nano_description
      ? step.nano_description
          .split("\n")
          .map((line, idx) => (
            <div key={idx}>• {line}</div>
          ))
      : "—"}
  </div>
</div>


                {/* SERVICES SECTION */}
                <div className="service-categories-box">

                  {/* DISTRIBUTOR */}
                  <div className="service-category">
                    <div className="category-title">Distributor</div>
                    {(services.Distributor || []).length === 0
                      ? <div className="empty">No Services</div>
                      : services.Distributor.map((s, idx) => (
                          <div className="service-item" key={idx}>
                            {s.name}
                          </div>
                        ))}
                  </div>

                  {/* VENDOR */}
                  <div className="service-category">
                    <div className="category-title">Vendor</div>
                    {(services.Vendor || []).length === 0
                      ? <div className="empty">No Services</div>
                      : services.Vendor.map((s, idx) => (
                          <div className="service-item" key={idx}>
                            {s.name}
                          </div>
                        ))}
                  </div>

                  {/* MENTOR */}
                  <div className="service-category">
                    <div className="category-title">Mentor</div>
                    {(services.Mentor || []).length === 0
                      ? <div className="empty">No Services</div>
                      : services.Mentor.map((s, idx) => (
                          <div className="service-item" key={idx}>
                            {s.name}
                          </div>
                        ))}
                  </div>

                  {/* INSTITUTION */}
                  <div className="service-category">
                    <div className="category-title">Institution</div>
                    {(services.Institution || []).length === 0
                      ? <div className="empty">No Services</div>
                      : services.Institution.map((s, idx) => (
                          <div className="service-item" key={idx}>
                            {s.name}
                          </div>
                        ))}
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Stepview;
