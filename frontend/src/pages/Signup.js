import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

// Signup now redirects to Login page since OTP handles both login and signup
const Signup = () => {
  return <Navigate to="/login" replace />;
};

export default Signup;
