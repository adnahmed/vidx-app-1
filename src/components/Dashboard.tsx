import { API_BASE_URL } from "@/lib/api";
import { buildAuthHeaders } from "@/lib/auth";
import {
	transitionsByName,
	transitionsOrderByCreatedAt,
} from "@/lib/transitions";
import type { TransitionObject } from "gl-transition-utils/lib/transformSource";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AnimatedVignette from "./AnimatedVignette";
import AudioUploader from "./AudioUploader";
import HistoryDialog from "./HistoryDialog";
import MergeResult from "./MergeResult";
import { TrackVisibility } from "./TrackVisibility";
import TranscriptTab from "./TranscriptTab";
import UpgradeDialog from "./UpgradeDialog";
import VideoUploader from "./VideoUploader";
import Vignette from "./Vignette";

const galleryFromImage = "/images/600x400/barley.jpg";
const galleryToImage = "/images/600x400/hBd6EPoQT2C8VQYv65ys_White_Sands.jpg";
const galleryPageSize = 6;

type VideoStatus = "PENDING" | "STARTED" | "SUCCESS" | "FAILURE";
type MergeState = "IDLE" | VideoStatus;

function normaliseVideoStatus(value: unknown): VideoStatus {
	const upper = typeof value === "string" ? value.toUpperCase() : "";
	if (
		upper === "PENDING" ||
		upper === "STARTED" ||
		upper === "SUCCESS" ||
		upper === "FAILURE"
	) {
		return upper as VideoStatus;
	}
	return "PENDING";
}

interface DashboardProps {
	userEmail: string;
	userName?: string;
	planMaxVideos: number;
	onLogout: () => void;
}

interface TransitionGalleryProps {
	selectedTransition: string;
	onSelect: (transitionName: string) => void;
}

function TransitionGallery({
	selectedTransition,
	onSelect,
}: TransitionGalleryProps) {
	const [page, setPage] = useState(0);

	useEffect(() => {
		if (!selectedTransition) {
			return;
		}

		const index = transitionsOrderByCreatedAt.findIndex(
			(transition) => transition.name === selectedTransition,
		);

		if (index === -1) {
			return;
		}

		const nextPage = Math.floor(index / galleryPageSize);
		setPage((current) => (current === nextPage ? current : nextPage));
	}, [selectedTransition]);

	const totalPages = Math.max(
		1,
		Math.ceil(transitionsOrderByCreatedAt.length / galleryPageSize),
	);
	const pageStart = page * galleryPageSize;
	const pageTransitions = transitionsOrderByCreatedAt.slice(
		pageStart,
		pageStart + galleryPageSize,
	);

	const handlePrev = () => {
		setPage((current) => Math.max(0, current - 1));
	};

	const handleNext = () => {
		setPage((current) => Math.min(totalPages - 1, current + 1));
	};

	return (
		<div>
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
				{pageTransitions.map((transition) => {
					const isSelected = transition.name === selectedTransition;

					return (
						<button
							key={transition.name}
							type="button"
							onClick={() => onSelect(transition.name)}
							aria-label={`Select ${transition.name} transition`}
							aria-pressed={isSelected}
							className={`group relative overflow-hidden rounded-xl border-2 px-2 pb-3 pt-2 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 ${
								isSelected
									? "border-purple-500 shadow-xl shadow-purple-200/60"
									: "border-transparent shadow-md hover:border-purple-300 hover:shadow-lg"
							}`}
						>
							<div className="flex justify-center">
								<Vignette
									interaction
									transition={transition}
									from={galleryFromImage}
									to={galleryToImage}
									width={300}
									height={200}
									preload={[galleryFromImage, galleryToImage]}
								/>
							</div>
							<p className="mt-2 text-center text-sm font-medium text-gray-700">
								{transition.name}
							</p>
						</button>
					);
				})}
			</div>
			<div className="mt-4 flex items-center justify-between gap-4">
				<button
					type="button"
					onClick={handlePrev}
					disabled={page === 0}
					className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Previous
				</button>
				<span className="text-sm text-gray-600">
					Page {page + 1} of {totalPages}
				</span>
				<button
					type="button"
					onClick={handleNext}
					disabled={page >= totalPages - 1}
					className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Next
				</button>
			</div>
		</div>
	);
}

interface TransitionPreviewProps {
	transition?: TransitionObject;
	videoSources: { url: string; name: string }[];
}

