import { useCallback, useEffect, useMemo, useState } from "react";
import {
	FaChevronLeft,
	FaEdit,
	FaPaperPlane,
	FaPlus,
	FaTimes,
	FaTrash,
} from "react-icons/fa";
import {
	createPost,
	deletePost,
	getCalendar,
	listPlatforms,
	publishPost,
	updatePost,
	type CalendarResponse,
	type PlatformCapability,
	type Project,
	type SocialPost,
} from "@/lib/projectsApi";
import { AuthedImage, StatusBadge } from "./AuthedMedia";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatDayNumber(iso: string): number {
	return Number.parseInt(iso.slice(8, 10), 10);
}

function mondayIndex(iso: string): number {
	const date = new Date(`${iso}T00:00:00`);
	const day = date.getDay(); // 0=Sun
	return (day + 6) % 7;
}

export default function CampaignProjectView({
	project,
	onBack,
}: {
	project: Project;
	onBack: () => void;
}) {
	const [calendar, setCalendar] = useState<CalendarResponse | null>(null);
	const [platforms, setPlatforms] = useState<PlatformCapability[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [openDay, setOpenDay] = useState<string | null>(null);
	const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
	const [creatingForDay, setCreatingForDay] = useState<string | null>(null);

	const refresh = useCallback(async () => {
		setLoading(true);
		try {
			const data = await getCalendar(project.id);
			setCalendar(data);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load calendar");
		} finally {
			setLoading(false);
		}
	}, [project.id]);

	useEffect(() => {
		void refresh();
		void listPlatforms().then(setPlatforms).catch(() => undefined);
	}, [refresh]);

	const capability = useMemo(
		() => platforms.find((item) => item.platform === project.platform),
		[platforms, project.platform],
	);

	const postsByDay = useMemo(() => {
		const map = new Map<string, SocialPost[]>();
		for (const post of calendar?.posts ?? []) {
			const list = map.get(post.date) ?? [];
			list.push(post);
			map.set(post.date, list);
		}
		for (const list of map.values()) {
			list.sort((a, b) => a.time.localeCompare(b.time));
		}
		return map;
	}, [calendar]);

	const days = calendar?.days ?? [];
	const leadingBlanks = days.length > 0 ? mondayIndex(days[0].date) : 0;

	const handleDelete = async (post: SocialPost) => {
		if (!window.confirm("Delete this post?")) return;
		try {
			await deletePost(post.id);
			await refresh();
		} catch (err) {
			window.alert(err instanceof Error ? err.message : "Delete failed");
		}
	};

	const handlePublish = async (post: SocialPost) => {
		try {
			await publishPost(post.id);
			await refresh();
		} catch (err) {
			window.alert(err instanceof Error ? err.message : "Publish failed");
		}
	};

	const dayPosts = openDay ? postsByDay.get(openDay) ?? [] : [];

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
						<h1 className="text-2xl font-bold text-slate-800">{project.name}</h1>
						<p className="text-sm text-slate-500">
							<span className="capitalize">{project.platform}</span>
							{project.start_date && project.end_date && (
								<>
									{" "}
									· {project.start_date} → {project.end_date} · {project.timezone}
								</>
							)}
						</p>
					</div>
				</div>
				<button
					type="button"
					onClick={() => {
						const first = project.start_date ?? days[0]?.date ?? null;
						if (first) setCreatingForDay(first);
					}}
					className="flex items-center gap-2 bg-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-purple-700"
				>
					<FaPlus className="w-3.5 h-3.5" /> Add Post
				</button>
			</div>

			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
					{error}
				</div>
			)}

			<div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
				{loading && !calendar ? (
					<p className="text-sm text-slate-500">Loading calendar…</p>
				) : (
					<>
						<div className="grid grid-cols-7 gap-2 mb-2">
							{WEEKDAYS.map((day) => (
								<div
									key={day}
									className="text-xs font-semibold uppercase tracking-wide text-slate-400 text-center"
								>
									{day}
								</div>
							))}
						</div>
						<div className="grid grid-cols-7 gap-2">
							{Array.from({ length: leadingBlanks }).map((_, index) => (
								<div key={`blank-${index}`} />
							))}
							{days.map((day) => (
								<button
									key={day.date}
									type="button"
									onClick={() => setOpenDay(day.date)}
									className={`relative h-24 rounded-xl border text-left p-2 transition-colors ${
										day.count > 0
											? "border-purple-200 bg-purple-50/60 hover:bg-purple-100"
											: "border-slate-200 hover:bg-slate-50"
									}`}
								>
									<span className="text-sm font-medium text-slate-700">
										{formatDayNumber(day.date)}
									</span>
									{day.count > 0 && (
										<span className="absolute bottom-2 left-2 inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full bg-purple-600 text-white text-xs font-bold">
											{day.count}
										</span>
									)}
								</button>
							))}
						</div>
					</>
				)}
			</div>

			{openDay && (
				<Modal title={`Posts on ${openDay}`} onClose={() => setOpenDay(null)}>
					<div className="space-y-3">
						{dayPosts.length === 0 ? (
							<p className="text-sm text-slate-500">No posts scheduled for this day.</p>
						) : (
							dayPosts.map((post) => (
								<div
									key={post.id}
									className="border border-slate-200 rounded-xl p-3 space-y-2"
								>
									<div className="flex items-start justify-between gap-3">
										<div className="flex-1 min-w-0">
											<p className="text-sm text-slate-800 whitespace-pre-wrap">
												{post.content}
											</p>
											<p className="text-xs text-slate-500 mt-1">
												{post.time} · {post.timezone}
											</p>
											{post.link && (
												<a
													href={post.link}
													target="_blank"
													rel="noreferrer"
													className="text-xs text-blue-600 hover:underline break-all"
												>
													{post.link}
												</a>
											)}
											{post.hashtags.length > 0 && (
												<p className="text-xs text-slate-500 mt-1">
													{post.hashtags.map((tag) => `#${tag}`).join(" ")}
												</p>
											)}
											{post.error && (
												<p className="text-xs text-red-600 mt-1">{post.error}</p>
											)}
										</div>
										{post.image_url && (
											<AuthedImage
												path={post.image_url}
												alt="Post image"
												className="w-20 h-20 rounded-lg object-cover border border-slate-200"
											/>
										)}
									</div>
									<div className="flex items-center justify-between">
										<StatusBadge status={post.status} />
										<div className="flex items-center gap-2">
											<button
												type="button"
												onClick={() => handlePublish(post)}
												className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
												title="Publish now"
											>
												<FaPaperPlane className="w-3.5 h-3.5" />
											</button>
											<button
												type="button"
												onClick={() => setEditingPost(post)}
												className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
												title="Edit"
											>
												<FaEdit className="w-3.5 h-3.5" />
											</button>
											<button
												type="button"
												onClick={() => void handleDelete(post)}
												className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
												title="Delete"
											>
												<FaTrash className="w-3.5 h-3.5" />
											</button>
										</div>
									</div>
								</div>
							))
						)}
						<button
							type="button"
							onClick={() => {
								setCreatingForDay(openDay);
								setOpenDay(null);
							}}
							className="w-full border border-dashed border-purple-300 text-purple-700 text-sm font-medium rounded-xl py-2 hover:bg-purple-50"
						>
							+ Add post on {openDay}
						</button>
					</div>
				</Modal>
			)}

			{creatingForDay && (
				<PostFormModal
					project={project}
					capability={capability}
					initial={{ date: creatingForDay }}
					onClose={() => setCreatingForDay(null)}
					onSaved={async () => {
						setCreatingForDay(null);
						await refresh();
					}}
				/>
			)}

			{editingPost && (
				<PostFormModal
					project={project}
					capability={capability}
					post={editingPost}
					onClose={() => setEditingPost(null)}
					onSaved={async () => {
						setEditingPost(null);
						await refresh();
					}}
				/>
			)}
		</div>
	);
}

