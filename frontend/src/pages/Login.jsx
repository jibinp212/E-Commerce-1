// import { useState } from "react";

// const Login = () => {
//   const [state, setState] = useState("Login");

//   const [formData, setFormData] = useState({
//     username: "",
//     password: "",
//     email: "",
//   });
//   const changeHandler = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };
//   const login = async () => {
//     console.log("Login function Executed", formData);
//     let responseData;
//     await fetch("http://localhost:4000/login", {
//       method: "POST",
//       headers: {
//         Accept: "application/formData",
//         "Content-type": "application/json",
//       },
//       body: JSON.stringify(formData),
//     })
//       .then((response) => response.json())
//       .then((data) => (responseData = data));

//     if (responseData.success) {
//       localStorage.setItem("auth-token", responseData.token);
//       window.location.replace("/");
//     } else {
//       alert(responseData.errors);
//     }
//   };

//   const signup = async () => {
//     console.log("signup function Executed", formData);
//     let responseData;
//     await fetch("http://localhost:4000/signup", {
//       method: "POST",
//       headers: {
//         Accept: "application/formData",
//         "Content-type": "application/json",
//       },
//       body: JSON.stringify(formData),
//     })
//       .then((response) => response.json())
//       .then((data) => (responseData = data));

//     if (responseData.success) {
//       localStorage.setItem("auth-token", responseData.token);
//       window.location.replace("/");
//     } else {
//       alert(responseData.errors);
//     }
//   };

//   return (
//     <section className="max_padd_container flexCenter flex-col pt-32">
//       <div className="max-w-[555px] h-[600px] bg-white m-auto px-14 py-10 rounded-md">
//         <h3 className="h3"> {state}</h3>
//         <div className="flex flex-col gap-4 mt-7">
//           {state === "Sign Up" ? (
//             <input
//               name="username"
//               value={formData.username}
//               onChange={changeHandler}
//               type="text"
//               placeholder="Your Name"
//               className="h-14 w-full pl-5 bg-slate-900/5 outline-none rounded-xl"
//             />
//           ) : (
//             ""
//           )}
//           <input
//             name="email"
//             value={formData.email}
//             onChange={changeHandler}
//             type="email"
//             placeholder="Email Address "
//             className="h-14 w-full pl-5 bg-slate-900/5 outline-none rounded-xl"
//           />
//           <input
//             name="password"
//             onClick={formData.password}
//             onChange={changeHandler}
//             type="Password"
//             placeholder="Password"
//             className="h-14 w-full pl-5 bg-slate-900/5 outline-none rounded-xl"
//           />
//         </div>
//         <button
//           onClick={() => {
//             state === "Login" ? login() : signup();
//           }}
//           className="btn_dark_rounded my-5 w-full !rounded-md"
//         >
//           continue
//         </button>

//         {state === "Sign Up" ? (
//           <p className="text-black font-bold ">
//             Already have an Account?
//             <span
//               onClick={() => {
//                 setState("Login");
//               }}
//               className="text-secondary underline cursor-pointer"
//             >
//               Login
//             </span>
//           </p>
//         ) : (
//           <p className="text-black font-bold ">
//             Create an Account{" "}
//             <span
//               onClick={() => {
//                 setState("Sign Up");
//               }}
//               className="text-pink-700 underline cursor-pointer"
//             >
//               Create Accout
//             </span>
//           </p>
//         )}

//         <div className="flexCenter mt-6 gap-3">
//           <input type="checkbox" name="" id="" />
//           <p> By Continue, i agree to the terms of use & privacy policy. </p>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Login;

// // last code below 
// import { useState } from "react";

// const Login = () => {
//   const [state, setState] = useState("Login");
//   const [formData, setFormData] = useState({
//     username: "",
//     password: "",
//     email: "",
//   });
//   const [otp, setOtp] = useState("");
//   const [showOtpInput, setShowOtpInput] = useState(false);

//   const changeHandler = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const otpChangeHandler = (e) => {
//     setOtp(e.target.value);
//   };

