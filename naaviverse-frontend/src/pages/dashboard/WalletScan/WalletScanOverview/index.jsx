import React, { useState, useMemo } from "react";
import "./wallet.scss";
import scanfull from "../assets/images/icons/scanfull.svg";
import scan from "../assets/images/icons/scan.svg";
import add from "../assets/images/icons/add.svg";
import deleteIcon from "../assets/images/icons/delete.svg";
import rightIco from "../assets/images/icons/thick-right.svg"
import { useNavigate } from "react-router-dom";
import nextId from "react-id-generator";
import AccountSelection from "./ScanWallet";






const WalletScanOverview = () => {
    const navigate = useNavigate();
    const [wallets, setWallets] = useState("");

    const actions = [
        {
            _id: nextId(),
            title: "Scan Existing Wallets",
            description: "Perform a WalletScan for the wallets you have already added.",
            logo: scan,
            id: "scan",
        },
        {
            _id: nextId(),
            title: "Connect New Wallet",
            description: "Add a new wallet to scan.",
            logo: add,
            id: "connect-new",
        },
        {
            _id: nextId(),
            title: "Delete Wallet",
            description: "Delete an existing wallets.",
            logo: deleteIcon,
            id: "delete",
        },
    ];

    const WalletPages = useMemo(() => {
        switch (wallets) {
            case "Scan Existing Wallets":
                return <AccountSelection/>
            default:
                return <div className="menu-page-main" style={{height: '100%'}}>
                    <div className="menu-container">
                        <div className="menu-container-content">
                            <header>
                                <img src={scanfull} />
                            </header>
                            <section className="mcc-section">
                                <ul>
                                    {actions.map((obj) => {
                                        console.log(obj)
                                        return (
                                            <li>
                                                <div
                                                    onClick={() => {
                                                        obj.id == "scan"
                                                            ? setWallets(obj.title)
                                                            : console.log();
                                                    }}
                                                    className="action-card-wrapper"
                                                >
                                                    <div className="acw-left">
                                                        <img src={obj.logo} />
                                                        <div>
                                                            <h4>{obj.title}</h4>
                                                            <p>{obj.description}</p>
                                                        </div>
                                                    </div>
                                                    <button>
                                                        <img src={rightIco} />
                                                    </button>
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </section>
                        </div>
                    </div>
                </div>
        }
    }, [
        wallets,
    ])


    return (
        <div style={{height: '100%'}}>
        {WalletPages}
        </div>
    )
}

export default WalletScanOverview