function TransitionPreview({
	transition,
	videoSources,
}: TransitionPreviewProps) {
	const previewVideos = useMemo(
		() =>
			videoSources.map(({ url, name }) => (
				<video
					key={url + name}
					src={url}
					className="h-full w-full object-cover"
					autoPlay
					loop
					// muted
					playsInline
					aria-label={`${name} preview`}
				>
					<track kind="captions" />
				</video>
			)),
		[videoSources],
	);
	if (!transition || videoSources.length < 2) {
		return null;
	}
	const labelNames = videoSources.map((source) => source.name);
	const sequenceLabel =
		labelNames.length <= 3
			? labelNames.join(" -> ")
			: `${labelNames.slice(0, 3).join(" -> ")} -> ...`;
	const width = 300;
	const visibleHeight = Math.round((width * 544) / 1280);
	return (
		<TrackVisibility>
			{(visible) => (
				<div className="mb-6">
					<h3 className="mb-3 text-lg font-semibold text-gray-800">
						Live Transition Preview
					</h3>

					<div className="flex justify-center">
						<AnimatedVignette
							interaction={false}
							paused={!visible}
							transitions={[transition]}
							images={visible ? previewVideos : [null]}
							width={width}
							height={visibleHeight}
							duration={3000}
							delay={500}
							keepRenderingDuringDelay
						/>
					</div>

					<p className="mt-2 text-center text-sm text-gray-600">
						{sequenceLabel}
					</p>
				</div>
			)}
		</TrackVisibility>
	);
}

type TabType = "merge" | "transcript";

