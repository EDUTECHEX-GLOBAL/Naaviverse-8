import React, { useContext, useState } from "react";
import { GlobalContex } from "../../../globalContext";
import LoadingAnimation from "../../LoadingAnimation";
import "./asset.scss"
import axios from "axios";

const NewAsset = () => {
    const { selectedBrandApp, setSelectedBrandApp , selectedTab , setSelectedTab , mcbMenu , setGlobalMenuAdd,    setSlider,
    } = useContext(GlobalContex)
    const [step, setStep] = useState("step1")
    const [theOpac, setTheOpac] = useState(1)

    // {menuName: 'Assets', menuIcon: '/static/media/assets.a565e2e1ae2830380bad81f9cff8774d.svg', enabled: true}

    console.log("brandd", selectedBrandApp?.app_code)

    const stepselect = () => {
        if (selectedBrandApp?.app_code) {
            setStep("step2")
            let body = {
                app_code: selectedBrandApp?.app_code,
                import_friends: true,
                coins: "all"
            }
            axios.post("https://comms.globalxchange.io/gxb/apps/configure", body).then(res => {
                // console.log("allassets ", res.data)
                if (res.data.status) {
                    setStep("step3")
                    setTimeout(() => {
                    setSlider(false);
                    setSelectedTab(mcbMenu[3])
                }, 1000);
                } else {
                    setStep("step1")
                }
            })
        }
    }

    const ConditionalPaths = () => {
        switch (step) {
            case "step1":
                return <> <div className="search-Style">
                    <input
                        type="text"
                        placeholder="Search For New Item To Add.."
                        style={{
                            width: "100%",
                            border: "none",
                            height: "30px",
                            paddingLeft: "20px",
                        }}
                    />
                </div>
                    <div className="appDataCards appText" onClick={stepselect} style={{ opacity: selectedBrandApp?.app_code ? 1 : 0.3 }}>
                        Add All GX Assets To My App
                    </div>
                </>
            case "step2":
                return <div
                    style={{
                        height: window.innerHeight,
                        position: "absolute",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        background: "white"
                    }}
                >
                    <LoadingAnimation logoAnim sideDraw={true} />
                    <div
                        style={{
                            position: "absolute",
                            bottom: "20px",
                            textAlign: "center",
                            fontWeight: "700",
                            fontSize: "20px",
                            color: "#182542"
                        }}
                    >
                        Adding All GX Assets To “{selectedBrandApp?.app_code}”
                    </div>
                </div>
            case "step3":
               return <div className="assetDispText">
                    You Have Successfully Added All GX Assets To “{selectedBrandApp?.app_code}”. You Are Being Redirected To The Asset Page Now
                </div>
        }
    }
    return (
        <>
            {ConditionalPaths()}
        </>
    )
}

export default NewAsset