import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  LogIn,
  UserPlus,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  Award,
  CheckCircle,
  Mail,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import type { UserAccount } from "../App";
import { authApi } from "../utils/api";
import { projectId } from "../utils/supabase/info";
import logo from "../assets/logo.svg";
import { useNavigate } from "react-router-dom";

interface AuthPageProps {
  onLogin: (user: UserAccount) => void;
  onSignUp: (userData: {
    fullName: string;
    email: string;
    password: string;
    organizationName: string;
  }) => void;
  defaultTab?: "signin" | "signup"; // Optional: which tab to show by default
}

export default function AuthPage({
  onLogin,
  onSignUp,
  defaultTab = "signin",
}: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(defaultTab);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  // Sign In State
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up State
  const [signUpData, setSignUpData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
  });
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password Reset State
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<
    "validation" | "network" | "auth" | null
  >(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorType(null);
    setFieldErrors({});

    // Validation
    const errors: Record<string, string> = {};
    if (!signInData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signInData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!signInData.password) {
      errors.password = "Password is required";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the errors above");
      setErrorType("validation");
      return;
    }

    setIsLoading(true);

    // Show a helpful toast for first-time users
    toast.info(
      "Connecting to server... (first request may take 30-60 seconds)",
      {
        duration: 5000,
      }
    );

    try {
      const response = await authApi.signIn({
        email: signInData.email,
        password: signInData.password,
      });

      // Store access token in localStorage
      localStorage.setItem("accessToken", response.accessToken);

      toast.success("Welcome back! Signed in successfully");
      onLogin(response.user);
    } catch (err: any) {
      console.error("Sign in error:", err);

      // Provide more helpful error messages with error types
      if (err.name === "AbortError") {
        setErrorType("network");
        setError(
          "⏱️ Connection timed out. The Edge Function may be cold starting (first deployment can take 60+ seconds). Please wait a moment and try again."
        );
        toast.error("Connection timed out. Please try again in 30 seconds.", {
          duration: 6000,
        });
      } else if (err.message === "Failed to fetch") {
        setErrorType("network");
        setError(
          "📡 Unable to connect to server. The Edge Function may not be deployed yet or is starting up. This can take 30-60 seconds after deployment. Please wait a moment and try again."
        );
        toast.error(
          "Server not responding. It may be deploying. Try again in 30 seconds.",
          { duration: 6000 }
        );
      } else if (
        err.message.includes("Invalid login credentials") ||
        err.message.includes("Invalid email or password")
      ) {
        setErrorType("auth");
        setError(
          "Invalid email or password. Please check your credentials and try again."
        );
        setFieldErrors({
          email: "Check your email",
          password: "Check your password",
        });
        toast.error("Invalid credentials");
      } else if (err.message.includes("User not found")) {
        setErrorType("auth");
        setError("No account found with this email. Please sign up first.");
        setFieldErrors({ email: "Email not registered" });
        toast.error("Email not found");
      } else {
        setErrorType("auth");
        setError(
          err.message || "An error occurred during sign in. Please try again."
        );
        toast.error("Sign in failed");
      }

      // Log additional debugging info
      console.log("Full error object:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(false);

    if (!resetEmail) {
      setResetError("Please enter your email address");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setResetError("Please enter a valid email address");
      return;
    }

    setResetLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: resetEmail }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setResetSuccess(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      console.error("Password reset error:", err);
      setResetError(
        err.message || "Failed to send reset email. Please try again."
      );
      toast.error("Failed to send reset email");
    } finally {
      setResetLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorType(null);
    setFieldErrors({});

    // Validation
    const errors: Record<string, string> = {};

    if (!signUpData.fullName) {
      errors.fullName = "Full name is required";
    } else if (signUpData.fullName.length < 2) {
      errors.fullName = "Name must be at least 2 characters";
    }

    if (!signUpData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Organization name is optional, but if provided, must be at least 2 characters
    if (signUpData.organizationName && signUpData.organizationName.length < 2) {
      errors.organizationName =
        "Organization name must be at least 2 characters";
    }

    if (!signUpData.password) {
      errors.password = "Password is required";
    } else if (signUpData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(signUpData.password)) {
      errors.password = "Password must include uppercase and lowercase letters";
    }

    if (!signUpData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (signUpData.password !== signUpData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the errors above");
      setErrorType("validation");
      return;
    }

    setIsLoading(true);

    // Show a helpful toast for first-time users
    toast.info(
      "Creating your account... (first request may take 30-60 seconds)",
      {
        duration: 5000,
      }
    );

    try {
      const response = await authApi.signUp({
        email: signUpData.email,
        password: signUpData.password,
        fullName: signUpData.fullName,
        organizationName: signUpData.organizationName,
      });

      // Store access token in localStorage
      localStorage.setItem("accessToken", response.accessToken);

      toast.success("Account created successfully! Welcome aboard!");
      onSignUp({
        fullName: signUpData.fullName,
        email: signUpData.email,
        password: signUpData.password,
        organizationName: signUpData.organizationName,
      });
    } catch (err: any) {
      console.error("Sign up error:", err);

      // Provide more helpful error messages with error types
      if (err.name === "AbortError") {
        setErrorType("network");
        setError(
          "⏱️ Connection timed out. The Edge Function may be cold starting (first deployment can take 60+ seconds). Please wait a moment and try again."
        );
        toast.error("Connection timed out. Please try again in 30 seconds.", {
          duration: 6000,
        });
      } else if (err.message === "Failed to fetch") {
        setErrorType("network");
        setError(
          "📡 Unable to connect to server. The Edge Function may not be deployed yet or is starting up. This can take 30-60 seconds after deployment. Please wait a moment and try again."
        );
        toast.error(
          "Server not responding. It may be deploying. Try again in 30 seconds.",
          { duration: 6000 }
        );
      } else if (
        err.message.includes("already registered") ||
        err.message.includes("User already exists")
      ) {
        setErrorType("auth");
        setError(
          "This email is already registered. Please sign in instead or use a different email."
        );
        setFieldErrors({ email: "Email already in use" });
        toast.error("Email already registered");
      } else if (err.message.includes("invalid email")) {
        setErrorType("validation");
        setError("Please enter a valid email address");
        setFieldErrors({ email: "Invalid email format" });
        toast.error("Invalid email");
      } else {
        setErrorType("auth");
        setError(
          err.message || "An error occurred during sign up. Please try again."
        );
        toast.error("Sign up failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#FFCB9E52] to-[#FFFBF8] relative">
      <div className="">
        <div className="absolute blur-sm -top-[26px] -left-[30px] bg-gradient-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-[100px] w-12 -rotate-45" />
        <div className="absolute blur-sm top-20 -left-[40px] bg-gradient-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-[100px] w-12 -rotate-45" />
        <div className="absolute blur-sm -top-[10px] -left-[33px] bg-gradient-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-[100px] w-12 -rotate-45" />
        <div className="absolute blur-sm -top-[37px] -left-[21px] bg-gradient-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-[100px] w-12 -rotate-45" />
        <div className="absolute blur-sm -top-[37px] left-5 bg-gradient-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-[100px] w-12 -rotate-45" />
        <div className="absolute blur-sm -top-[26px] -right-[30px] bg-gradient-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-[100px] w-12 rotate-45" />
        <div className="absolute blur-sm top-20 -right-[40px] bg-gradient-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-[100px] w-12 rotate-45" />
        <div className="absolute blur-sm -top-[10px] -right-[33px] bg-gradient-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-[100px] w-12 rotate-45" />
        <div className="absolute blur-sm -top-[37px] -right-[21px] bg-gradient-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-[100px] w-12 rotate-45" />
        <div className="absolute blur-sm -top-[37px] right-5 bg-gradient-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-[100px] w-12 rotate-45" />
      </div>
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8  ">
          <div className="flex flex-col items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-lg shadow-sm ">
              <img src={logo} alt="Certifyer Logo" className="w-12 h-12" />
            </div>
            <div className="text-left">
              <h1 className="text-5xl font-bold text-gray-900 text-center ">
                Certifyer
              </h1>
              <p className="text-lg text-gray-600">
                Professional Certificate Management Platform
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          {/* Auth Forms */}
          <div>
            <Card>
              <CardHeader>
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v as "signin" | "signup")}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                {/* Sign In Form */}
                {activeTab === "signin" && (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email Address</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        value={signInData.email}
                        onChange={(e) => {
                          setSignInData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }));
                          // Clear errors when user starts typing
                          if (fieldErrors.email) {
                            setFieldErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.email;
                              return newErrors;
                            });
                          }
                          if (error && errorType === "validation") {
                            setError(null);
                            setErrorType(null);
                          }
                        }}
                        placeholder="Enter your email"
                        disabled={isLoading}
                        className={`h-11 ${
                          fieldErrors.email
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }`}
                      />
                      {fieldErrors.email && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showSignInPassword ? "text" : "password"}
                          value={signInData.password}
                          onChange={(e) => {
                            setSignInData((prev) => ({
                              ...prev,
                              password: e.target.value,
                            }));
                            // Clear errors when user starts typing
                            if (fieldErrors.password) {
                              setFieldErrors((prev) => {
                                const newErrors = { ...prev };
                                delete newErrors.password;
                                return newErrors;
                              });
                            }
                            if (error && errorType === "validation") {
                              setError(null);
                              setErrorType(null);
                            }
                          }}
                          placeholder="Enter your password"
                          disabled={isLoading}
                          className={`h-11 pr-10 ${
                            fieldErrors.password
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowSignInPassword(!showSignInPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showSignInPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {fieldErrors.password && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {fieldErrors.password}
                        </p>
                      )}
                    </div>

                    {error && (
                      <Alert
                        variant={
                          errorType === "network" ? "default" : "destructive"
                        }
                        className={
                          errorType === "network"
                            ? "border-amber-500 bg-amber-50"
                            : ""
                        }
                      >
                        <AlertCircle
                          className={`h-4 w-4 ${
                            errorType === "network" ? "text-amber-600" : ""
                          }`}
                        />
                        <AlertDescription
                          className={
                            errorType === "network" ? "text-amber-800" : ""
                          }
                        >
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-11"
                      disabled={
                        isLoading || !signInData.email || !signInData.password
                      }
                    >
                      {isLoading ? (
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Signing In...
                          </div>
                          {/* <span className="text-xs opacity-75">
                            First request may take 30-60 seconds
                          </span> */}
                        </div>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4 mr-2" />
                          Sign In
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => navigate("/")}
                      className="w-full h-11 bg-orange-500 rounded-sm text-white px-5 py-2 cursor-pointer z-50"
                      aria-label="Back to home"
                    >
                      ← Back to Home
                    </Button>

                    <div className="text-center mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(true);
                          setResetEmail(signInData.email);
                        }}
                        className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  </form>
                )}

                {/* Sign Up Form */}
                {activeTab === "signup" && (
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name *</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        value={signUpData.fullName}
                        onChange={(e) => {
                          setSignUpData((prev) => ({
                            ...prev,
                            fullName: e.target.value,
                          }));
                          if (fieldErrors.fullName) {
                            setFieldErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.fullName;
                              return newErrors;
                            });
                          }
                          if (error && errorType === "validation") {
                            setError(null);
                            setErrorType(null);
                          }
                        }}
                        placeholder="Enter your full name"
                        disabled={isLoading}
                        className={`h-11 ${
                          fieldErrors.fullName
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }`}
                      />
                      {fieldErrors.fullName && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {fieldErrors.fullName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email Address *</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signUpData.email}
                        onChange={(e) => {
                          setSignUpData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }));
                          if (fieldErrors.email) {
                            setFieldErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.email;
                              return newErrors;
                            });
                          }
                          if (error && errorType === "validation") {
                            setError(null);
                            setErrorType(null);
                          }
                        }}
                        placeholder="Enter your email"
                        disabled={isLoading}
                        className={`h-11 ${
                          fieldErrors.email
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }`}
                      />
                      {fieldErrors.email && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-org">
                        Organization Name (Optional)
                      </Label>
                      <Input
                        id="signup-org"
                        type="text"
                        value={signUpData.organizationName}
                        onChange={(e) => {
                          setSignUpData((prev) => ({
                            ...prev,
                            organizationName: e.target.value,
                          }));
                          if (fieldErrors.organizationName) {
                            setFieldErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.organizationName;
                              return newErrors;
                            });
                          }
                          if (error && errorType === "validation") {
                            setError(null);
                            setErrorType(null);
                          }
                        }}
                        placeholder="e.g., Your Company Name"
                        disabled={isLoading}
                        className={`h-11 ${
                          fieldErrors.organizationName
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }`}
                      />
                      {fieldErrors.organizationName ? (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {fieldErrors.organizationName}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500">
                          You can add this later in settings
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showSignUpPassword ? "text" : "password"}
                          value={signUpData.password}
                          onChange={(e) => {
                            setSignUpData((prev) => ({
                              ...prev,
                              password: e.target.value,
                            }));
                            if (fieldErrors.password) {
                              setFieldErrors((prev) => {
                                const newErrors = { ...prev };
                                delete newErrors.password;
                                return newErrors;
                              });
                            }
                            if (error && errorType === "validation") {
                              setError(null);
                              setErrorType(null);
                            }
                          }}
                          placeholder="Create a password (min. 8 characters)"
                          disabled={isLoading}
                          className={`h-11 pr-10 ${
                            fieldErrors.password
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowSignUpPassword(!showSignUpPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showSignUpPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {fieldErrors.password && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {fieldErrors.password}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirm Password *</Label>
                      <div className="relative">
                        <Input
                          id="signup-confirm"
                          type={showConfirmPassword ? "text" : "password"}
                          value={signUpData.confirmPassword}
                          onChange={(e) => {
                            setSignUpData((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }));
                            if (fieldErrors.confirmPassword) {
                              setFieldErrors((prev) => {
                                const newErrors = { ...prev };
                                delete newErrors.confirmPassword;
                                return newErrors;
                              });
                            }
                            if (error && errorType === "validation") {
                              setError(null);
                              setErrorType(null);
                            }
                          }}
                          placeholder="Confirm your password"
                          disabled={isLoading}
                          className={`h-11 pr-10 ${
                            fieldErrors.confirmPassword
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {fieldErrors.confirmPassword && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {fieldErrors.confirmPassword}
                        </p>
                      )}
                    </div>

                    {error && (
                      <Alert
                        variant={
                          errorType === "network" ? "default" : "destructive"
                        }
                        className={
                          errorType === "network"
                            ? "border-amber-500 bg-amber-50"
                            : ""
                        }
                      >
                        <AlertCircle
                          className={`h-4 w-4 ${
                            errorType === "network" ? "text-amber-600" : ""
                          }`}
                        />
                        <AlertDescription
                          className={
                            errorType === "network" ? "text-amber-800" : ""
                          }
                        >
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-11"
                      disabled={
                        isLoading ||
                        !signUpData.fullName ||
                        !signUpData.email ||
                        !signUpData.password ||
                        !signUpData.confirmPassword
                      }
                    >
                      {isLoading ? (
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Creating Account...
                          </div>
                        </div>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Create Account
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => navigate("/")}
                      className="w-full h-11 bg-orange-500 rounded-sm text-white px-5 py-2 cursor-pointer z-50"
                      aria-label="Back to home"
                    >
                      ← Back to Home
                    </Button>

                    <p className="text-xs text-gray-500 text-center mt-4">
                      By signing up, you agree to use this platform responsibly, and Genomac Innovation Hub reserves their rights.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2025 Innovation of Genomac Innovation Hub. All Rights Reserved.
          </p>
          <p className="text-xs text-gray-400 mt-1 capitalize">
            Create, manage, and share professional certificates with ease
          </p>
        </div>

        {/* Password Reset Modal */}
        <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                Reset Your Password
              </DialogTitle>
              <DialogDescription>
                Enter your email address and we'll send you a link to reset your
                password.
              </DialogDescription>
            </DialogHeader>

            {!resetSuccess ? (
              <form onSubmit={handlePasswordReset} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        setResetError(null);
                      }}
                      placeholder="your.email@example.com"
                      disabled={resetLoading}
                      className="pl-10 h-11"
                    />
                  </div>
                  {resetError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{resetError}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmail("");
                      setResetError(null);
                    }}
                    disabled={resetLoading}
                    className="flex-1 border border-gray-200"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={resetLoading || !resetEmail}
                    className="flex-1"
                  >
                    {resetLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Reset Link
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">
                    Check Your Email
                  </h3>
                  <p className="text-sm text-gray-600">
                    We've sent a password reset link to{" "}
                    <strong>{resetEmail}</strong>
                  </p>
                  <p className="text-xs text-gray-500">
                    Click the link in the email to reset your password. It may
                    take a few minutes to arrive.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetSuccess(false);
                    setResetEmail("");
                  }}
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
