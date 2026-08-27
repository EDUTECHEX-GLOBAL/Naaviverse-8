import React from "react";
import Lottie from "react-lottie";
import * as animationDataLoad from "./loading.json";
import * as animationLoginLoad from "./login-loading.json";
import * as animationFetchLoad from "./fetching-animation.json";
import * as animationVerifying from "./verifying.json";
import * as animationDone from "./done.json";
import * as animationAdd from "./adding.json";
import * as animationFailed from "./failed.json";
import * as animationNoData from "./no-data.json";

export default function LoadingAnimation({
  type = "login",
  info,
  size = { height: 150, width: 150 },
  loop = true,
}) {
  let animate = null,
    animateLogin = null,
    animateFetch = null,
    animateVerify = null,
    animateDone = null,
    animateAdd = null,
    animateFailed = null,
    animateNoData = null;
  animate = animationDataLoad.default;
  animateLogin = animationLoginLoad.default;
  animateFetch = animationFetchLoad.default;
  animateVerify = animationVerifying.default;
  animateDone = animationDone.default;
  animateAdd = animationAdd.default;
  animateFailed = animationFailed.default;
  animateNoData = animationNoData.default;
  const selectAnimation = () => {
    switch (type) {
      case "loading":
        return animate;
      case "login":
        return animateLogin;
      case "fetch":
        return animateFetch;
      case "verify":
        return animateVerify;
      case "done":
        return animateDone;
      case "add":
        return animateAdd;
      case "failed":
        return animateFailed;
      case "no-data":
        return animateNoData;
      default:
        return;
    }
  };

  const defaultOptions = {
    loop: loop,
    autoplay: true,
    animationData: selectAnimation(),
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  return (
    <React.Fragment>
      <div className="d-flex w-100 h-100 flex-column justify-content-center align-items-center">
        <Lottie
          style={{ padding: 0 }}
          width={size.width}
          height={size.height}
          options={defaultOptions}
        />
        {!info?"":<h6>{info}</h6>}
      </div>
    </React.Fragment>
  );
}
