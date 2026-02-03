import React from "react";

export default function TypeOfAsset({
  type,
  setConfig,
  config,
  setWhich,
  nameImageList,
}) {
  return (
    <div className="download-type-asset">
      <button onClick={()=>{setConfig({...config, subType: "L"}); setWhich("")}}>
        <img src={nameImageList[type].coinImage} />
        {nameImageList[type].coinName}(L)
      </button>
      <button onClick={()=>{setConfig({...config, subType: "MM"}); setWhich("")}}>
        <img src={nameImageList[type].coinImage} />
        {nameImageList[type].coinName}(MM)
      </button>
      <button onClick={()=>{setConfig({...config, subType: "BE"}); setWhich("")}}>
        <img src={nameImageList[type].coinImage} />
        {nameImageList[type].coinName}(BE)
      </button>
    </div>
  );
}
