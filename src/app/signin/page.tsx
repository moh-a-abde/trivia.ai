"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAuthIntegration } from "@/lib/hooks/useAuthIntegration";
import Link from "next/link";
import { FaArrowLeft, FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { motion } from "framer-motion";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { signInWithEmail, signInWithGoogle, isAuthenticated } = useAuthIntegration();
  const router = useRouter();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      setIsLoading(false);
      return;
    }

    try {
      await signInWithEmail(email, password);
      // The redirection will be handled by the useEffect hook above
    } catch (error: any) {
      let errorMessage = "Invalid email or password";
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      // Redirection handled by useEffect
    } catch (error: any) {
      setError(error.message || "Failed to sign in with Google");
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-green-50">
      {/* Left side - Illustration/Animation */}
      <div className="hidden md:flex md:w-1/2 bg-blue-600 justify-center items-center p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-green-500"></div>
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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Welcome Back!</h1>
            <p className="text-blue-100 text-xl">Sign in to continue your journey</p>
          </motion.div>
          
          {/* Animated shapes */}
          <motion.div 
            animate={{ 
              rotate: [0, 10, 0, -10, 0], 
              y: [0, -10, 0, 10, 0] 
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
              Sign In
            </motion.h2>
            
            <motion.p 
              className="text-gray-500 text-center mb-8"
              variants={itemVariants}
            >
              Enter your credentials to access your account
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
              <motion.div className="mb-6" variants={itemVariants}>
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
              
              <motion.div className="mb-4" variants={itemVariants}>
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
                    placeholder="Enter your password"
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
              </motion.div>
              
              <motion.div 
                className="flex items-center justify-between mb-6"
                variants={itemVariants}
              >
                <div className="flex items-center">
                  <input
                    id="remember_me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    Forgot password?
                  </a>
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
                  Sign In
                </button>
                
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-gray-300 absolute w-full"></div>
                  <div className="bg-white px-4 relative text-sm text-gray-500">Or continue with</div>
                </div>
                
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
                >
                  <FaGoogle className="text-red-500 mr-2" />
                  Sign in with Google
                </button>
              </motion.div>
            </form>
            
            <motion.div 
              className="mt-8 text-center"
              variants={itemVariants}
            >
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-300">
                  Sign up now
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignInPage;