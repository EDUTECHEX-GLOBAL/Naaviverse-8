import React from 'react';
import Lottie from 'react-lottie';

import * as animationData from './transferMoney.json';

function LoadingAnimCash() {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData.default,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return <Lottie options={defaultOptions} height={150} width={150} />;
}

export default LoadingAnimCash;
