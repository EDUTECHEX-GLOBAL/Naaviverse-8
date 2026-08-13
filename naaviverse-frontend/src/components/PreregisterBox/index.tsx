import axios from "axios";
import { memo, useMemo, useState } from "react";
import { useMutation } from "react-query";
import { toast } from "react-toastify";
import { APP_CODE, FULL_LOGO } from "../../configs";
import { useRegisterdUsers } from "../../queryHooks";
import { validateEmail } from "../../utils/FunctionTools";
import LoadingAnimation from "../LoadingAnimation";
import poweredBy from "../../static/images/logos/poweredBy.svg";
import classNames from "./preregisterBox.module.scss";

async function preRegister(paramData: any) {
  const { data } = await axios.post(
    "https://gxauth.apimachine.com/gx/user/admin/signup",
    paramData
  );
  return data;
}

function PreregisterBox() {
  const { data = { emails: [], usernames: [] } } = useRegisterdUsers();
  const [referer, setReferer] = useState("");
  const [email, setEmail] = useState("");
  const [uname, setUname] = useState("");
  const [step, setStep] = useState(0);
  const { isLoading, mutate } = useMutation(preRegister, {
    onSuccess: (data) => {
      if (data.status) {
        setStep(3);
      } else {
        toast(data.message || "Some Thing Went Wrong!");
      }
    },
  });

  const getStep = useMemo(() => {
    switch (step) {
      case 1:
        return (
          <>
            <label className={classNames.inputWrap}>
              <input
                type="email"
                className={classNames.input}
                placeholder="Enter Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div
                className={`${classNames.circle} ${
                  classNames[
                    (
                      !data.emails.includes(email) && validateEmail(email)
                    ).toString()
                  ]
                }`}
              ></div>
            </label>
            <button
              disabled={data.emails.includes(email) || !validateEmail(email)}
              className={classNames.button}
              onClick={() => setStep(2)}
            >
              Next Step
            </button>
          </>
        );
      case 2:
        return (
          <>
            <label className={classNames.inputWrap}>
              <input
                type="text"
                className={classNames.input}
                placeholder="Reserve A Username"
                value={uname}
                onChange={(e) => setUname(e.target.value)}
              />
              <div
                className={`${classNames.circle} ${
                  classNames[
                    (
                      !data.usernames.includes(uname) && uname.length > 3
                    ).toString()
                  ]
                }`}
              ></div>
            </label>
            <button
              disabled={data.usernames.includes(uname) || uname.length < 4}
              className={classNames.button}
              onClick={() =>
                mutate({
                  username: uname,
                  email: email,
                  ref_affiliate: referer,
                  app_code: APP_CODE,
                })
              }
            >
              Pre-Register
            </button>
          </>
        );
      case 3:
        return (
          <p className={classNames.success}>
            You Have Successfully Been Added To The Waitlist. Get Back To The
            Person Who Gave You The Invitation Code For Your Next Steps.
          </p>
        );
      case 0:
      default:
        return (
          <>
            <label className={classNames.inputWrap}>
              <input
                type="text"
                className={classNames.input}
                placeholder="Enter You’re Invitation Code"
                value={referer}
                onChange={(e) => setReferer(e.target.value)}
              />
              <div
                className={`${classNames.circle} ${
                  classNames[data.usernames.includes(referer).toString()]
                }`}
              ></div>
            </label>
            <button
              disabled={!data.usernames.includes(referer)}
              className={classNames.button}
              onClick={() => setStep(1)}
            >
              Next Step
            </button>
          </>
        );
    }
  }, [data.emails, data.usernames, email, mutate, referer, step, uname]);

  return (
    <div
      className={`${classNames.preregisterBox} ${
        classNames[(step === 3).toString()]
      }`}
    >
      <img src={FULL_LOGO} alt="" className={classNames.logo} />
      {getStep}
      <img src={poweredBy} alt="" className={classNames.poweredBy} />
      {isLoading && <LoadingAnimation />}
    </div>
  );
}

export default memo(PreregisterBox);
