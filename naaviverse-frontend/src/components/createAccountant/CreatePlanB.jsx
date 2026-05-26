import React from "react";
import { useContext, useState } from "react";
// import { planBContext } from "../../../context/PlanBContext";
import classNames from "./components.module.scss";

//assets
// import selectDownArrow from '../../../static/images/selectDownArrow.svg';
// import { selectoneOptions } from '../data/data';
// import { uploadImageFunc } from '../../../utils/imageUpload';
// import { futureDates } from '../../../static/data/constData';
// import { useEffect } from 'react';
// import axios from 'axios';
// import { BankContext } from '../../../context/Context';
// import tempCanadaFlag from '../../../static/images/tempCanadaFlag.svg';
// import retiredIcon from '../../../static/images/sidebar-icons/retired.svg';
// import uploading from '../../../static/images/uploading.svg';
// import dummyProfile from '../../../static/images/dummyProfile.svg';
// import { predefinedToast } from '../../../utils/toast';
// import { useAppContextDetails } from '../../../context/AppContext';
// import edit from './edit.svg';

const CreatePlanB = () => {
  return <div></div>;
};

export default CreatePlanB;

export const InputDivs = ({
  heading,
  placeholderText,
  setFunc,
  funcValue,
  addCurrency,
}) => {
  return (
    <div className={classNames.inputDivs}>
      <div className={classNames.heading}>{heading}</div>
      <div className={classNames.inputHolder}>
        <input
          className={classNames.inputFields}
          placeholder={placeholderText}
          onChange={(event) => {
            setFunc(event.target.value);
          }}
          value={funcValue ? funcValue : ""}
        />
      </div>
    </div>
  );
};

export const InputDivsCheck = ({
  heading,
  placeholderText,
  setFunc,
  funcValue,
  colorCode,
}) => {
  return (
    <div className={classNames.inputDivs} style={{ marginTop: "3rem" }}>
      <div className={classNames.heading}>{heading}</div>
      <div className={classNames.inputHolder}>
        <input
          className={classNames.inputFields}
          placeholder={placeholderText}
          onChange={(event) => {
            setFunc(event.target.value);
          }}
          value={funcValue ? funcValue : ""}
          style={{ borderRadius: "35px" }}
        />

        <div className={classNames.currencyDiv2}>Check</div>
      </div>
    </div>
  );
};

export const InputDivsWithMT = ({
  heading,
  placeholderText,
  setFunc,
  funcValue,
  addCurrency,
}) => {
  return (
    <div className={classNames.inputDivs} style={{ marginTop: "3rem" }}>
      <div className={classNames.heading}>{heading}</div>
      <div className={classNames.inputHolder}>
        <input
          className={classNames.inputFields}
          placeholder={placeholderText}
          onChange={(event) => {
            setFunc(event.target.value);
          }}
          value={funcValue ? funcValue : ""}
          style={{ borderRadius: "35px" }}
        />
      </div>
    </div>
  );
};

export const InputDivsCreatePartner = ({
  heading,
  placeholderText,
  setFunc,
  funcValue,
  addCurrency,
}) => {
  return (
    <div className={classNames.inputDivs} style={{marginTop:'0px', marginBottom:"0px", gap:'0px'}}>
      <div className={classNames.heading}>{heading}</div>
      <div className={classNames.inputHolder}>
        <input
          className={classNames.inputClass}
          placeholder={placeholderText}
          onChange={(event) => {
            setFunc(event.target.value);
          }}
          value={funcValue ? funcValue : ""}
          style={{ borderRadius: "10px" }}
        />
      </div>
    </div>
  );
};

export const InputDivsTextAreaPartner = ({
  heading,
  placeholderText,
  setFunc,
  funcValue,
}) => {
  return (
    <div className={classNames.inputDivs} style={{marginTop:'0px', gap:'0px'}}>
      <div className={classNames.heading}>{heading}</div>
      <div className={classNames.inputHolder} style={{ minHeight: "10rem" }}>
        <textarea
          className={classNames.textareaClass}
          style={{
            minHeight: "10rem",
            borderRadius: "10px",
            width:'100%'
          }}
          placeholder={placeholderText}
          onChange={(event) => {
            setFunc(event.target.value);
          }}
        >
          {funcValue ? funcValue : ""}
        </textarea>
      </div>
    </div>
  );
};


export const InputDivCounty = ({
  heading,
  placeholderText,
  setFunc,
  funcValue,
  addCurrency,
}) => {

  

  return (
    <div className={classNames.inputDivs} style={{ marginTop: "3rem" }}>
      <div className={classNames.heading}>{heading}</div>
      <div className={classNames.inputHolder}>
        <input
          className={classNames.inputFields}
          placeholder={placeholderText}
          onChange={(event) => {
            setFunc(event.target.value);
          }}
          value={funcValue ? funcValue : ""}
          style={{ borderRadius: "35px" }}
        />
      </div>
    </div>
  );
};

export const InputDivsWithColorCode = ({
  heading,
  placeholderText,
  setFunc,
  funcValue,
  colorCode,
}) => {
  return (
    <div className={classNames.inputDivs}>
      <div className={classNames.heading}>{heading}</div>
      <div className={classNames.inputHolder}>
        <input
          className={classNames.inputFields}
          placeholder={placeholderText}
          onChange={(event) => {
            setFunc(event.target.value);
          }}
          value={funcValue ? funcValue : ""}
          style={{ borderRadius: "35px" }}
        />
        <div
          className={classNames.currencyDiv1}
          style={{
            background: colorCode ? `#${colorCode}` : "#E7E7E7",
            borderRadius: "35px",
            width: "20%",
            right: "-2rem",
          }}
        ></div>
      </div>
    </div>
  );
};

export const InputDivsTextArea1 = ({
  heading,
  placeholderText,
  setFunc,
  funcValue,
}) => {
  return (
    <div className={classNames.inputDivs}>
      <div className={classNames.heading}>{heading}</div>
      <div className={classNames.inputHolder} style={{ minHeight: "10rem" }}>
        <textarea
          className={classNames.inputFields}
          style={{
            minHeight: "10rem",
            borderRadius: "35px",
          }}
          placeholder={placeholderText}
          onChange={(event) => {
            setFunc(event.target.value);
          }}
        >
          {funcValue ? funcValue : ""}
        </textarea>
      </div>
    </div>
  );
};
