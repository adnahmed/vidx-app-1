import { API_BASE_URL } from "@/lib/api";
import {
    buildAuthHeaders,
    DEFAULT_PLAN_MAX_VIDEOS,
    persistSession,
} from "@/lib/auth";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import GoogleLoginButton from "../components/GoogleLoginButton";

interface TokenResponse {
	access_token: string;
	token_type?: string;
	provider?: string;
}

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [, navigate] = useLocation();

	const handleLogin = (
		userEmail: string,
		token: string,
		_maxVideos: number,
		fullName?: string,
		tokenType?: string,
		provider?: string,
	) => {
		persistSession(
			{
				email: userEmail,
				token,
				tokenType,
				provider,
				fullName,
			},
			DEFAULT_PLAN_MAX_VIDEOS,
		);
		navigate("/");
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...buildAuthHeaders(),
				},
				body: JSON.stringify({
					email,
					password,
				}),
			});

			if (response.ok) {
				const data: TokenResponse = await response.json();
				handleLogin(
					email,
					data.access_token,
					DEFAULT_PLAN_MAX_VIDEOS,
					undefined,
					data.token_type,
					data.provider,
				);
				return;
			}

			let message = "Login failed";
			try {
				const errorData = await response.json();
				message = errorData?.detail ?? errorData?.message ?? message;
			} catch (parseError) {
				console.error("Failed to parse login error", parseError);
			}
			setError(message);
		} catch (requestError) {
			console.error("Login request failed", requestError);
			setError("Network error. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 relative overflow-hidden">
			{/* Animated background blobs */}
			<div className="absolute inset-0">
				<div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
				<div className="absolute top-40 right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
				<div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
			</div>

			<div className="relative z-10 min-h-screen flex items-center justify-center p-6">
				<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md shadow-2xl">
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-gray-800 mb-2">
							Welcome Back
						</h1>
						<p className="text-gray-600">Sign in to your account</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label
								className="block text-sm font-medium text-gray-700 mb-2"
								htmlFor="email"
							>
								Email
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
								placeholder="Enter your email"
								required
							/>
						</div>

						<div>
							<label
								className="block text-sm font-medium text-gray-700 mb-2"
								htmlFor="password"
							>
								Password
							</label>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
								placeholder="Enter your password"
								required
							/>
						</div>

						{error && (
							<div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? "Signing in..." : "Sign In"}
						</button>
					</form>

					<div className="mt-6">
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-300" />
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-white text-gray-500">
									Or continue with
								</span>
							</div>
						</div>

						<div className="mt-6">
							<GoogleLoginButton
								text="Continue with Google"
								onSuccess={handleLogin}
								className="w-full justify-center"
							/>
						</div>
					</div>

					<div className="mt-8 text-center">
						<p className="text-gray-600">
							Don't have an account?{" "}
							<Link
								href="/signup"
								className="text-purple-600 hover:text-purple-700 font-medium"
							>
								Sign up
							</Link>
						</p>
						<Link
							href="/"
							className="block mt-4 text-sm text-gray-500 hover:text-gray-700"
						>
							Back to home
						</Link>
					</div>
				</div>
			</div>

			<style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
		</div>
	);
}
