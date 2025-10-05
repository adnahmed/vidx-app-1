import { useEffect, useState } from "react";

import {
	type AuthSession,
	clearSession,
	DEFAULT_PLAN_MAX_VIDEOS,
	persistSession,
	readSession,
	type StoredSession,
} from "@/lib/auth";
import Dashboard from "./components/Dashboard";
import LandingPage from "./components/LandingPage";
import "./Main.css";

function Main() {
	const [session, setSession] = useState<StoredSession | null>(null);

	useEffect(() => {
		const storedSession = readSession();
		if (storedSession) {
			setSession(storedSession);
		}
	}, []);

	const handleLogin = (
		email: string,
		token: string,
		maxVideos: number = DEFAULT_PLAN_MAX_VIDEOS,
		fullName?: string,
		tokenType?: string,
		provider?: string,
	) => {
		const authSession: AuthSession = {
			email,
			token,
			tokenType,
			provider,
			fullName,
		};
		persistSession(authSession, maxVideos || DEFAULT_PLAN_MAX_VIDEOS);
		setSession({
			...authSession,
			planMaxVideos: maxVideos || DEFAULT_PLAN_MAX_VIDEOS,
		});
	};

	const handleLogout = () => {
		clearSession();
		setSession(null);
	};

	if (session) {
		return (
			<Dashboard
				userEmail={session.email}
				userName={session.fullName}
				planMaxVideos={session.planMaxVideos}
				onLogout={handleLogout}
			/>
		);
	}

	return <LandingPage onLogin={handleLogin} />;
}

export default Main;
