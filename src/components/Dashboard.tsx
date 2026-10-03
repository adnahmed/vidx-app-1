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
import SocialMediaTab from "./social/SocialMediaTab";
import { TrackVisibility } from "./TrackVisibility";
import TranscriptTab from "./TranscriptTab";
import UpgradeDialog from "./UpgradeDialog";
import VideoUploader from "./VideoUploader";
import Vignette from "./Vignette";
import {
	FaBolt,
	FaBullhorn,
	FaChevronLeft,
	FaChevronRight,
	FaFileAlt,
	FaFilm,
	FaHistory,
	FaMusic,
	FaPlay,
	FaSignOutAlt,
	FaUser,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

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
		if (!selectedTransition) return;

		const index = transitionsOrderByCreatedAt.findIndex(
			(transition) => transition.name === selectedTransition,
		);

		if (index === -1) return;

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

	const handlePrev = () => setPage((current) => Math.max(0, current - 1));
	const handleNext = () => setPage((current) => Math.min(totalPages - 1, current + 1));

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
				{pageTransitions.map((transition) => {
					const isSelected = transition.name === selectedTransition;
					return (
						<button
							key={transition.name}
							type="button"
							onClick={() => onSelect(transition.name)}
							className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-200 outline-none
								${isSelected 
									? "border-purple-600 shadow-md ring-2 ring-purple-100" 
									: "border-slate-200 hover:border-purple-300 hover:shadow-sm"
								}`}
						>
							<div className="aspect-video bg-slate-100 relative">
								<Vignette
									interaction
									transition={transition}
									from={galleryFromImage}
									to={galleryToImage}
									width={300}
									height={169}
									preload={[galleryFromImage, galleryToImage]}
								/>
                {isSelected && (
                  <div className="absolute inset-0 border-4 border-purple-600/20 rounded-lg pointer-events-none" />
                )}
							</div>
							<div className="py-2 px-3 bg-white border-t border-slate-100">
								<p className={`text-xs font-medium truncate ${isSelected ? "text-purple-700" : "text-slate-600 group-hover:text-purple-600"}`}>
									{transition.name}
								</p>
							</div>
						</button>
					);
				})}
			</div>
			
      <div className="flex items-center justify-between px-2">
				<button
					type="button"
					onClick={handlePrev}
					disabled={page === 0}
					className="p-1 rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
				>
					<FaChevronLeft className="w-5 h-5 text-slate-600" />
				</button>
				<span className="text-xs font-medium text-slate-400">
					{page + 1} / {totalPages}
				</span>
				<button
					type="button"
					onClick={handleNext}
					disabled={page >= totalPages - 1}
					className="p-1 rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
				>
					<FaChevronRight className="w-5 h-5 text-slate-600" />
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
					className="h-full w-full object-contain"
					autoPlay
					loop
					muted
					playsInline
					aria-label={`${name} preview`}
				>
					<track kind="captions" />
				</video>
			)),
		[videoSources],
	);

	if (!transition || videoSources.length < 2) return null;

	const labelNames = videoSources.map((source) => source.name);
	const sequenceLabel =
		labelNames.length <= 3
			? labelNames.join(" → ")
			: `${labelNames.slice(0, 3).join(" → ")} → ...`;
	
  const width = 300;
	const visibleHeight = Math.round((width * 9) / 16);

	return (
		<TrackVisibility>
			{(visible) => (
				<div className="p-4 bg-slate-900 rounded-xl shadow-lg border border-slate-800">
					<div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <FaPlay className="w-4 h-4 text-purple-400" />
              Live Preview
            </h3>
            <span className="text-xs text-slate-400 font-mono">1280x720</span>
          </div>

					<div className="flex justify-center items-center rounded-lg overflow-hidden bg-black aspect-video ring-1 ring-white/10">
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

					<p className="mt-3 text-xs text-slate-400 text-center font-mono truncate px-2">
						{sequenceLabel}
					</p>
				</div>
			)}
		</TrackVisibility>
	);
}

type TabType = "merge" | "transcript" | "social";

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

				const nextStatus = normaliseVideoStatus(typeof data === "object" && data !== null ? data.status : data);

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
		<div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">V</div>
          <span className="font-bold text-slate-800">VideoMerger</span>
        </div>
        
        <nav className="p-4 space-y-1 flex-1">
          <button 
            onClick={() => setActiveTab("merge")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "merge" ? "bg-purple-50 text-purple-700" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <MdDashboard className="w-5 h-5" />
            Video Studio
          </button>
          <button 
            onClick={() => setActiveTab("transcript")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "transcript" ? "bg-purple-50 text-purple-700" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <FaFileAlt className="w-5 h-5" />
            Transcripts
          </button>
          <button 
            onClick={() => setActiveTab("social")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "social" ? "bg-purple-50 text-purple-700" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <FaBullhorn className="w-5 h-5" />
            Social Media
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <div className="px-4 py-2 flex items-center gap-3 text-sm text-slate-600">
            <FaUser className="w-4 h-4" />
            <span className="truncate">{userName || "User"}</span>
          </div>
          <button 
            onClick={() => setShowUpgradeDialog(true)}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          >
            <FaBolt className="w-4 h-4" />
            Upgrade Plan
          </button>
          <button 
            onClick={() => setShowHistoryDialog(true)}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <FaHistory className="w-4 h-4" />
            History
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FaSignOutAlt className="w-4 h-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 md:hidden flex items-center justify-between">
          <div className="font-bold text-slate-800">VideoMerger</div>
           <button onClick={onLogout} className="text-slate-500 hover:text-slate-800"><FaSignOutAlt className="w-5 h-5"/></button>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {activeTab === "merge" ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column: Configuration */}
              <div className="lg:col-span-2 space-y-8">
                
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><FaFilm className="w-5 h-5" /></div>
                    <h2 className="text-lg font-bold text-slate-800">1. Select Videos</h2>
                  </div>
                  <VideoUploader
                    selectedVideos={selectedVideos}
                    onVideosChange={setSelectedVideos}
                    maxVideos={planMaxVideos}
                  />
                </section>

                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FaBolt className="w-5 h-5" /></div>
                    <h2 className="text-lg font-bold text-slate-800">2. Choose Transition</h2>
                  </div>
                  <TransitionGallery
                    selectedTransition={selectedTransition}
                    onSelect={setSelectedTransition}
                  />
                </section>

                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-pink-100 text-pink-600 rounded-lg"><FaMusic className="w-5 h-5" /></div>
                    <h2 className="text-lg font-bold text-slate-800">3. Add Audio (Optional)</h2>
                  </div>
                  <AudioUploader
                    selectedAudio={selectedAudio}
                    onAudioChange={setSelectedAudio}
                  />
                </section>

              </div>

              {/* Right Column: Preview & Action */}
              <div className="lg:col-span-1 space-y-6">
                <div className="sticky top-6">
                  <TransitionPreview
                    transition={previewTransition}
                    videoSources={previewSources}
                  />
                  
                  <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                     <MergeResult
                      status={mergeStatus}
                      taskId={taskId}
                      videoUrl={resultVideoUrl}
                      onReset={resetMerge}
                    />
                    
                    {mergeStatus === "IDLE" && (
                      <button
                        type="button"
                        onClick={handleMerge}
                        disabled={isProcessing || !selectedTransition || selectedVideos.length === 0}
                        className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2"
                      >
                         {isProcessing ? "Processing..." : <>Create Video <FaBolt className="w-5 h-5 fill-white/20" /></>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "transcript" ? (
             <div className="max-w-4xl mx-auto">
                <TranscriptTab />
             </div>
          ) : (
             <SocialMediaTab />
          )}
        </div>
      </main>

			{showUpgradeDialog && (
				<UpgradeDialog onClose={() => setShowUpgradeDialog(false)} />
			)}
			{showHistoryDialog && (
				<HistoryDialog onClose={() => setShowHistoryDialog(false)} />
			)}
		</div>
	);
}
