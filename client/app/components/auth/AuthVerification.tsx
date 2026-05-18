import { style } from "@/app/styles/styles";
import { ShieldUser } from "lucide-react";
import React, { FC, useRef, useState } from "react";

type Props = {
  setRoute: (route: string) => void;
};

type VerifyNumber = {
  "0": string;
  "1": string;
  "2": string;
  "3": string;
};

const AuthVerification: FC<Props> = ({ setRoute }) => {
  const [invalidError, setInvalidError] = useState<boolean>(false);
  const [verifyNumber, setVerifyNumber] = useState<VerifyNumber>({
    0: "",
    1: "",
    2: "",
    3: "",
  });

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const verificationHandler = async () => {
    // 1. Glue the numbers together into one string
    const verificationNumber = Object.values(verifyNumber).join("");

    // 2. Check if they left any boxes empty
    if (verificationNumber.length !== 4) {
      setInvalidError(true);
      return;
    }

    // 3. Mock API Check (Pretend "1234" is the correct code sent to email)
    console.log("Checking code:", verificationNumber);

    if (verificationNumber !== "1234") {
      // If wrong, trigger the red shake animation
      setInvalidError(true);
    } else {
      // If correct, clear errors and move to the next step!
      setInvalidError(false);
      console.log("Success! Code is correct.");
      // Later, you will route them to the dashboard here
    }
  };

  const handleInputChange = (index: number, value: string) => {
    setInvalidError(false);
    const newVerifyNumber = { ...verifyNumber, [index]: value };
    setVerifyNumber(newVerifyNumber);

    if (value === "" && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (value.length === 1 && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h1 className={`${style.title}`}>Verify Your Account</h1>

      {/* 1. Added a helpful subtitle */}
      <p className="text-center text-slate-500 dark:text-slate-400 mb-6 text-sm font-Poppins mt-2">
        Enter the 4-digit code sent to your email.
      </p>

      {/* 2. Brand Gradient Icon */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center mb-8 shadow-lg shadow-blue-500/30">
        <ShieldUser size={40} className="text-white" />
      </div>

      {/* 3. Responsive Flex Container replacing w-275 */}
      <div className="w-full max-w-sm m-auto flex items-center justify-center gap-4 mb-8">
        {Object.keys(verifyNumber).map((key, index) => (
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            key={key}
            ref={inputRefs[index]}
            // Fixed widths, added focus states, and smoothed out the borders
            className={`w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 dark:bg-slate-800 border-[2px] rounded-xl flex items-center text-black dark:text-white justify-center text-2xl font-Poppins outline-none text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${
              invalidError
                ? "shake border-red-500"
                : "border-slate-300 dark:border-slate-700"
            }`}
            placeholder=""
            maxLength={1}
            value={verifyNumber[key as keyof VerifyNumber]}
            onChange={(e) => handleInputChange(index, e.target.value)}
          />
        ))}
      </div>

      {/* 4. Brand Gradient Submit Button */}
      <button
        className="w-full py-3 text-[16px] font-Poppins font-semibold text-white bg-gradient-to-r from-blue-500 to-teal-400 rounded-lg hover:opacity-90 transition-opacity duration-300 shadow-lg cursor-pointer"
        onClick={verificationHandler}
      >
        Verify OTP
      </button>

      {/* 5. Clean Footer Spacing */}
      <h5 className="text-center pt-6 font-Poppins text-[14px] text-slate-600 dark:text-slate-400">
        Go back to sign in?{" "}
        <span
          className="text-blue-500 pl-1 cursor-pointer hover:underline font-semibold"
          onClick={() => setRoute("Login")}
        >
          Sign In
        </span>
      </h5>
    </div>
  );
};

export default AuthVerification;
