import React from "react";
import aiprowallet from "../../static/images/dropdown/aiprowallet.svg";
import viralverse from "../../static/images/dropdown/viralverse.svg";
import Retired from "../../static/images/dropdown/Retired.svg";
import tradestream from "../../static/images/dropdown/tradestream.svg";
import signals from "../../static/images/dropdown/signals.svg";
import accountants from "../../static/images/dropdown/accountants.svg";
import web3today from "../../static/images/dropdown/web3today.svg";
import investmentbots from "../../static/images/dropdown/investmentbots.svg";
import aircoins from "../../static/images/dropdown/aircoins.svg";
import assetsio from "../../static/images/dropdown/assetsio.svg";
import holidays from "../../static/images/dropdown/holidays.svg";
import influencecoin from "../../static/images/dropdown/influencecoin.svg";
import malls from "../../static/images/dropdown/malls.svg";
import roicoin from "../../static/images/dropdown/roicoin.svg";
import web3certify from "../../static/images/dropdown/web3certify.svg";
import "./dropdown.css";

const dropDownMenu = [
  {
    id: 0,
    image: aiprowallet,
    title: `AiProWallet`,
    desc: `AI Enabled Wallet`,
    link: `https://aiprowallet.com`,
    background:
      "linear-gradient(90deg, rgba(129, 203, 215, 0.03), rgba(61, 67, 148, 0.03))",
  },
  {
    id: 1,
    image: Retired,
    title: `Retired App`,
    desc: `Ai Enabled Retirement Planner`,
    link: `https://retired.app`,
    background: "rgba(68, 194, 244, 0.03)",
  },
  {
    id: 2,
    image: signals,
    title: `Signals`,
    desc: `Social Network For Trade Ideas`,
    link: `https://signals.app`,
    background: "rgba(48, 47, 47, 0.03)",
  },
  {
    id: 3,
    image: assetsio,
    title: `Assets.io`,
    desc: `Fractionalizing Real World Assets`,
    link: `https://assets.io`,
    background: "rgba(75, 91, 178, 0.03)",
  },
  {
    id: 4,
    image: investmentbots,
    title: `InvestmentBots`,
    desc: `Create Your Own Trading Bot`,
    link: `https://investmentbots.com`,
    background: "rgba(75, 91, 178, 0.03)",
  },
];

const dropDownMenu1 = [
  {
    id: 0,
    image: viralverse,
    title: `ViralVerse`,
    desc: `Affiliate Marketing Ecosystem`,
    link: `https://viral.group`,
    background: "rgba(207, 26, 56, 0.03)",
  },
];

const dropDownMenu2 = [
  {
    id: 0,
    image: tradestream,
    title: `TradeStream`,
    desc: `Social Trading Terminal`,
    link: `https://trade.stream`,
    background: "rgba(13, 171, 209, 0.03)",
  },
  {
    id: 1,
    image: accountants,
    title: `Accountants`,
    desc: `Streamline Your Accounting Practice`,
    link: `https://accountants.io`,
    background: "rgba(26, 107, 180, 0.03)",
  },
];

const dropDownMenu4 = [
  {
    id: 0,
    image: malls,
    title: `Malls`,
    desc: `Token-Gated Commerce`,
    link: `https://malls.app`,
    background: "rgba(102, 105, 176, 0.03)",
  },
  {
    id: 1,
    image: holidays,
    title: `Holidays`,
    desc: `Go On A Holiday Every Month`,
    link: `https://holidays.app`,
    background: "rgba(237, 17, 91, 0.03)",
  },
];

const dropDownMenu3 = [
  {
    id: 0,
    image: web3today,
    title: `Web3Today`,
    desc: `LCrypto, AI, Blockchain News Platform`,
    link: `https://web3today.io`,
    background: "rgba(39, 43, 99, 0.03)",
  },
  {
    id: 1,
    image: web3certify,
    title: `Web3 Certified`,
    desc: `Learn Blockchain & AI Skills`,
    link: `https://app.web3today.io`,
    background: "rgba(39, 43, 99, 0.03)",
  },
];

const dropDownMenu5 = [
  {
    id: 0,
    image: roicoin,
    title: `ROICoin`,
    desc: `Access the best traders in the world`,
    link: `https://roicoin.com`,
    background: "rgba(89, 162, 221, 0.03)",
  },
  {
    id: 1,
    image: influencecoin,
    title: `InfluenceCoin`,
    desc: `Monetize Your Influence`,
    link: `https://influencecoin.com`,
    background: "rgba(207, 26, 56, 0.02)",
  },
  {
    id: 3,
    image: aircoins,
    title: `AIRCoins`,
    desc: `Play To Earn And Spend`,
    link: `https://aircoins.io`,
    background: "rgba(68, 194, 244, 0.03)",
  },
];

const Dropdown = () => {
  return (
    <div className="dropcontainer">
      <div>
        <div className="divide-text">AIR Apps For Investors</div>
        <div className="alldropdowns">
          {dropDownMenu.map((each, i) => (
            <button
              onClick={() => window.open(each.link, "_blank")}
              className="eachdropdown"
              style={{ background: each.background }}
            >
              <div>
                <img src={each.image} alt="" />
              </div>
              <div className="droptitle">{each.title}</div>
              <div className="droptext">{each.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="divide-text">
          AIR Apps For Affiliates, Brands, and Influencers
        </div>
        <div className="alldropdowns">
          {dropDownMenu1.map((each, i) => (
            <button
              onClick={() => window.open(each.link, "_blank")}
              className="eachdropdown"
              style={{ background: each.background }}
            >
              <div>
                <img src={each.image} alt="" />
              </div>
              <div className="droptitle">{each.title}</div>
              <div className="droptext">{each.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="divide-text">AIR Apps For Finance Professionals</div>
        <div className="alldropdowns">
          {dropDownMenu2.map((each, i) => (
            <button
              onClick={() => window.open(each.link, "_blank")}
              className="eachdropdown"
              style={{ background: each.background }}
            >
              <div>
                <img src={each.image} alt="" />
              </div>
              <div className="droptitle">{each.title}</div>
              <div className="droptext">{each.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="divide-text">AIR Apps For Education</div>
        <div className="alldropdowns">
          {dropDownMenu3.map((each, i) => (
            <button
              onClick={() => window.open(each.link, "_blank")}
              className="eachdropdown"
              style={{ background: each.background }}
            >
              <div>
                <img src={each.image} alt="" />
              </div>
              <div className="droptitle">{each.title}</div>
              <div className="droptext">{each.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="divide-text">AIR Apps For Lifestyle</div>
        <div className="alldropdowns">
          {dropDownMenu4.map((each, i) => (
            <button
              onClick={() => window.open(each.link, "_blank")}
              className="eachdropdown"
              style={{ background: each.background }}
            >
              <div>
                <img src={each.image} alt="" />
              </div>
              <div className="droptitle">{each.title}</div>
              <div className="droptext">{each.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="divide-text">AIR Tokens</div>
        <div className="alldropdowns">
          {dropDownMenu5.map((each, i) => (
            <button
              onClick={() => window.open(each.link, "_blank")}
              className="eachdropdown"
              style={{ background: each.background }}
            >
              <div>
                <img src={each.image} alt="" />
              </div>
              <div className="droptitle">{each.title}</div>
              <div className="droptext">{each.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
