import React from "react";
import Lottie from "react-lottie";
import * as animationDataLoad from "./main-loading.json";

export default function MainLoadingAnimation() {
  let animate = null;
  animate = animationDataLoad.default;

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animate,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  return (
    <div className="w-100 h-100 d-flex justify-content-center align-items-center">
      <Lottie width={200} height={200} options={defaultOptions} />
    </div>
  );
}
