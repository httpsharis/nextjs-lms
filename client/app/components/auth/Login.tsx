import React, { FC, useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { style } from "@/app/styles/styles";
import { Eye, EyeClosed } from "lucide-react";
import { FaGithub, FaGoogle } from "react-icons/fa";

type Props = {
  setRoute: (route: string) => void;
};

const schema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email")
    .required("Please enter your email"),
  password: Yup.string()
    .required("Please enter your password")
    .min(6, "Password must be at least 6 characters"),
});

const Login: FC<Props> = ({ setRoute }) => {
  const [show, setShow] = useState(false);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: schema,
    onSubmit: async ({ email, password }) => {
      console.log(email, password);
    },
  });

  const { errors, touched, values, handleChange, handleSubmit } = formik;

  return (
    <div className="w-full">
      {/* 1. Improved Copy & Header */}
      <h1 className={`${style.title}`}>Welcome Back</h1>
      <p className="text-center text-slate-500 dark:text-slate-400 mb-6 text-sm font-Poppins">
        Enter your details to access your account.
      </p>

      {/* 2. Structured Form Spacing */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="email" className={`${style.label}`}>
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            id="email"
            placeholder="example@mail.com"
            className={`${
              errors.email && touched.email && "border-red-500"
            } ${style.input}`}
          />
          {errors.email && touched.email && (
            <span className="text-red-500 pt-1 text-sm block">
              {errors.email}
            </span>
          )}
        </div>

        <div className="w-full relative">
          <label htmlFor="password" className={style.label}>
            Password
          </label>
          <input
            type={!show ? "password" : "text"}
            name="password"
            value={values.password}
            onChange={handleChange}
            id="password"
            placeholder="Enter your password"
            className={`${
              errors.password && touched.password && "border-red-500"
            } ${style.input}`}
          />
          {!show ? (
            <EyeClosed
              className="absolute bottom-3 right-3 z-1 cursor-pointer text-slate-400 hover:text-black dark:hover:text-white transition-colors"
              size={20}
              onClick={() => setShow(true)}
            />
          ) : (
            <Eye
              className="absolute bottom-3 right-3 z-1 cursor-pointer text-slate-400 hover:text-black dark:hover:text-white transition-colors"
              size={20}
              onClick={() => setShow(false)}
            />
          )}
          {errors.password && touched.password && (
            <span className="text-red-500 pt-1 text-sm block">
              {errors.password}
            </span>
          )}
        </div>

        {/* 3. Brand Gradient Submit Button */}
        <div className="w-full mt-2">
          <input
            type="submit"
            value="Login"
            className="w-full py-3 text-[16px] font-Poppins font-semibold text-white bg-linear-to-r from-blue-500 to-teal-400 rounded-lg hover:opacity-90 transition-opacity duration-300 shadow-lg cursor-pointer"
          />
        </div>

        {/* 4. Professional Divider */}
        <div className="flex items-center my-2">
          <div className="grow border-t border-slate-300 dark:border-slate-700"></div>
          <span className="px-4 text-sm text-slate-500 font-Poppins">
            Or continue with
          </span>
          <div className="grow border-t border-slate-300 dark:border-slate-700"></div>
        </div>

        {/* 5. Clickable Social Buttons */}
        <div className="flex gap-4 mb-2">
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-black dark:text-white font-medium font-Poppins"
          >
            <FaGoogle size={20} /> Google
          </button>
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-black dark:text-white font-medium font-Poppins"
          >
            <FaGithub size={20} /> GitHub
          </button>
        </div>

        {/* 6. Fixed Grammar in Footer */}
        <h5 className="text-center pt-2 font-Poppins text-[14px] text-slate-600 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <span
            className="text-blue-500 pl-1 cursor-pointer hover:underline font-semibold"
            onClick={() => setRoute("Sign-Up")}
          >
            Sign Up
          </span>
        </h5>
      </form>
    </div>
  );
};

export default Login;
