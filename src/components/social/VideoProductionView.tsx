import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	FaChevronLeft,
	FaDownload,
	FaFileExcel,
	FaMagic,
	FaRedo,
	FaVideo,
} from "react-icons/fa";
import {
	generateComponent,
	importScenes,
	listScenes,
	renderProject,
	renderScene,
	updateScene,
	type ComponentState,
	type Project,
	type Scene,
	type SceneComponent,
} from "@/lib/projectsApi";
import { AuthedImage, AuthedVideo, StatusBadge } from "./AuthedMedia";

const POLL_INTERVAL_MS = 3000;

function isActive(state: ComponentState | undefined): boolean {
	return state?.status === "queued" || state?.status === "processing";
}

function sceneHasActiveWork(scene: Scene): boolean {
	return (
		isActive(scene.image) ||
		isActive(scene.video) ||
		isActive(scene.audio) ||
		isActive(scene.subtitle) ||
		isActive(scene.render)
	);
}

export default function VideoProductionView({
	project,
	onBack,
}: {
	project: Project;
	onBack: () => void;
}) {
	const [scenes, setScenes] = useState<Scene[]>([]);
	const [projectState, setProjectState] = useState<Project>(project);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [importMode, setImportMode] = useState<"replace" | "append">("replace");
	const [importMessage, setImportMessage] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const refresh = useCallback(async () => {
		try {
			const [sceneList, projectResponse] = await Promise.all([
				listScenes(project.id),
				fetchProjectState(project.id),
			]);
			setScenes(sceneList);
			setProjectState(projectResponse);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load scenes");
		} finally {
			setLoading(false);
		}
	}, [project.id]);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	const hasActiveWork = useMemo(
		() =>
			scenes.some(sceneHasActiveWork) ||
			isActive(projectState.final_video),
		[scenes, projectState.final_video],
	);

	useEffect(() => {
		if (!hasActiveWork) return;
		const timer = window.setInterval(() => {
			void refresh();
		}, POLL_INTERVAL_MS);
		return () => window.clearInterval(timer);
	}, [hasActiveWork, refresh]);

	const handleImport = async (file: File) => {
		setImportMessage(null);
		setError(null);
		try {
			const result = await importScenes(project.id, file, importMode);
			setImportMessage(`Imported ${result.imported} scene(s) (${result.mode}).`);
			await refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Import failed");
		} finally {
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	const handleGenerate = async (
		scene: Scene,
		component: SceneComponent,
		force = false,
	) => {
		try {
			await generateComponent(scene.id, component, force);
			await refresh();
		} catch (err) {
			window.alert(err instanceof Error ? err.message : "Generation failed");
		}
	};

	const handleRenderScene = async (scene: Scene) => {
		try {
			await renderScene(scene.id);
			await refresh();
		} catch (err) {
			window.alert(err instanceof Error ? err.message : "Render failed");
		}
	};

	const handleRenderProject = async () => {
		try {
			const updated = await renderProject(project.id);
			setProjectState(updated);
			await refresh();
		} catch (err) {
			window.alert(err instanceof Error ? err.message : "Final render failed");
		}
	};

	const allRendered =
		scenes.length > 0 &&
		scenes.every((scene) => scene.render.status === "completed");

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between flex-wrap gap-3">
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={onBack}
						className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
						aria-label="Back to projects"
					>
						<FaChevronLeft className="w-4 h-4" />
					</button>
					<div>
						<h1 className="text-2xl font-bold text-slate-800">{projectState.name}</h1>
						<p className="text-sm text-slate-500">
							Video Production · {scenes.length} scene(s) · <StatusBadge status={projectState.status} />
						</p>
					</div>
				</div>
				{projectState.image_url && (
					<AuthedImage
						path={projectState.image_url}
						alt="Project logo"
						className="w-16 h-16 rounded-xl object-cover border border-slate-200"
					/>
				)}
			</div>

			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
					{error}
				</div>
			)}

			<section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
				<div className="flex items-center gap-3 mb-3">
					<div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
						<FaFileExcel className="w-4 h-4" />
					</div>
					<div>
						<h2 className="font-semibold text-slate-800">Import Scenes from Excel</h2>
						<p className="text-xs text-slate-500">
							One row per scene with Image Prompt, Scene Prompt, Audio Prompt and optional
							Scene Number. Excel is import-only — the database is the source of truth
							afterwards.
						</p>
					</div>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<input
						ref={fileInputRef}
						type="file"
						accept=".xlsx"
						onChange={(event) => {
							const file = event.target.files?.[0];
							if (file) void handleImport(file);
						}}
						className="text-sm text-slate-600"
					/>
					<select
						value={importMode}
						onChange={(event) => setImportMode(event.target.value as "replace" | "append")}
						className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
					>
						<option value="replace">Replace existing scenes</option>
						<option value="append">Append to existing scenes</option>
					</select>
					{importMessage && (
						<span className="text-sm text-emerald-700">{importMessage}</span>
					)}
				</div>
			</section>

			<section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
				<div className="flex items-center justify-between flex-wrap gap-3">
					<div className="flex items-center gap-2">
						<FaVideo className="w-4 h-4 text-purple-600" />
						<h2 className="font-semibold text-slate-800">Final Video</h2>
						<StatusBadge
							status={projectState.final_video.status}
							title={projectState.final_video.error ?? undefined}
						/>
					</div>
					<div className="flex items-center gap-3">
						{projectState.final_video.asset_url && (
							<AuthedVideo
								path={projectState.final_video.asset_url}
								className="w-48 h-28 rounded-lg bg-black"
							/>
						)}
						<button
							type="button"
							onClick={() => void handleRenderProject()}
							disabled={!allRendered || isActive(projectState.final_video)}
							className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
							title={
								allRendered
									? "Assemble the final video from rendered scenes"
									: "All scenes must be rendered first"
							}
						>
							<FaMagic className="w-3.5 h-3.5" />
							Assemble Final Video
						</button>
					</div>
				</div>
				{projectState.final_video.error && (
					<p className="text-xs text-red-600 mt-2">{projectState.final_video.error}</p>
				)}
			</section>

			{loading ? (
				<p className="text-sm text-slate-500">Loading scenes…</p>
			) : scenes.length === 0 ? (
				<div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center text-slate-500 text-sm">
					Import an Excel workbook to create scenes.
				</div>
			) : (
				<div className="space-y-4">
					{scenes.map((scene) => (
						<SceneCard
							key={scene.id}
							scene={scene}
							onGenerate={handleGenerate}
							onRender={handleRenderScene}
							onPromptsSaved={refresh}
						/>
					))}
				</div>
			)}
		</div>
	);
}

