import TextRotate from "@/fancy/components/text/text-rotate";
import { LayoutGroup, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { FaArrowRight, FaCheckCircle, FaLayerGroup, FaBolt, FaMusic, FaMagic } from "react-icons/fa";
import GoogleLoginButton from "./GoogleLoginButton";
import Preview from "./Preview";

interface LandingPageProps {
	onLogin: (email: string, token: string, maxVideos: number, fullName?: string, tokenType?: string, provider?: string) => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
	const words = ["easily", "fast", "reliably"];
	const [location, navigate] = useLocation();
	const [showGoogleContinue, setShowGoogleContinue] = useState(false);

	useEffect(() => {
		// Ensure page is scrolled to top on mount
		window.scrollTo(0, 0);
	}, []);

	let maxWidth = Infinity;
	if (window.screen) {
		maxWidth = window.screen.width;
	}

	const imgWidth = Math.min(600, maxWidth);
	const imgHeight = Math.round((imgWidth * 9) / 16);

	return (
		<div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-purple-500/30">
			{/* Animated Background */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] mix-blend-screen animate-blob" />
				<div className="absolute top-[20%] right-[-10%] w-[35%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
				<div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-4000" />
			</div>

			{/* Navigation */}
			<header className="fixed top-0 inset-x-0 z-50 glass-dark">
				<div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
							V
						</div>
						<span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
							VideoMerger
						</span>
					</div>
					<div className="flex gap-4 items-center relative z-[60]">
						<button
							type="button"
							onClick={() => navigate("/login")}
							className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-white/5"
						>
							Log in
						</button>
						<button
							type="button"
							onClick={() => navigate("/signup")}
							className="px-5 py-2.5 text-sm font-semibold bg-white text-slate-900 rounded-xl hover:bg-slate-100 transition-all shadow-lg shadow-white/10 active:scale-95"
						>
							Get Started
						</button>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<main className="relative z-10 pt-32 pb-20 px-6">
				<div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
					<div className="space-y-8">
						<LayoutGroup>
							<motion.h1 
								className="text-5xl lg:text-7xl font-bold leading-tight"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5 }}
							>
								Merge videos <br />
								<TextRotate
									texts={words}
									mainClassName="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
									staggerFrom="last"
									initial={{ y: "100%" }}
									animate={{ y: 0 }}
									exit={{ y: "-120%" }}
									staggerDuration={0.025}
									transition={{ type: "spring", damping: 30, stiffness: 400 }}
								/>
							</motion.h1>
						</LayoutGroup>
						
						<p className="text-xl text-slate-400 max-w-lg leading-relaxed">
							Create professional video sequences with 50+ seamless transitions, custom audio mixing, and instant previews. No software to install.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 relative z-20">
							<GoogleLoginButton
								useOneTap
								text="Continue with Google"
								onSuccess={onLogin}
								className="bg-white text-slate-900 rounded-xl hover:bg-slate-50 transition-all"
							/>
							<button 
								onClick={() => navigate("/signup")}
								className="px-8 py-3 bg-slate-800 text-white rounded-xl font-semibold border border-white/10 hover:bg-slate-700 transition-all flex items-center justify-center gap-2 group"
							>
								Start Free Trial
								<FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
							</button>
						</div>
						
						<div className="flex gap-6 text-sm text-slate-400">
							<div className="flex items-center gap-2">
								<FaCheckCircle className="w-5 h-5 text-green-400" />
								<span>No credit card required</span>
							</div>
							<div className="flex items-center gap-2">
								<FaCheckCircle className="w-5 h-5 text-green-400" />
								<span>Free tier available</span>
							</div>
						</div>
					</div>

					<div className="relative">
						<div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-3xl -z-10 rounded-full" />
						<div className="bg-slate-900/50 p-4 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm">
							<div className="rounded-lg overflow-hidden border border-white/5">
								<Preview width={imgWidth} height={imgHeight} />
							</div>
						</div>
					</div>
				</div>

				{/* Features Grid */}
				<div className="max-w-7xl mx-auto mt-32">
					<div className="text-center mb-16 space-y-4">
						<h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
							Everything you need
						</h2>
						<p className="text-slate-400 text-lg">Power-packed features for modern creators</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{[
							{
								icon: <FaLayerGroup className="w-8 h-8 text-purple-400" />,
								title: "50+ Transitions",
								desc: "Professional-grade GL transitions to make your cuts smooth and cinematic."
							},
							{
								icon: <FaMusic className="w-8 h-8 text-blue-400" />,
								title: "Audio Mixing",
								desc: "Upload custom soundtracks or let us handle the audio merging for you."
							},
							{
								icon: <FaBolt className="w-8 h-8 text-yellow-400" />,
								title: "Instant Preview",
								desc: "See your changes in real-time with our high-performance WebGL renderer."
							}
						].map((feature, i) => (
							<motion.div 
								key={i}
								whileHover={{ y: -5 }}
								className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
							>
								<div className="mb-6 p-4 rounded-xl bg-slate-800/50 w-fit">
									{feature.icon}
								</div>
								<h3 className="text-xl font-bold mb-3 text-slate-100">{feature.title}</h3>
								<p className="text-slate-400 leading-relaxed">{feature.desc}</p>
							</motion.div>
						))}
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="border-t border-white/10 py-12 mt-20 relative z-10 text-slate-400 bg-slate-950">
				<div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
					<div className="col-span-2">
						<div className="flex items-center gap-2 mb-4">
							<div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
								V
							</div>
							<span className="text-lg font-bold text-white">VideoMerger</span>
						</div>
						<p className="text-sm max-w-sm">
							The most advanced in-browser video merging platform. Built for performance and ease of use.
						</p>
					</div>
					<div>
						<h4 className="font-bold text-white mb-4">Product</h4>
						<ul className="space-y-2 text-sm">
							<li><button onClick={() => window.scrollTo({top: 800, behavior: 'smooth'})} className="hover:text-purple-400 transition-colors">Features</button></li>
							<li><button onClick={() => navigate("/signup")} className="hover:text-purple-400 transition-colors">Pricing</button></li>
							<li><button className="hover:text-purple-400 transition-colors cursor-not-allowed opacity-50">Showcase (Soon)</button></li>
						</ul>
					</div>
					<div>
						<h4 className="font-bold text-white mb-4">Legal</h4>
						<ul className="space-y-2 text-sm">
							<li><button className="hover:text-purple-400 transition-colors cursor-not-allowed opacity-50">Privacy Policy</button></li>
							<li><button className="hover:text-purple-400 transition-colors cursor-not-allowed opacity-50">Terms of Service</button></li>
						</ul>
					</div>
				</div>
			</footer>

			<style jsx>{`
				@keyframes blob {
					0%, 100% { transform: translate(0, 0) scale(1); }
					33% { transform: translate(30px, -50px) scale(1.1); }
					66% { transform: translate(-20px, 20px) scale(0.9); }
				}
				.animate-blob {
					animation: blob 10s infinite alternate;
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
