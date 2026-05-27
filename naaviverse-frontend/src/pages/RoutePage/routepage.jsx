// Package Imports
import React, { useContext, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

// CSS Imports

// Context Imports
import { GlobalContex } from "../../globalContext";

// Image Imports

//cPage/Component Imports

import Publishers from "../../Apps/Publishers/publishers";
import Admins from "../../Apps/Admins/admins";

const RoutePage = () => {
  const { loginData, setBankerTag, setBanker, showMobileMenu } =
    useContext(GlobalContex);

  useEffect(() => {
    axios
      .get(
        "https://teller2.apimachine.com/banker/details",

        {
          headers: {
            email: loginData.user.email,
            token: loginData.idToken,
          },
        }
      )
      .then(({ data }) => {
        if (!localStorage.getItem("bankerTag")) {
          // console.log(res.data, "jhffjy");
          localStorage.setItem("bankerTag", data?.data?.bankerTag);
          setBankerTag(data?.data?.bankerTag);

          localStorage.setItem("banker", JSON.stringify(data?.data));
          setBanker(data?.data);
        }
      });
  }, []);

  return (
    <>
      <Routes>
        <Route path="Publishers" element={<Publishers />} />
        <Route path="Admins" element={<Admins />} />
      </Routes>
    </>
  );
};

export default RoutePage;