//   const login = async () => {
//     console.log("Login function Executed", formData);
//     let responseData;
//     await fetch("http://localhost:4000/login", {
//       method: "POST",
//       headers: {
//         Accept: "application/json",
//         "Content-type": "application/json",
//       },
//       body: JSON.stringify(formData),
//     })
//       .then((response) => response.json())
//       .then((data) => (responseData = data));

//     if (responseData.success) {
//       setShowOtpInput(true);
//     } else {
//       alert(responseData.errors);
//     }
//   };

//   const verifyOtp = async () => {
//     console.log("Verify OTP function Executed", otp);
//     let responseData;
//     await fetch("http://localhost:4000/verify-otp", {
//       method: "POST",
//       headers: {
//         Accept: "application/json",
//         "Content-type": "application/json",
//       },
//       body: JSON.stringify({ email: formData.email, otp }),
//     })
//       .then((response) => response.json())
//       .then((data) => (responseData = data));

//     if (responseData.success) {
//       localStorage.setItem("auth-token", responseData.token);
//       window.location.replace("/");
//     } else {
//       alert(responseData.errors);
//     }
//   };

//   const signup = async () => {
//     console.log("Signup function Executed", formData);
//     let responseData;
//     await fetch("http://localhost:4000/signup", {
//       method: "POST",
//       headers: {
//         Accept: "application/json",
//         "Content-type": "application/json",
//       },
//       body: JSON.stringify(formData),
//     })
//       .then((response) => response.json())
//       .then((data) => (responseData = data));

//     if (responseData.success) {
//       localStorage.setItem("auth-token", responseData.token);
//       window.location.replace("/");
//     } else {
//       alert(responseData.errors);
//     }
//   };

//   return (
//     <section className="max_padd_container flexCenter flex-col pt-32">
//       <div className="max-w-[555px] h-[600px] bg-white m-auto px-14 py-10 rounded-md">
//         <h3 className="h3"> {state}</h3>
//         <div className="flex flex-col gap-4 mt-7">
//           {state === "Sign Up" ? (
//             <input
//               name="username"
//               value={formData.username}
//               onChange={changeHandler}
//               type="text"
//               placeholder="Your Name"
//               className="h-14 w-full pl-5 bg-slate-900/5 outline-none rounded-xl"
//             />
//           ) : (
//             ""
//           )}
//           <input
//             name="email"
//             value={formData.email}
//             onChange={changeHandler}
//             type="email"
//             placeholder="Email Address"
//             className="h-14 w-full pl-5 bg-slate-900/5 outline-none rounded-xl"
//           />
//           <input
//             name="password"
//             value={formData.password}
//             onChange={changeHandler}
//             type="password"
//             placeholder="Password"
//             className="h-14 w-full pl-5 bg-slate-900/5 outline-none rounded-xl"
//           />
//         </div>
//         {showOtpInput ? (
//           <div className="flex flex-col gap-4 mt-7">
//             <input
//               name="otp"
//               value={otp}
//               onChange={otpChangeHandler}
//               type="text"
//               placeholder="Enter OTP"
//               className="h-14 w-full pl-5 bg-slate-900/5 outline-none rounded-xl"
//             />
//           </div>
//         ) : null}
//         <button
//           onClick={() => {
//             if (showOtpInput) {
//               verifyOtp();
//             } else {
//               state === "Login" ? login() : signup();
//             }
//           }}
//           className="btn_dark_rounded my-5 w-full !rounded-md"
//         >
//           {showOtpInput ? "Verify OTP" : "Continue"}
//         </button>

//         {state === "Sign Up" ? (
//           <p className="text-black font-bold ">
//             Already have an Account?
//             <span
//               onClick={() => {
//                 setState("Login");
//               }}
//               className="text-pink-700 underline cursor-pointer"
//             >
//               Login
//             </span>
//           </p>
//         ) : (
//           <p className="text-black font-bold ">
//             Create an Account{" "}
//             <span
//               onClick={() => {
//                 setState("Sign Up");
//               }}
//               className="text-pink-700 underline cursor-pointer"
//             >
//               Create Account
//             </span>
//           </p>
//         )}

