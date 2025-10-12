// Example of how to use the Transcript API programmatically

import type {
	ErrorResponse,
	TranscriptRequest,
	TranscriptResponse,
} from "@/types/transcript";

const API_BASE_URL =
	process.env.NODE_ENV === "development"
		? "http://localhost:8000"
		: "http://212.85.25.109:8000";

// Example 1: Fetch transcript for a YouTube video
async function fetchTranscript(
	videoId: string,
	languages: string[] = ["en"],
): Promise<TranscriptResponse> {
	const request: TranscriptRequest = {
		video_id: videoId,
		languages: languages,
		preserve_formatting: false,
	};

	const response = await fetch(`${API_BASE_URL}/api/transcript/fetch`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			// Add auth headers if needed
		},
		body: JSON.stringify(request),
	});

	if (!response.ok) {
		const error: ErrorResponse = await response.json();
		throw new Error(
			error.error || error.detail || "Failed to fetch transcript",
		);
	}

	return await response.json();
}

// Example 2: Usage
async function exampleUsage() {
	try {
		// Fetch English transcript for a video
		const transcript = await fetchTranscript("dQw4w9WgXcQ", ["en"]);

		console.log(`Video: ${transcript.video_id}`);
		console.log(
			`Language: ${transcript.language} (${transcript.language_code})`,
		);
		console.log(`Auto-generated: ${transcript.is_generated}`);
		console.log(`Snippets: ${transcript.snippets.length}`);

		// Print first 3 snippets
		transcript.snippets.slice(0, 3).forEach((snippet) => {
			console.log(`[${snippet.start}s] ${snippet.text}`);
		});

		// Get full text
		const fullText = transcript.snippets.map((s) => s.text).join(" ");
		console.log("Full transcript length:", fullText.length);
	} catch (error) {
		console.error("Error:", error);
	}
}

// Example 3: Extract video ID from various URL formats
function extractVideoId(url: string): string | null {
	const patterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
		/^([a-zA-Z0-9_-]{11})$/,
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match?.[1]) {
			return match[1];
		}
	}
	return null;
}

// Example URLs that work:
const exampleUrls = [
	"https://www.youtube.com/watch?v=dQw4w9WgXcQ",
	"https://youtu.be/dQw4w9WgXcQ",
	"https://www.youtube.com/embed/dQw4w9WgXcQ",
	"dQw4w9WgXcQ", // Direct video ID
];

exampleUrls.forEach((url) => {
	console.log(`${url} → ${extractVideoId(url)}`);
});

export { extractVideoId, fetchTranscript };