function Modal({
	title,
	onClose,
	children,
}: {
	title: string;
	onClose: () => void;
	children: React.ReactNode;
}) {
	return (
		<div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto">
				<div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
					<h2 className="text-base font-bold text-slate-800">{title}</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-slate-400 hover:text-slate-700"
					>
						<FaTimes className="w-4 h-4" />
					</button>
				</div>
				<div className="p-5">{children}</div>
			</div>
		</div>
	);
}

export function PostFormModal({
	project,
	capability,
	post,
	initial,
	onClose,
	onSaved,
}: {
	project: Project;
	capability?: PlatformCapability;
	post?: SocialPost;
	initial?: { date?: string };
	onClose: () => void;
	onSaved: () => void;
}) {
	const maxLength = capability?.max_content_length ?? 3000;
	const [content, setContent] = useState(post?.content ?? "");
	const [date, setDate] = useState(post?.date ?? initial?.date ?? "");
	const [time, setTime] = useState(post?.time ?? "12:00");
	const timezone = post?.timezone ?? project.timezone ?? "UTC";
	const [link, setLink] = useState(post?.link ?? "");
	const [hashtags, setHashtags] = useState((post?.hashtags ?? []).join(", "));
	const [status, setStatus] = useState(post?.status ?? "Draft");
	const [useProjectImage, setUseProjectImage] = useState(false);
	const [image, setImage] = useState<File | null>(null);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const validate = (): string | null => {
		if (!date) return "Date is required.";
		if (project.start_date && project.end_date) {
			if (date < project.start_date || date > project.end_date) {
				return `Date must be within the project range (${project.start_date} – ${project.end_date}).`;
			}
		}
		if (!time) return "Time is required.";
		if (!content.trim()) return "Content is required.";
		if (content.length > maxLength) {
			return `Content exceeds ${capability?.label ?? "the platform"}'s ${maxLength} character limit.`;
		}
		if (link && !/^https?:\/\//i.test(link)) {
			return "Link must be a valid http(s) URL.";
		}
		if (!status) return "Status is required.";
		return null;
	};

	const handleSave = async () => {
		const clientError = validate();
		if (clientError) {
			setError(clientError);
			return;
		}
		setSaving(true);
		setError(null);
		const payload = {
			content,
			date,
			time,
			timezone,
			link: link || undefined,
			hashtags: hashtags || undefined,
			status,
			useProjectImage: useProjectImage && !image,
			image,
		};
		try {
			if (post) {
				await updatePost(post.id, payload);
			} else {
				await createPost(project.id, payload);
			}
			onSaved();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not save post");
		} finally {
			setSaving(false);
		}
	};

	return (
		<Modal title={post ? "Edit Post" : "Add Post"} onClose={onClose}>
			<div className="space-y-4">
				<label className="block">
					<span className="text-sm font-medium text-slate-700">
						Content *{" "}
						<span
							className={`text-xs ${content.length > maxLength ? "text-red-600" : "text-slate-400"}`}
						>
							({content.length}/{maxLength})
						</span>
					</span>
					<textarea
						value={content}
						onChange={(event) => setContent(event.target.value)}
						rows={5}
						className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
						placeholder="What do you want to share?"
					/>
				</label>

				<div className="grid grid-cols-2 gap-3">
					<label className="block">
						<span className="text-sm font-medium text-slate-700">Date *</span>
						<input
							type="date"
							value={date}
							min={project.start_date ?? undefined}
							max={project.end_date ?? undefined}
							onChange={(event) => setDate(event.target.value)}
							className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
						/>
					</label>
					<label className="block">
						<span className="text-sm font-medium text-slate-700">Time *</span>
						<input
							type="time"
							value={time}
							onChange={(event) => setTime(event.target.value)}
							className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
						/>
					</label>
				</div>
				<p className="text-xs text-slate-400 -mt-2">
					Stored in timezone <span className="font-medium">{timezone}</span>.
				</p>

				<label className="block">
					<span className="text-sm font-medium text-slate-700">Link</span>
					<input
						value={link}
						onChange={(event) => setLink(event.target.value)}
						placeholder="https://…"
						className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
					/>
				</label>

				<label className="block">
					<span className="text-sm font-medium text-slate-700">Hashtags</span>
					<input
						value={hashtags}
						onChange={(event) => setHashtags(event.target.value)}
						placeholder="launch, product, ai"
						className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
					/>
				</label>

				<label className="block">
					<span className="text-sm font-medium text-slate-700">Status *</span>
					<select
						value={status}
						onChange={(event) => setStatus(event.target.value as SocialPost["status"])}
						className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
					>
						{["Draft", "Scheduled", "Published", "Failed"].map((value) => (
							<option key={value} value={value}>
								{value}
							</option>
						))}
					</select>
				</label>

				<label className="block">
					<span className="text-sm font-medium text-slate-700">Image</span>
					<input
						type="file"
						accept="image/*"
						onChange={(event) => setImage(event.target.files?.[0] ?? null)}
						className="mt-1 block w-full text-sm text-slate-600"
					/>
					{project.image_url && (
						<label className="mt-2 flex items-center gap-2 text-xs text-slate-600">
							<input
								type="checkbox"
								checked={useProjectImage}
								onChange={(event) => setUseProjectImage(event.target.checked)}
							/>
							Use project image / logo as default
						</label>
					)}
				</label>

				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
						{error}
					</div>
				)}

				<div className="flex justify-end gap-3 pt-2">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={() => void handleSave()}
						disabled={saving}
						className="px-5 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50"
					>
						{saving ? "Saving…" : post ? "Save Changes" : "Add Post"}
					</button>
				</div>
			</div>
		</Modal>
	);
}