//         <div className="flexCenter mt-6 gap-3">
//           <input type="checkbox" name="" id="" />
//           <p> By continuing, I agree to the terms of use & privacy policy. </p>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Login;

// last code above 
import { useState } from "react";

const Login = () => {
  const [state, setState] = useState("Sign Up");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
  });
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const otpChangeHandler = (e) => {
    setOtp(e.target.value);
  };

  const handleResponse = async (url, data) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      setLoading(false);
      if (!response.ok) {
        setError(responseData.errors || "Something went wrong");
        return null;
      }
      return responseData;
    } catch (err) {
      setLoading(false);
      setError("Network error");
      return null;
    }
  };

  const login = async () => {
    console.log("Login function Executed", formData);
    const responseData = await handleResponse("http://localhost:4000/login", formData);
    if (responseData && responseData.success) {
      setShowOtpInput(true);
    }
  };

  const verifyOtp = async () => {
    console.log("Verify OTP function Executed", otp);
    const responseData = await handleResponse("http://localhost:4000/verify-otp", {
      email: formData.email,
      otp,
    });
    if (responseData && responseData.success) {
      localStorage.setItem("auth-token", responseData.token);
      window.location.replace("/");
    }
  };

  const signup = async () => {
    console.log("Signup function Executed", formData);
    const responseData = await handleResponse("http://localhost:4000/signup", formData);
    if (responseData && responseData.success) {
      alert("Signup successful! Please log in to continue.");
      setState("Login");
      setFormData({ username: "", password: "", email: formData.email });
    }
  };

  return (
    <section className="max_padd_container flexCenter flex-col pt-32">
      <div className="max-w-[555px] h-[600px] bg-white m-auto px-14 py-10 rounded-md">
        <h3 className="h3"> {state}</h3>
        <div className="flex flex-col gap-4 mt-7">
          {state === "Sign Up" && (
            <input
              name="username"
              value={formData.username}
              onChange={changeHandler}
              type="text"
              placeholder="Your Name"
              className="h-14 w-full pl-5 bg-slate-900/5 outline-none rounded-xl"
            />
          )}
          <input
            name="email"
            value={formData.email}
            onChange={changeHandler}
            type="email"
            placeholder="Email Address"
            className="h-14 w-full pl-5 bg-slate-900/5 outline-none rounded-xl"
          />
          <input
            name="password"
            value={formData.password}
            onChange={changeHandler}
            type="password"
            placeholder="Password"
            className="h-14 w-full pl-5 bg-slate-900/5 outline-none rounded-xl"
          />
        </div>
        {showOtpInput && (
          <div className="flex flex-col gap-4 mt-7">
            <input
              name="otp"
              value={otp}
              onChange={otpChangeHandler}
              type="text"
              placeholder="Enter OTP"
              className="h-14 w-full pl-5 bg-slate-900/5 outline-none rounded-xl"
            />
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
        <button
          onClick={() => {
            if (showOtpInput) {
              verifyOtp();
            } else {
              state === "Login" ? login() : signup();
            }
          }}
          className="btn_dark_rounded my-5 w-full !rounded-md"
          disabled={loading}
        >
          {loading ? "Loading..." : showOtpInput ? "Verify OTP" : "Continue"}
        </button>

        {state === "Sign Up" ? (
          <p className="text-black font-bold ">
            Already have an Account?
            <span
              onClick={() => {
                setState("Login");
              }}
              className="text-pink-700 underline cursor-pointer"
            >
              Login
            </span>
          </p>
        ) : (
          <p className="text-black font-bold ">
            Create an Account{" "}
            <span
              onClick={() => {
                setState("Sign Up");
              }}
              className="text-pink-700 underline cursor-pointer"
            >
              Create Account
            </span>
          </p>
        )}

        <div className="flexCenter mt-6 gap-3">
          <input type="checkbox" name="" id="" />
          <p> By continuing, I agree to the terms of use & privacy policy. </p>
        </div>
      </div>
    </section>
  );
};
export default Login;
