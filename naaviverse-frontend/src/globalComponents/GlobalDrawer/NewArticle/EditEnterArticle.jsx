import axios from "axios";
import React, { Fragment, useEffect, useState } from "react";
import { useRef } from "react";
import { useContext } from "react";
import Scrollbars from "react-custom-scrollbars";
import Skeleton from "react-loading-skeleton";
import { GlobalContex } from "../../../globalContext";
// import { useAppsList } from "../../../queryHooks";
import defaultImg from "../../../static/images/icons/defaultImg.svg";
import * as jose from "jose";
import {
  AiOutlineBold,
  AiOutlineItalic,
  AiOutlineUnderline,
  AiOutlineCamera,
  AiOutlineLoading3Quarters,
  AiOutlineLink
} from "react-icons/ai";

const EditEnterArticle = ({ articleBody, setArticleBody, onClose, btnSubmit }) => {
  const [localBody, setLocalBody] = useState(articleBody);
  // const { data: allapps, isLoading: allappsLoading } = useAppsList();
  const { wideDrawer, setWideDrawer } = useContext(GlobalContex);
  const [allAuthor, setAllAuthor] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [link, setLink] = useState("");

  let bodyRef = useRef();
  var savedRange;

  const secret = process.env.REACT_APP_AWS_KEY; // secret not to be disclosed anywhere.
  const emailDev = "rahulrajsb@outlook.com"; // email of the developer.

  const signJwt = async (fileName, emailDev, secret) => {
    console.log(fileName, emailDev, secret);
    try {
      const jwts = await new jose.SignJWT({ name: fileName, email: emailDev })
        .setProtectedHeader({ alg: "HS512" })
        .setIssuer("gxjwtenchs512")
        .setExpirationTime("10m")
        .sign(new TextEncoder().encode(secret));
      return jwts;
    } catch (error) {
      console.log(error, "kjbedkjwebdw");
    }
  };
  useEffect(() => {
    setWideDrawer(true);
  }, []);

  const getImage = (event) => {
    if (event.target.files && event.target.files[0]) {
      let reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      insertMyImage(event.target.files[0]);
    }
    // insertMyImage(event.target.files[0]);
  };

  const insertMyImage = async (file) => {
    setLoading(true);
    const fileName = `${new Date().getTime()}${file.name.substr(
      file.name.lastIndexOf(".")
    )}`;
    const formData = new FormData();
    // const file = renameFile(file, fileName);
    formData.append("files", file);
    const path_inside_brain = "root/";

    const jwts = await signJwt(fileName, emailDev, secret);
    console.log(jwts, "lkjkswedcf");
    let { data } = await axios.post(
      `https://drivetest.globalxchange.io/file/dev-upload-file?email=${emailDev}&path=${path_inside_brain}&token=${jwts}&name=${fileName}`,
      formData,
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
    restoreSelection();

    document.execCommand("insertImage", false, data.payload.url);
    var imagen = document.querySelector("img[src='" + data.payload.url + "']");
    imagen.style.width = "100%";
    imagen.style.height = "100%";
    setLoading(false);
    // setUpdatedData(data.payload.url);
    // setImgLoading(false);
  };

  const saveSelection = () => {
    if (window.getSelection) {
      //non IE Browsers
      savedRange = window.getSelection().getRangeAt(0);
    } else if (document.selection) {
      //IE
      savedRange = document.selection.createRange();
    }
  };

  const getLink = (e) => {
    // setLink(e.target.value);
    const selection = window.getSelection().toString();
    console.log(selection, "selection");
    const url = prompt("Enter the URL");
    if (url) {
      document.execCommand('insertHTML', false, '<a href="' + url + '" target="_blank" style="color: #4B9DDC;;text-decoration:underline">' + selection + '</a>');
    }
  }

  const restoreSelection = () => {
    // isInFocus = true;
    // bodyRef.current.focus();
    if (savedRange != null) {
      if (window.getSelection) {
        //non IE and there is already a selection
        var s = window.getSelection();
        console.log("range is there", savedRange);
        if (s.rangeCount > 0) s.removeAllRanges();
        s.addRange(savedRange);
      } else if (document.createRange) {
        //non IE and no selection
        console.log("range is not there");
        window.getSelection().addRange(savedRange);
      } else if (document.selection) {
        //IE
        console.log("range is there IE");
        savedRange.select();
      }
    }
  };

  const getAllApps = async () => {
    setLoading(true);
    const { data } = await axios
      .get("https://publications.apimachine.com/publisher/")
      .catch((error) => {
        throw new Error(
          error?.response?.data?.message || error.message || "API Error"
        );
      });
    if (!data?.status) {
      throw new Error(data?.message);
    } else {
      setLoading(false);
      setAllAuthor(data.data);
    }
  };

  useEffect(() => {
    getAllApps();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "80vh",
        width: "100%",
      }}
    >
      <div>
        {/* <div className="titleOp" style={{ marginTop: "0px" }}>
          Type Article Here
        </div> */}
        <hr />

        <div
          onBlur={saveSelection}
          onMouseUp={saveSelection}
          className="editableDivStyle postbody"
          // ref={bodyRef}
          // value={articleBody}
          // onChange={(e) => {
          //   setArticleBody(e.target.value);
          // }}
          contentEditable="true"
          placeholder="Write Something..."
          style={{ height: window.innerHeight - 395, overflowY: "scroll", overflowX: "hidden" }}
          onInput={(e) => setLocalBody(e.target.innerHTML)}
        // style={{
        //   borderStyle: "none",
        //   padding: "0px 35px",
        //   paddingBottom: "30px",
        //   cursor: "text",
        // }}
        >
          {articleBody ? (
            <div
              dangerouslySetInnerHTML={{
                __html: JSON.parse(articleBody),
              }}
            />
          ) : (
            ""
          )}
        </div>

        <hr />
        {/* <Divider style={{ margin: "0px 0px", marginTop: "20px" }} /> */}
        <div >
          <button
            style={{ borderStyle: "none", background: "none" }}
            onClick={(e) => (document.execCommand("bold", false, null))}
          >
            <AiOutlineBold style={{ fontSize: "15px", fontWeight: "bold" }} />
          </button>
          <button
            style={{ borderStyle: "none", background: "none" }}
            onClick={(e) => (document.execCommand("italic", false, null))}
          >
            <AiOutlineItalic style={{ fontSize: "15px", fontWeight: "bold" }} />
          </button>
          <button
            style={{ borderStyle: "none", background: "none" }}
            onClick={(e) => (document.execCommand("underline", false, null))}
          >
            <AiOutlineUnderline
              style={{ fontSize: "15px", fontWeight: "bold" }}
            />
          </button>
          <button style={{ borderStyle: "none", background: "none" }} onClick={getLink}
          >
            {/* <input type="text" name = "link" value = {link} onChange={getLink}/> */}
            <AiOutlineLink style={{ fontSize: "15px", fontWeight: "bold" }} />
          </button>
          &nbsp;&nbsp;&nbsp;
          <label for="image">
            <input
              accept="image/*"
              onChange={getImage}
              type="file"
              name="image"
              id="image"
              style={{ display: "none" }}
            />
            {!loading ? (
              <AiOutlineCamera
                style={{ fontSize: "15px", fontWeight: "bold" }}
              />
            ) : (
              <>
                <AiOutlineLoading3Quarters
                  style={{ fontSize: "15px", fontWeight: "bold" }}
                />{" "}
                Uploading
              </>
            )}
          </label>
          
        </div>
      </div>
      <div
        className="ftBtns"
        style={{ position: "absolute", bottom: 0, width: "100%", left: 0 }}
      >
        <div
          className="newField"
          onClick={() => {
            onClose();
            setWideDrawer(false);
          }}
          style={{ cursor: "pointer" }}
        >
          Go Back
        </div>
        <div
          className="btnSubmit"
          onClick={() => {
            setWideDrawer(false);
            setArticleBody(JSON.stringify(localBody));
            btnSubmit(JSON.stringify(localBody));
          }}
        >
          Submit
        </div>
      </div>
    </div>
  );
};

export default EditEnterArticle;
