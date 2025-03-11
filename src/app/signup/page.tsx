"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAuthIntegration } from "@/lib/hooks/useAuthIntegration";
import Link from "next/link";
import { FaArrowLeft, FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { motion } from "framer-motion";

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { user } = useAuth();
  const { isAuthenticated, signInWithGoogle, createUserWithEmail } = useAuthIntegration();
  const router = useRouter();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Password strength calculator
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    // Length check
    if (password.length >= 8) strength += 1;
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1;
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;
    // Contains number
    if (/[0-9]/.test(password)) strength += 1;
    // Contains special char
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("Please enter your email, password, and confirm password.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      // Create new user with email and password directly using Firebase
      await createUserWithEmail(email, password);
      // The redirection will be handled by the useEffect hook above
    } catch (error: any) {
      let errorMessage = "Failed to create an account.";
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      // Redirection handled by useEffect
    } catch (error: any) {
      setError(error.message || "Failed to sign up with Google");
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength <= 3) return "Medium";
    return "Strong";
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-green-50">
      {/* Left side - Illustration/Animation */}
      <div className="hidden md:flex md:w-1/2 bg-blue-600 justify-center items-center p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-orange-500"></div>
        <div className="absolute inset-0 opacity-20">
          {/* Abstract pattern background */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-white opacity-5 transform -skew-y-6"></div>
          <div className="absolute top-1/4 left-0 right-0 h-16 bg-white opacity-5 transform skew-y-3"></div>
          <div className="absolute bottom-1/3 left-0 right-0 h-24 bg-white opacity-5 transform -skew-y-8"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Join Us Today!</h1>
            <p className="text-blue-100 text-xl">Create an account to get started</p>
          </motion.div>
          
          {/* Animated shapes */}
          <motion.div 
            animate={{ 
              rotate: [0, -10, 0, 10, 0], 
              y: [0, 10, 0, -10, 0] 
            }}
            transition={{ 
              duration: 8, 
              ease: "easeInOut", 
              repeat: Infinity 
            }}
            className="w-64 h-64 mx-auto relative"
          >
            <div className="absolute top-0 left-0 w-40 h-40 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <motion.div 
        className="flex-1 flex justify-center items-center p-4 md:p-10"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full max-w-md">
          {/* Back button */}
          <motion.div 
            className="mb-6"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <button 
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-800 flex items-center transition-colors duration-300"
            >
              <FaArrowLeft className="mr-2" />
              <span>Back to Home</span>
            </button>
          </motion.div>

          <motion.div 
            className="bg-white p-8 rounded-2xl shadow-xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2 
              className="text-3xl font-bold text-gray-800 mb-2 text-center"
              variants={itemVariants}
            >
              Create Account
            </motion.h2>
            
            <motion.p 
              className="text-gray-500 text-center mb-8"
              variants={itemVariants}
            >
              Sign up to join our community
            </motion.p>
            
            {error && (
              <motion.div 
                className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {error}
              </motion.div>
            )}
            
            <form onSubmit={handleSubmit}>
              <motion.div className="mb-5" variants={itemVariants}>
                <label
                  htmlFor="email"
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </motion.div>
              
              <motion.div className="mb-5" variants={itemVariants}>
                <label
                  htmlFor="password"
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-gray-500">Password strength:</div>
                      <div className="text-xs font-medium" style={{ color: passwordStrength <= 1 ? '#EF4444' : passwordStrength <= 3 ? '#F59E0B' : '#10B981' }}>
                        {getPasswordStrengthText()}
                      </div>
                    </div>
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getPasswordStrengthColor()}`} 
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      <ul className="list-disc pl-4 space-y-1">
                        <li className={password.length >= 8 ? "text-green-500" : ""}>At least 8 characters</li>
                        <li className={/[A-Z]/.test(password) ? "text-green-500" : ""}>At least one uppercase letter</li>
                        <li className={/[0-9]/.test(password) ? "text-green-500" : ""}>At least one number</li>
                        <li className={/[^A-Za-z0-9]/.test(password) ? "text-green-500" : ""}>At least one special character</li>
                      </ul>
                    </div>
                  </div>
                )}
              </motion.div>
              
              <motion.div className="mb-6" variants={itemVariants}>
                <label
                  htmlFor="confirmPassword"
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">Passwords don't match</p>
                )}
              </motion.div>
              
              <motion.div 
                className="mb-6"
                variants={itemVariants}
              >
                <div className="flex items-center">
                  <input
                    id="terms"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    required
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                    I agree to the <a href="#" className="text-blue-600 hover:text-blue-500">Terms of Service</a> and <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
                  </label>
                </div>
              </motion.div>
              
              <motion.div className="space-y-4" variants={itemVariants}>
                <button
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  Create Account
                </button>
                
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-gray-300 absolute w-full"></div>
                  <div className="bg-white px-4 relative text-sm text-gray-500">Or sign up with</div>
                </div>
                
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
                >
                  <FaGoogle className="text-red-500 mr-2" />
                  Sign up with Google
                </button>
              </motion.div>
            </form>
            
            <motion.div 
              className="mt-8 text-center"
              variants={itemVariants}
            >
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/signin" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-300">
                  Sign in
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;