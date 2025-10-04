import TextRotate from "@/fancy/components/text/text-rotate";
import { LayoutGroup, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import GoogleLoginButton from "./GoogleLoginButton";
import Preview from "./Preview";

interface LandingPageProps {
	onLogin: (email: string, token: string, maxVideos: number) => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
	const words = ["easily", "fast", "reliably"];
	const [location, navigate] = useLocation();
	const [showGoogleContinue, setShowGoogleContinue] = useState(false);

	useEffect(() => {
		// Check if user has Google account logged in
		// This would be determined by Google's API
		setShowGoogleContinue(true); // Simulating Google account detection
	}, []);

	let maxWidth = Infinity;
	if (window.screen) {
		maxWidth = window.screen.width;
	}

	const imgWidth = Math.min(512, maxWidth);
	const imgHeight = Math.round((imgWidth * 384) / 512);

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 relative">
			{/* Animated background blobs */}
			<div className="absolute inset-0">
				<div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
				<div className="absolute top-40 right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
				<div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
			</div>

			{/* Header */}
			<header className="relative z-10 flex justify-between items-center p-6">
				<div className="text-2xl font-bold text-gray-800">VideoMerger</div>
				<div className="flex gap-4">
					{showGoogleContinue && (
						<GoogleLoginButton
							useOneTap
							text="Continue with Google"
							onSuccess={onLogin}
							className="mr-2"
						/>
					)}
					<button
						type="button"
						onClick={() => navigate("/login")}
						className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors"
					>
						Login
					</button>
					<button
						type="button"
						onClick={() => navigate("/signup")}
						className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
					>
						Register
					</button>
				</div>
			</header>

			{/* Hero Section */}
			<div className="relative whitespace-pre z-10 flex flex-col items-center justify-center text-center py-20 px-4">
				<LayoutGroup>
					<motion.h1
						layout
						transition={{ type: "spring", damping: 30, stiffness: 400 }}
						className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl flex flex-wrap justify-center font-bold text-gray-800 mb-6"
					>
						Merge videos{" "}
						<TextRotate
							texts={words}
							mainClassName="text-white px-2 sm:px-2 md:px-3 bg-[#ff5941] overflow-hidden justify-center rounded-lg"
							staggerFrom={"last"}
							initial={{ y: "100%" }}
							animate={{ y: 0 }}
							exit={{ y: "-120%" }}
							staggerDuration={0.025}
							splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
							transition={{ type: "spring", damping: 30, stiffness: 400 }}
						/>
					</motion.h1>
				</LayoutGroup>
			</div>

			{/* Main Content */}
			<div className="relative z-10 flex items-center justify-center px-4 sm:px-6 md:px-8 w-full">
				<div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
					{/* Description */}
					<div className="text-center lg:text-left">
						<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">
							Professional Video Merging Made Simple
						</h2>
						<p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
							Combine multiple videos seamlessly with our advanced transition
							effects. Add background audio, choose from 50+ professional
							transitions, and create stunning merged videos in minutes. Perfect
							for content creators, marketers, and video enthusiasts.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 bg-green-500 rounded-full"></div>
								<span className="text-gray-600">50+ Transitions</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 bg-green-500 rounded-full"></div>
								<span className="text-gray-600">Audio Background</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 bg-green-500 rounded-full"></div>
								<span className="text-gray-600">Fast Processing</span>
							</div>
						</div>
					</div>
					<div className="flex justify-center items-center w-full">
						<div className="w-full max-w-[512px]">
							<Preview width={imgWidth} height={imgHeight} />
						</div>
					</div>
				</div>
			</div>

			<style jsx>{
				/* css */ `
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
      `
			}</style>
		</div>
	);
}
