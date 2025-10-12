import { API_BASE_URL } from "@/lib/api";
import { buildAuthHeaders } from "@/lib/auth";
import type {
	ErrorResponse,
	TranscriptResponse,
	TranscriptSnippet,
} from "@/types/transcript";
import { useState } from "react";

interface TranscriptTabProps {
	className?: string;
}

export default function TranscriptTab({ className = "" }: TranscriptTabProps) {
	const [youtubeUrl, setYoutubeUrl] = useState("");
	const [languages, setLanguages] = useState("en");
	const [preserveFormatting, setPreserveFormatting] = useState(false);
	const [loading, setLoading] = useState(false);
	const [transcript, setTranscript] = useState<TranscriptResponse | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Extract video ID from YouTube URL
	const extractVideoId = (url: string): string | null => {
		try {
			// Handle various YouTube URL formats
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
		} catch {
			return null;
		}
	};

	const handleFetchTranscript = async () => {
		setError(null);
		setTranscript(null);

		const videoId = extractVideoId(youtubeUrl.trim());
		if (!videoId) {
			setError(
				"Invalid YouTube URL or Video ID. Please enter a valid YouTube link or video ID.",
			);
			return;
		}

		setLoading(true);

		try {
			const languageList = languages
				.split(",")
				.map((lang) => lang.trim())
				.filter(Boolean);

			const requestBody = {
				video_id: videoId,
				languages: languageList.length > 0 ? languageList : ["en"],
				preserve_formatting: preserveFormatting,
			};

			const response = await fetch(`${API_BASE_URL}/api/transcript/fetch`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...buildAuthHeaders(),
				},
				body: JSON.stringify(requestBody),
			});

			if (!response.ok) {
				const errorData: ErrorResponse = await response.json();
				throw new Error(
					errorData.error ||
						errorData.detail ||
						`Request failed with status ${response.status}`,
				);
			}

			const data: TranscriptResponse = await response.json();
			setTranscript(data);
		} catch (err) {
			console.error("Failed to fetch transcript:", err);
			setError(
				err instanceof Error ? err.message : "Failed to fetch transcript",
			);
		} finally {
			setLoading(false);
		}
	};

	const formatTimestamp = (seconds: number): string => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = Math.floor(seconds % 60);

		if (hours > 0) {
			return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
		}
		return `${minutes}:${secs.toString().padStart(2, "0")}`;
	};

	const downloadTranscript = () => {
		if (!transcript) return;

		const textContent = transcript.snippets
			.map(
				(snippet: TranscriptSnippet) =>
					`[${formatTimestamp(snippet.start)}] ${snippet.text}`,
			)
			.join("\n\n");

		const blob = new Blob([textContent], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `transcript_${transcript.video_id}_${transcript.language_code}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const copyToClipboard = () => {
		if (!transcript) return;

		const textContent = transcript.snippets
			.map((snippet: TranscriptSnippet) => snippet.text)
			.join(" ");

		navigator.clipboard
			.writeText(textContent)
			.then(() => {
				alert("Transcript copied to clipboard!");
			})
			.catch((err) => {
				console.error("Failed to copy:", err);
				alert("Failed to copy transcript");
			});
	};

	return (
		<div className={`space-y-6 ${className}`}>
			<div className="rounded-xl bg-white p-6 shadow-lg">
				<h2 className="mb-4 text-xl font-semibold text-gray-800">
					YouTube Transcript Fetcher
				</h2>

				<div className="space-y-4">
					<div>
						<label
							htmlFor="youtube-url"
							className="mb-2 block text-sm font-medium text-gray-700"
						>
							YouTube URL or Video ID
						</label>
						<input
							id="youtube-url"
							type="text"
							value={youtubeUrl}
							onChange={(e) => setYoutubeUrl(e.target.value)}
							placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ or dQw4w9WgXcQ"
							className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
						/>
					</div>

					<div>
						<label
							htmlFor="languages"
							className="mb-2 block text-sm font-medium text-gray-700"
						>
							Languages (comma-separated, priority order)
						</label>
						<input
							id="languages"
							type="text"
							value={languages}
							onChange={(e) => setLanguages(e.target.value)}
							placeholder="en, es, de"
							className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
						/>
						<p className="mt-1 text-xs text-gray-500">
							Enter language codes (e.g., en, es, de) in order of preference
						</p>
					</div>

					<div className="flex items-center">
						<input
							id="preserve-formatting"
							type="checkbox"
							checked={preserveFormatting}
							onChange={(e) => setPreserveFormatting(e.target.checked)}
							className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500"
						/>
						<label
							htmlFor="preserve-formatting"
							className="ml-2 text-sm text-gray-700"
						>
							Preserve HTML formatting (e.g., &lt;i&gt;, &lt;b&gt;)
						</label>
					</div>

					<button
						type="button"
						onClick={handleFetchTranscript}
						disabled={loading || !youtubeUrl.trim()}
						className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{loading ? "Fetching..." : "Fetch Transcript"}
					</button>
				</div>

				{error && (
					<div className="mt-4 rounded-lg bg-red-50 p-4 text-red-800">
						<p className="font-semibold">Error</p>
						<p className="text-sm">{error}</p>
					</div>
				)}
			</div>

			{transcript && (
				<div className="rounded-xl bg-white p-6 shadow-lg">
					<div className="mb-4 flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold text-gray-800">
								Transcript Results
							</h3>
							<p className="text-sm text-gray-600">
								Video ID: {transcript.video_id} • Language:{" "}
								{transcript.language} ({transcript.language_code})
								{transcript.is_generated && " • Auto-generated"}
							</p>
						</div>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={copyToClipboard}
								className="rounded-lg bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-200"
							>
								Copy Text
							</button>
							<button
								type="button"
								onClick={downloadTranscript}
								className="rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200"
							>
								Download
							</button>
						</div>
					</div>

					<div className="max-h-96 space-y-3 overflow-y-auto rounded-lg bg-gray-50 p-4">
						{transcript.snippets.map((snippet: TranscriptSnippet) => (
							<div
								key={`${snippet.start}-${snippet.duration}`}
								className="rounded bg-white p-3 shadow-sm"
							>
								<p className="mb-1 text-xs font-medium text-gray-500">
									{formatTimestamp(snippet.start)} -{" "}
									{formatTimestamp(snippet.start + snippet.duration)}
								</p>
								<p className="text-sm text-gray-800">{snippet.text}</p>
							</div>
						))}
					</div>

					<p className="mt-4 text-sm text-gray-600">
						Total snippets: {transcript.snippets.length}
					</p>
				</div>
			)}
		</div>
	);
}
