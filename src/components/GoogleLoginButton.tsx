import { type CredentialResponse, GoogleLogin } from "@react-oauth/google";

import { API_BASE_URL } from "@/lib/api";
import { DEFAULT_PLAN_MAX_VIDEOS } from "@/lib/auth";

interface GoogleLoginButtonProps {
	text?: string;
	className?: string;
	onSuccess: (
		email: string,
		token: string,
		maxVideos: number,
		fullName?: string,
		tokenType?: string,
		provider?: string,
	) => void;
	useOneTap?: boolean;
}

const GoogleLoginButton = ({
	text = "Sign in with Google",
	className = "",
	onSuccess,
	useOneTap = false,
}: GoogleLoginButtonProps) => {
	const handleSuccess = (credentialResponse: CredentialResponse) => {
		// Send the credential to your backend API
		// Note: The schema shows GET /api/auth/google/login and GET /api/auth/google/callback
		// This implementation posts the Google credential to a hypothetical endpoint
		// You may need to adjust this based on your actual OAuth flow
		fetch(`${API_BASE_URL}/auth/google/callback`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ credential: credentialResponse.credential }),
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Google authentication failed");
				}
				return response.json();
			})
			.then((data) => {
				// Call the onSuccess callback with user data from your backend
				const token = data.access_token ?? data.token;
				if (!token) {
					throw new Error("Google authentication response missing token");
				}
				const maxVideos = data.planMaxVideos ?? DEFAULT_PLAN_MAX_VIDEOS;
				onSuccess(
					data.email,
					token,
					maxVideos,
					data.full_name ?? data.name,
					data.token_type,
					data.provider,
				);
			})
			.catch((error) => {
				console.error("Google login error:", error);
			});
	};

	// Determine button text type based on provided text
	const textType = text.toLowerCase().includes("continue")
		? "continue_with"
		: "signin_with";

	return (
		<div className={`flex items-center ${className}`}>
			<GoogleLogin
				onSuccess={handleSuccess}
				onError={() => {
					console.log("Login Failed");
				}}
				useOneTap={useOneTap}
				text={textType}
				shape="rectangular"
				theme="filled_blue"
				size="large"
				logo_alignment="center"
			/>
		</div>
	);
};

export default GoogleLoginButton;