async function fetchProjectState(projectId: string): Promise<Project> {
	const { getProject } = await import("@/lib/projectsApi");
	return getProject(projectId);
}

function SceneCard({
	scene,
	onGenerate,
	onRender,
	onPromptsSaved,
}: {
	scene: Scene;
	onGenerate: (scene: Scene, component: SceneComponent, force?: boolean) => Promise<void>;
	onRender: (scene: Scene) => Promise<void>;
	onPromptsSaved: () => Promise<void>;
}) {
	const [imagePrompt, setImagePrompt] = useState(scene.image_prompt);
	const [scenePrompt, setScenePrompt] = useState(scene.scene_prompt);
	const [audioPrompt, setAudioPrompt] = useState(scene.audio_prompt);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		setImagePrompt(scene.image_prompt);
		setScenePrompt(scene.scene_prompt);
		setAudioPrompt(scene.audio_prompt);
	}, [scene.id, scene.image_prompt, scene.scene_prompt, scene.audio_prompt]);

	const dirty =
		imagePrompt !== scene.image_prompt ||
		scenePrompt !== scene.scene_prompt ||
		audioPrompt !== scene.audio_prompt;

	const handleSave = async () => {
		setSaving(true);
		try {
			await updateScene(scene.id, {
				image_prompt: imagePrompt,
				scene_prompt: scenePrompt,
				audio_prompt: audioPrompt,
			});
			await onPromptsSaved();
		} catch (err) {
			window.alert(err instanceof Error ? err.message : "Save failed");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900 text-white text-sm font-bold">
						{scene.scene_number}
					</span>
					<StatusBadge status={scene.overall_status} />
				</div>
				<button
					type="button"
					onClick={() => void handleSave()}
					disabled={!dirty || saving}
					className="text-sm font-medium px-3 py-1.5 rounded-lg bg-slate-900 text-white disabled:opacity-30"
				>
					{saving ? "Saving…" : "Save Prompts"}
				</button>
			</div>

			<div className="grid lg:grid-cols-3 gap-3">
				<label className="block">
					<span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
						Image Prompt
					</span>
					<textarea
						value={imagePrompt}
						onChange={(event) => setImagePrompt(event.target.value)}
						rows={3}
						className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
					/>
				</label>
				<label className="block">
					<span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
						Scene Prompt
					</span>
					<textarea
						value={scenePrompt}
						onChange={(event) => setScenePrompt(event.target.value)}
						rows={3}
						className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
					/>
				</label>
				<label className="block">
					<span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
						Audio Prompt
					</span>
					<textarea
						value={audioPrompt}
						onChange={(event) => setAudioPrompt(event.target.value)}
						rows={3}
						className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
					/>
				</label>
			</div>

			<div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
				<ComponentRow
					label="Image"
					state={scene.image}
					asset={
						scene.image.asset_url ? (
							<AuthedImage
								path={scene.image.asset_url}
								alt={`Scene ${scene.scene_number} image`}
								className="w-24 h-16 rounded-lg object-cover border border-slate-200"
							/>
						) : undefined
					}
					canGenerate
					onGenerate={(force) => onGenerate(scene, "image", force)}
				/>
				<ComponentRow
					label="Video"
					state={scene.video}
					asset={
						scene.video.asset_url ? (
							<AuthedVideo
								path={scene.video.asset_url}
								className="w-32 h-20 rounded-lg bg-black"
							/>
						) : undefined
					}
					canGenerate={scene.image.status === "completed"}
					generateHint="Image must complete first"
					onGenerate={(force) => onGenerate(scene, "video", force)}
				/>
				<ComponentRow
					label="Audio"
					state={scene.audio}
					canGenerate
					onGenerate={(force) => onGenerate(scene, "audio", force)}
				/>
				<ComponentRow
					label="Subtitles"
					state={scene.subtitle}
					asset={
						scene.subtitle.asset_url ? (
							<button
								type="button"
								onClick={async () => {
									const { fetchAuthedBlobUrl } = await import("@/lib/projectsApi");
									if (!scene.subtitle.asset_url) return;
									const url = await fetchAuthedBlobUrl(scene.subtitle.asset_url);
									window.open(url, "_blank");
								}}
								className="text-xs text-blue-600 hover:underline flex items-center gap-1"
							>
								<FaDownload className="w-3 h-3" /> Download SRT
							</button>
						) : undefined
					}
					canGenerate
					onGenerate={(force) => onGenerate(scene, "subtitle", force)}
				/>
			</div>

			<div className="flex items-center justify-between border-t border-slate-100 pt-3">
				<div className="flex items-center gap-3">
					<span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
						Final Scene Render
					</span>
					<StatusBadge status={scene.render.status} title={scene.render.error ?? undefined} />
					{scene.render.error && (
						<p className="text-xs text-red-600 max-w-md truncate" title={scene.render.error}>
							{scene.render.error}
						</p>
					)}
				</div>
				<div className="flex items-center gap-2">
					{scene.render.asset_url && (
						<AuthedVideo
							path={scene.render.asset_url}
							className="w-40 h-24 rounded-lg bg-black"
						/>
					)}
					<button
						type="button"
						onClick={() => void onRender(scene)}
						disabled={
							scene.video.status !== "completed" ||
							scene.render.status === "queued" ||
							scene.render.status === "processing"
						}
						className="flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-lg disabled:opacity-40"
						title={
							scene.video.status === "completed"
								? "Render final scene video with logo and subtitles"
								: "Generated video must complete first"
						}
					>
						<FaMagic className="w-3 h-3" />
						{scene.render.status === "completed" ? "Re-render Scene" : "Render Scene"}
					</button>
				</div>
			</div>
		</div>
	);
}