export default function Dashboard({
	userEmail,
	userName,
	planMaxVideos,
	onLogout,
}: DashboardProps) {
	const [activeTab, setActiveTab] = useState<TabType>("merge");
	const [selectedTransition, setSelectedTransition] = useState<string>("");
	const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
	const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
	const [showHistoryDialog, setShowHistoryDialog] = useState(false);
	const [mergeStatus, setMergeStatus] = useState<MergeState>("IDLE");
	const [resultVideoUrl, setResultVideoUrl] = useState<string>("");
	const [taskId, setTaskId] = useState<string | null>(null);
	const statusPollTimeout = useRef<number | null>(null);

	const clearStatusPolling = useCallback(() => {
		if (statusPollTimeout.current !== null) {
			window.clearTimeout(statusPollTimeout.current);
			statusPollTimeout.current = null;
		}
	}, []);

	const previewSources = useMemo(
		() =>
			selectedVideos.map((file) => ({
				url: URL.createObjectURL(file),
				name: file.name,
			})),
		[selectedVideos],
	);

	useEffect(() => {
		return () => {
			for (const { url } of previewSources) {
				URL.revokeObjectURL(url);
			}
		};
	}, [previewSources]);

	useEffect(() => {
		return () => {
			clearStatusPolling();
		};
	}, [clearStatusPolling]);

	const handleMerge = async () => {
		if (!selectedTransition || selectedVideos.length === 0) {
			alert("Please select a transition and at least one video");
			return;
		}

		setIsProcessing(true);
		setMergeStatus("PENDING");
		setTaskId(null);
		clearStatusPolling();
		setResultVideoUrl("");

		try {
			const formData = new FormData();
			formData.append("transition", selectedTransition);
			selectedVideos.forEach((video) => {
				formData.append("videos", video);
			});
			if (selectedAudio) {
				formData.append("audio", selectedAudio);
			}

			const response = await fetch(`${API_BASE_URL}/video/merge`, {
				method: "POST",
				headers: buildAuthHeaders(),
				body: formData,
			});
			if (!response.ok) {
				throw new Error(`Merge request failed with status ${response.status}`);
			}

			const data = await response.json();

			const nextTaskId: string | undefined =
				data.task_id ?? data.taskId ?? data.id;

			if (!nextTaskId) {
				throw new Error("Merge response missing task_id");
			}

			setTaskId(nextTaskId);

			const initialStatus = normaliseVideoStatus(data.status);
			setMergeStatus(initialStatus);

			if (initialStatus === "SUCCESS") {
				completeMerge(nextTaskId);
				return;
			}

			if (initialStatus === "FAILURE") {
				setIsProcessing(false);
				return;
			}

			pollMergeStatus(nextTaskId);
		} catch (error) {
			console.error("Merge failed:", error);
			setMergeStatus("FAILURE");
			setIsProcessing(false);
			clearStatusPolling();
		}
	};

	const completeMerge = useCallback(
		(currentTaskId: string) => {
			const playbackUrl = `${API_BASE_URL}/video/merge?task_id=${encodeURIComponent(currentTaskId)}`;
			setResultVideoUrl(playbackUrl);
			setIsProcessing(false);
			clearStatusPolling();
		},
		[clearStatusPolling],
	);

	const pollMergeStatus = useCallback(
		async (currentTaskId: string) => {
			try {
				const response = await fetch(
					`${API_BASE_URL}/video/merge/status?task_id=${encodeURIComponent(currentTaskId)}`,
					{
						headers: buildAuthHeaders(),
					},
				);
				if (!response.ok) {
					throw new Error(`Status request failed with ${response.status}`);
				}

				const data = await response.json();

				const nextStatus = normaliseVideoStatus(data.status);

				if (nextStatus === "SUCCESS") {
					setMergeStatus("SUCCESS");
					completeMerge(currentTaskId);
					return;
				}

				if (nextStatus === "FAILURE") {
					setMergeStatus("FAILURE");
					setIsProcessing(false);
					clearStatusPolling();
					return;
				}

				setMergeStatus(nextStatus);
				statusPollTimeout.current = window.setTimeout(() => {
					pollMergeStatus(currentTaskId);
				}, 2000);
			} catch (error) {
				console.error("Status polling failed:", error);
				setMergeStatus("FAILURE");
				setIsProcessing(false);
				clearStatusPolling();
			}
		},
		[clearStatusPolling, completeMerge],
	);

	const resetMerge = () => {
		clearStatusPolling();
		setMergeStatus("IDLE");
		setResultVideoUrl("");
		setSelectedTransition("");
		setSelectedVideos([]);
		setSelectedAudio(null);
		setTaskId(null);
		setIsProcessing(false);
	};

	const previewTransition = transitionsByName[selectedTransition];

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
			<header className="flex items-center justify-between bg-white p-6 shadow-sm">
				<h1 className="text-2xl font-bold text-gray-800">
					Video Merger Dashboard
				</h1>
				<div className="flex items-center gap-4">
					<span className="text-gray-600">
						Welcome, {userName ?? userEmail}
					</span>
					<button
						type="button"
						onClick={() => setShowHistoryDialog(true)}
						className="px-4 py-2 text-gray-700 transition-colors hover:text-gray-900"
					>
						History
					</button>
					<button
						type="button"
						onClick={() => setShowUpgradeDialog(true)}
						className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-white transition-all hover:from-purple-700 hover:to-blue-700"
					>
						Upgrade
					</button>
					<button
						type="button"
						onClick={onLogout}
						className="px-4 py-2 text-gray-700 transition-colors hover:text-red-600"
					>
						Logout
					</button>
				</div>
			</header>

			<div className="p-8">
				{/* Tab Navigation */}
				<div className="mx-auto mb-6 max-w-7xl">
					<div className="flex gap-2 rounded-lg bg-white p-2 shadow-md">
						<button
							type="button"
							onClick={() => setActiveTab("merge")}
							className={`flex-1 rounded-md px-6 py-3 font-semibold transition-all ${
								activeTab === "merge"
									? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
									: "text-gray-600 hover:bg-gray-100"
							}`}
						>
							Video Merger
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("transcript")}
							className={`flex-1 rounded-md px-6 py-3 font-semibold transition-all ${
								activeTab === "transcript"
									? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
									: "text-gray-600 hover:bg-gray-100"
							}`}
						>
							YouTube Transcript
						</button>
					</div>
				</div>

				{/* Tab Content */}
				{activeTab === "merge" ? (
					<div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-4">
						<div className="space-y-6 lg:col-span-3">
							<div className="rounded-xl bg-white p-6 shadow-lg">
								<h2 className="mb-4 text-xl font-semibold text-gray-800">
									Select Transition
								</h2>
								<TransitionGallery
									selectedTransition={selectedTransition}
									onSelect={setSelectedTransition}
								/>
							</div>
							<div className="rounded-xl bg-white p-6 shadow-lg">
								<h2 className="mb-4 text-xl font-semibold text-gray-800">
									Upload Videos (Max: {planMaxVideos})
								</h2>
								<VideoUploader
									selectedVideos={selectedVideos}
									onVideosChange={setSelectedVideos}
									maxVideos={planMaxVideos}
								/>
							</div>

							<div className="rounded-xl bg-white p-6 shadow-lg">
								<h2 className="mb-4 text-xl font-semibold text-gray-800">
									Background Audio (Optional)
								</h2>
								<AudioUploader
									selectedAudio={selectedAudio}
									onAudioChange={setSelectedAudio}
								/>
							</div>

							<button
								type="submit"
								onClick={handleMerge}
								disabled={
									isProcessing ||
									!selectedTransition ||
									selectedVideos.length === 0
								}
								className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{isProcessing ? "Processing..." : "Merge Videos"}
							</button>
						</div>

						<div className="lg:col-span-1">
							<div className="sticky top-8 rounded-xl bg-white p-6 shadow-lg">
								<h2 className="mb-4 text-xl font-semibold text-gray-800">
									Result
								</h2>
								<TransitionPreview
									transition={previewTransition}
									videoSources={previewSources}
								/>
								<MergeResult
									status={mergeStatus}
									taskId={taskId}
									videoUrl={resultVideoUrl}
									onReset={resetMerge}
								/>
							</div>
						</div>
					</div>
				) : (
					<div className="mx-auto max-w-7xl">
						<TranscriptTab />
					</div>
				)}
			</div>

			{showUpgradeDialog && (
				<UpgradeDialog onClose={() => setShowUpgradeDialog(false)} />
			)}
			{showHistoryDialog && (
				<HistoryDialog onClose={() => setShowHistoryDialog(false)} />
			)}
		</div>
	);
}
