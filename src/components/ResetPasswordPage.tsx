import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { Alert, AlertDescription } from "./ui/alert";
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  KeyRound,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { projectId } from "../utils/supabase/info";
import logo from "../assets/logo.png";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  // Extract access token from URL hash (Supabase magic link format)
  useEffect(() => {
    // First try to get from search params (passed by PasswordResetRedirect)
    const searchParams = new URLSearchParams(location.search);
    let token = searchParams.get("access_token");

    // If not in search params, try to get from hash (direct Supabase redirect)
    if (!token) {
      const hash = window.location.hash;
      const hashParams = new URLSearchParams(hash.substring(1));
      token = hashParams.get("access_token");
    }

    // Also check location.pathname for tokens (HashRouter edge case)
    if (!token && location.pathname.includes("access_token=")) {
      const pathParams = new URLSearchParams(location.pathname.substring(1));
      token = pathParams.get("access_token");
    }

    console.log("🔍 Checking for reset token...");
    console.log("  - location.search:", location.search);
    console.log("  - location.hash:", location.hash);
    console.log("  - location.pathname:", location.pathname);
    console.log("  - token found:", token ? "YES" : "NO");

    if (token) {
      setAccessToken(token);
      setTokenValid(true);
      console.log("✅ Reset token found in URL");
    } else {
      setTokenValid(false);
      console.log("❌ No reset token found in URL");
    }
  }, [location]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!accessToken) {
      setError("Invalid or expired reset link");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/auth/update-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ newPassword }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);
      toast.success("Password reset successfully!");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      setError(error.message || "Failed to reset password");
      toast.error(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  // Invalid token UI
  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
              <img src={logo} alt="Logo" className="w-10 h-10" />
            </div>
            <h1 className="text-gray-900 mb-2">Certificate Generator</h1>
            <p className="text-sm text-gray-500">Reset Your Password</p>
          </div>

          <Card className="border-gray-200 shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-center text-xl">
                Invalid Reset Link
              </CardTitle>
              <CardDescription className="text-center">
                This password reset link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    The reset link may have expired or already been used. Please
                    request a new password reset link.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Button
                    onClick={() => navigate("/login")}
                    className="w-full h-11"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Loading state while checking token
  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Success UI
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
              <img src={logo} alt="Logo" className="w-10 h-10" />
            </div>
            <h1 className="text-gray-900 mb-2">Certificate Generator</h1>
            <p className="text-sm text-gray-500">Password Reset Successful</p>
          </div>

          <Card className="border-gray-200 shadow-xl">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">
                    Password Reset Successfully!
                  </h3>
                  <p className="text-sm text-gray-600">
                    Your password has been updated. You can now sign in with
                    your new password.
                  </p>
                  <p className="text-xs text-gray-500">
                    Redirecting to login page...
                  </p>
                </div>
                <Button onClick={() => navigate("/login")} className="w-full">
                  Continue to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <img src={logo} alt="Logo" className="w-10 h-10" />
          </div>
          <h1 className="text-gray-900 mb-2">Certificate Generator</h1>
          <p className="text-sm text-gray-500">Create Your New Password</p>
        </div>

        <Card className="border-gray-200 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-center text-xl">
              Reset Your Password
            </CardTitle>
            <CardDescription className="text-center">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Enter new password"
                    disabled={isLoading}
                    className="pl-10 pr-10 h-11"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Confirm new password"
                    disabled={isLoading}
                    className="pl-10 pr-10 h-11"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                <p className="text-xs text-gray-600 mb-1.5">
                  Password must contain:
                </p>
                <ul className="text-xs text-gray-500 space-y-0.5">
                  <li className="flex items-center gap-1.5">
                    <div
                      className={`w-1 h-1 rounded-full ${
                        newPassword.length >= 8 ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-1.5">
                    <div
                      className={`w-1 h-1 rounded-full ${
                        /[A-Z]/.test(newPassword)
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    One uppercase letter
                  </li>
                  <li className="flex items-center gap-1.5">
                    <div
                      className={`w-1 h-1 rounded-full ${
                        /[a-z]/.test(newPassword)
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    One lowercase letter
                  </li>
                  <li className="flex items-center gap-1.5">
                    <div
                      className={`w-1 h-1 rounded-full ${
                        /[0-9]/.test(newPassword)
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    One number
                  </li>
                </ul>
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Buttons */}
              <div className="space-y-2">
                <Button
                  type="submit"
                  disabled={isLoading || !newPassword || !confirmPassword}
                  className="w-full h-11"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 mr-2" />
                      Reset Password
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/login")}
                  disabled={isLoading}
                  className="w-full h-11"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}