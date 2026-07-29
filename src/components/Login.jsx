import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserGraduate,
} from "react-icons/fa";

import axios from "axios";

import { useAuth } from "../context/AuthContext";

import "./Login.css";


const Login = () => {


  const navigate = useNavigate();

  const { login } = useAuth();



  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);



  const [formData, setFormData] = useState({

    role: "student",

    email: "",

    password: "",

  });





  const handleChange = (e) => {


    setFormData({

      ...formData,

      [e.target.name]: e.target.value,

    });


  };







  const handleLogin = async (e) => {


    e.preventDefault();



    if(!formData.email || !formData.password){

      alert("Please fill all fields");

      return;

    }



    try {


      setLoading(true);

console.log(formData);

      const response = await axios.post(

        "http://localhost:5000/api/auth/login",

        formData

      );




      const { token, user } = response.data;



      // Save through AuthContext

      login(user, token);



      alert("Login Successful");

// Redirect based on role
if (user.role === "student") {
  navigate("/dashboard");
} else if (user.role === "faculty") {
  navigate("/faculty-dashboard");
} else if (user.role === "admin") {
  navigate("/admin-dashboard");
} else {
  navigate("/");
}



    }

    catch(error){


      alert(

        error.response?.data?.message ||

        "Invalid email or password"

      );


    }

    finally{


      setLoading(false);


    }


  };







return (

<div className="login-container">


<div className="login-card">



<div className="login-header">


<FaUserGraduate className="login-logo"/>


<h2>NEXUS ERP</h2>


<p>AI College Assistant</p>


</div>






<form onSubmit={handleLogin}>


<label>
Login As
</label>



<select

name="role"

value={formData.role}

onChange={handleChange}

>


<option value="student">
Student
</option>


<option value="faculty">
Faculty
</option>


<option value="admin">
Admin
</option>



</select>








<label>
Email
</label>



<div className="input-group">


<FaEnvelope className="input-icon"/>



<input

type="email"

name="email"

placeholder="Enter Email"

value={formData.email}

onChange={handleChange}

/>



</div>







<label>
Password
</label>



<div className="input-group">


<FaLock className="input-icon"/>



<input

type={showPassword ? "text":"password"}

name="password"

placeholder="Enter Password"

value={formData.password}

onChange={handleChange}

/>





<span

className="password-toggle"

onClick={()=>setShowPassword(!showPassword)}

>

{

showPassword

?

<FaEyeSlash/>

:

<FaEye/>

}


</span>




</div>







<button

type="submit"

className="login-btn"

disabled={loading}

>


{

loading

?

"Logging in..."

:

"Login"

}



</button>





</form>







<div className="login-footer">

© 2026 NEXUS ERP

</div>




</div>


</div>


);


};


export default Login;