function ComponentRow({
	label,
	state,
	asset,
	canGenerate,
	generateHint,
	onGenerate,
}: {
	label: string;
	state: ComponentState;
	asset?: React.ReactNode;
	canGenerate?: boolean;
	generateHint?: string;
	onGenerate: (force: boolean) => Promise<void>;
}) {
	const completed = state.status === "completed";
	const busy = state.status === "queued" || state.status === "processing";
	return (
		<div className="border border-slate-200 rounded-xl p-3 space-y-2">
			<div className="flex items-center justify-between">
				<span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
					{label}
				</span>
				<StatusBadge status={state.status} title={state.error ?? undefined} />
			</div>
			{asset}
			{state.error && (
				<p className="text-[11px] text-red-600 line-clamp-2" title={state.error}>
					{state.error}
				</p>
			)}
			<div className="flex items-center gap-2">
				{completed ? (
					<button
						type="button"
						onClick={() => void onGenerate(true)}
						className="flex items-center gap-1 text-xs text-slate-600 hover:text-purple-700"
					>
						<FaRedo className="w-3 h-3" /> Regenerate
					</button>
				) : (
					<button
						type="button"
						onClick={() => void onGenerate(false)}
						disabled={!canGenerate || busy}
						title={!canGenerate ? generateHint : undefined}
						className="flex items-center gap-1 text-xs font-medium text-purple-700 hover:text-purple-900 disabled:opacity-40"
					>
						<FaMagic className="w-3 h-3" /> {busy ? "Working…" : "Generate"}
					</button>
				)}
				{state.provider_job_id && (
					<span
						className="text-[10px] text-slate-400 truncate max-w-[8rem]"
						title={`provider job ${state.provider_job_id}`}
					>
						{state.provider_job_id}
					</span>
				)}
			</div>
		</div>
	);
}
