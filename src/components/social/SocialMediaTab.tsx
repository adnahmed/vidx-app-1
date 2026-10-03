import { useCallback, useEffect, useMemo, useState } from "react";
import {
	FaBullhorn,
	FaCalendarAlt,
	FaChevronLeft,
	FaFilm,
	FaPlus,
	FaTrash,
} from "react-icons/fa";
import {
	createProject,
	deleteProject,
	listPlatforms,
	listProjects,
	type PlatformCapability,
	type Project,
	type ProjectType,
} from "@/lib/projectsApi";
import { AuthedImage, StatusBadge } from "./AuthedMedia";
import CampaignProjectView from "./CampaignProjectView";
import VideoProductionView from "./VideoProductionView";

const TIMEZONES = [
	"UTC",
	"Europe/Berlin",
	"Europe/London",
	"Europe/Paris",
	"Europe/Madrid",
	"America/New_York",
	"America/Chicago",
	"America/Denver",
	"America/Los_Angeles",
	"Asia/Dubai",
	"Asia/Karachi",
	"Asia/Kolkata",
	"Asia/Singapore",
	"Asia/Tokyo",
	"Australia/Sydney",
];

function browserTimezone(): string {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
	} catch {
		return "UTC";
	}
}

export default function SocialMediaTab() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [platforms, setPlatforms] = useState<PlatformCapability[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showCreate, setShowCreate] = useState(false);
	const [selected, setSelected] = useState<Project | null>(null);

	const refresh = useCallback(async () => {
		setLoading(true);
		try {
			const [projectList, platformList] = await Promise.all([
				listProjects(),
				listPlatforms(),
			]);
			setProjects(projectList);
			setPlatforms(platformList);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load projects");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	const handleDelete = async (project: Project) => {
		if (!window.confirm(`Delete project "${project.name}"? This cannot be undone.`)) {
			return;
		}
		try {
			await deleteProject(project.id);
			setProjects((current) => current.filter((p) => p.id !== project.id));
		} catch (err) {
			window.alert(err instanceof Error ? err.message : "Delete failed");
		}
	};

	if (selected) {
		const backToList = () => {
			setSelected(null);
			void refresh();
		};
		if (selected.project_type === "social_campaign") {
			return <CampaignProjectView project={selected} onBack={backToList} />;
		}
		return <VideoProductionView project={selected} onBack={backToList} />;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-slate-800">Social Media</h1>
					<p className="text-sm text-slate-500 mt-1">
						Plan campaigns or produce scene-based videos with external AI providers.
					</p>
				</div>
				<button
					type="button"
					onClick={() => setShowCreate(true)}
					className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold px-4 py-2.5 rounded-xl shadow hover:shadow-lg transition-all"
				>
					<FaPlus className="w-4 h-4" />
					New Project
				</button>
			</div>

			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
					{error}
				</div>
			)}

			{loading ? (
				<div className="text-slate-500 text-sm">Loading projects…</div>
			) : projects.length === 0 ? (
				<div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
					<div className="mx-auto w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
						<FaBullhorn className="w-5 h-5" />
					</div>
					<h2 className="text-lg font-semibold text-slate-700">No projects yet</h2>
					<p className="text-sm text-slate-500 mt-1">
						Create a Social Media Campaign or a Video Production project to get started.
					</p>
				</div>
			) : (
				<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
					{projects.map((project) => (
						<div
							key={project.id}
							className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
						>
							<button
								type="button"
								onClick={() => setSelected(project)}
								className="text-left flex-1"
							>
								<div className="h-32 bg-slate-100">
									{project.image_url ? (
										<AuthedImage
											path={project.image_url}
											alt={project.name}
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center text-slate-400">
											{project.project_type === "social_campaign" ? (
												<FaCalendarAlt className="w-7 h-7" />
											) : (
												<FaFilm className="w-7 h-7" />
											)}
										</div>
									)}
								</div>
								<div className="p-4 space-y-2">
									<div className="flex items-center justify-between gap-2">
										<span className="text-xs font-semibold uppercase tracking-wide text-purple-600">
											{project.project_type === "social_campaign"
												? "Social Media Campaign"
												: "Video Production"}
										</span>
										<StatusBadge status={project.status} />
									</div>
									<h3 className="font-semibold text-slate-800 truncate">{project.name}</h3>
									{project.description && (
										<p className="text-xs text-slate-500 line-clamp-2">
											{project.description}
										</p>
									)}
									<div className="text-xs text-slate-500">
										{project.platform && (
											<span className="mr-3 capitalize">{project.platform}</span>
										)}
										{project.start_date && project.end_date && (
											<span>
												{project.start_date} → {project.end_date}
											</span>
										)}
									</div>
								</div>
							</button>
							<div className="px-4 pb-3 flex justify-end">
								<button
									type="button"
									onClick={() => void handleDelete(project)}
									className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
								>
									<FaTrash className="w-3 h-3" /> Delete
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			{showCreate && (
				<CreateProjectModal
					platforms={platforms}
					onClose={() => setShowCreate(false)}
					onCreated={async (project) => {
						setShowCreate(false);
						setProjects((current) => [project, ...current]);
						setSelected(project);
					}}
				/>
			)}
		</div>
	);
}

function CreateProjectModal({
	platforms,
	onClose,
	onCreated,
}: {
	platforms: PlatformCapability[];
	onClose: () => void;
	onCreated: (project: Project) => void;
}) {
	const [projectType, setProjectType] = useState<ProjectType>("social_campaign");
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [platform, setPlatform] = useState("linkedin");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [timezone, setTimezone] = useState(browserTimezone());
	const [image, setImage] = useState<File | null>(null);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const timezoneOptions = useMemo(
		() => Array.from(new Set([browserTimezone(), ...TIMEZONES])),
		[],
	);

	const availablePlatforms = platforms.filter(
		(capability) => capability.availability === "available",
	);
	const plannedPlatforms = platforms.filter(
		(capability) => capability.availability !== "available",
	);

	const validate = (): string | null => {
		if (!name.trim()) return "Project name is required.";
		if (projectType === "social_campaign") {
			if (!platform) return "Platform is required.";
			if (!startDate) return "Start date is required.";
			if (!endDate) return "End date is required.";
			if (startDate && endDate && endDate < startDate) {
				return "End date cannot precede the start date.";
			}
			if (!timezone) return "Timezone is required.";
		}
		return null;
	};

	const handleSubmit = async () => {
		const clientError = validate();
		if (clientError) {
			setError(clientError);
			return;
		}
		setSaving(true);
		setError(null);
		try {
			const project = await createProject({
				projectType,
				name: name.trim(),
				description: description.trim() || undefined,
				platform: projectType === "social_campaign" ? platform : undefined,
				startDate: projectType === "social_campaign" ? startDate : undefined,
				endDate: projectType === "social_campaign" ? endDate : undefined,
				timezone: projectType === "social_campaign" ? timezone : undefined,
				image,
			});
			onCreated(project);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not create project");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
				<div className="p-6 border-b border-slate-100 flex items-center justify-between">
					<h2 className="text-lg font-bold text-slate-800">Create Project</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-slate-400 hover:text-slate-700"
					>
						<FaChevronLeft className="w-4 h-4 rotate-180" />
					</button>
				</div>
				<div className="p-6 space-y-4">
					<div className="grid grid-cols-2 gap-3">
						{(
							[
								["social_campaign", "Social Media Campaign", FaCalendarAlt],
								["video_production", "Video Production", FaFilm],
							] as const
						).map(([value, label, Icon]) => (
							<button
								key={value}
								type="button"
								onClick={() => setProjectType(value)}
								className={`flex flex-col items-center gap-2 border-2 rounded-xl p-4 transition-colors ${
									projectType === value
										? "border-purple-600 bg-purple-50 text-purple-700"
										: "border-slate-200 text-slate-600 hover:border-purple-300"
								}`}
							>
								<Icon className="w-5 h-5" />
								<span className="text-sm font-medium">{label}</span>
							</button>
						))}
					</div>

					<label className="block">
						<span className="text-sm font-medium text-slate-700">Project Name *</span>
						<input
							value={name}
							onChange={(event) => setName(event.target.value)}
							className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
							placeholder="Q1 Product Launch"
						/>
					</label>

					<label className="block">
						<span className="text-sm font-medium text-slate-700">Description</span>
						<textarea
							value={description}
							onChange={(event) => setDescription(event.target.value)}
							rows={2}
							className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
							placeholder="Optional"
						/>
					</label>

					{projectType === "social_campaign" && (
						<>
							<label className="block">
								<span className="text-sm font-medium text-slate-700">Platform *</span>
								<select
									value={platform}
									onChange={(event) => setPlatform(event.target.value)}
									className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
								>
									{availablePlatforms.map((capability) => (
										<option key={capability.platform} value={capability.platform}>
											{capability.label}
										</option>
									))}
									{plannedPlatforms.map((capability) => (
										<option key={capability.platform} value={capability.platform} disabled>
											{capability.label} (coming soon)
										</option>
									))}
								</select>
							</label>

							<div className="grid grid-cols-2 gap-3">
								<label className="block">
									<span className="text-sm font-medium text-slate-700">Start Date *</span>
									<input
										type="date"
										value={startDate}
										onChange={(event) => setStartDate(event.target.value)}
										className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
									/>
								</label>
								<label className="block">
									<span className="text-sm font-medium text-slate-700">End Date *</span>
									<input
										type="date"
										value={endDate}
										onChange={(event) => setEndDate(event.target.value)}
										className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
									/>
								</label>
							</div>
							{startDate && endDate && endDate < startDate && (
								<p className="text-xs text-red-600">
									End date cannot precede the start date.
								</p>
							)}

							<label className="block">
								<span className="text-sm font-medium text-slate-700">Timezone *</span>
								<select
									value={timezone}
									onChange={(event) => setTimezone(event.target.value)}
									className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
								>
									{timezoneOptions.map((zone) => (
										<option key={zone} value={zone}>
											{zone}
										</option>
									))}
								</select>
							</label>
						</>
					)}

					<label className="block">
						<span className="text-sm font-medium text-slate-700">
							Project Image / Logo
						</span>
						<input
							type="file"
							accept="image/*"
							onChange={(event) => setImage(event.target.files?.[0] ?? null)}
							className="mt-1 block w-full text-sm text-slate-600"
						/>
						<span className="text-xs text-slate-400">
							Used as logo overlay on rendered videos and as the default post image.
						</span>
					</label>

					{error && (
						<div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
							{error}
						</div>
					)}
				</div>
				<div className="p-6 border-t border-slate-100 flex justify-end gap-3">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={() => void handleSubmit()}
						disabled={saving}
						className="px-5 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50"
					>
						{saving ? "Creating…" : "Create Project"}
					</button>
				</div>
			</div>
		</div>
	);
}
