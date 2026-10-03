/**
 * API client for the Social Media module: projects (Video Production and
 * Social Media Campaign), campaign posts and video-production scenes.
 */

import { API_BASE_URL } from "@/lib/api";
import { buildAuthHeaders, clearSession } from "@/lib/auth";

export type ProjectType = "video_production" | "social_campaign";

export interface ComponentState {
	status: "idle" | "queued" | "processing" | "completed" | "failed";
	error?: string | null;
	provider?: string | null;
	provider_job_id?: string | null;
	correlation_id?: string | null;
	asset_url?: string | null;
	attempts: number;
	submitted_at?: string | null;
	completed_at?: string | null;
	updated_at?: string | null;
}

export interface Project {
	id: string;
	project_type: ProjectType;
	name: string;
	description?: string | null;
	platform?: string | null;
	start_date?: string | null;
	end_date?: string | null;
	timezone?: string | null;
	status: string;
	image_url?: string | null;
	options: Record<string, unknown>;
	final_video: ComponentState;
	created_at: string;
	updated_at: string;
}

export interface SocialPost {
	id: string;
	project_id: string;
	platform: string;
	content: string;
	image_url?: string | null;
	link?: string | null;
	hashtags: string[];
	date: string;
	time: string;
	timezone: string;
	scheduled_at_utc: string;
	status: "Draft" | "Scheduled" | "Published" | "Failed";
	error?: string | null;
	provider_post_id?: string | null;
	published_at?: string | null;
	created_at: string;
	updated_at: string;
}

export interface CalendarDay {
	date: string;
	count: number;
}

export interface CalendarResponse {
	project: Project;
	days: CalendarDay[];
	posts: SocialPost[];
}

export interface PlatformCapability {
	platform: string;
	label: string;
	availability: "available" | "planned";
	max_content_length: number;
	max_hashtags?: number | null;
	supports_images: boolean;
	supports_links: boolean;
	supports_scheduling: boolean;
	notes: string;
}

export interface Scene {
	id: string;
	project_id: string;
	scene_number: number;
	image_prompt: string;
	scene_prompt: string;
	audio_prompt: string;
	image: ComponentState;
	video: ComponentState;
	audio: ComponentState;
	subtitle: ComponentState;
	render: ComponentState;
	overall_status: string;
	source: string;
	created_at: string;
	updated_at: string;
}

export interface ImportResult {
	imported: number;
	mode: string;
	errors: string[];
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
	const headers = new Headers(init.headers);
	const authHeaders = buildAuthHeaders();
	Object.entries(authHeaders).forEach(([key, value]) => headers.set(key, value));
	const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
	if (response.status === 401) {
		// Expired or invalid session: clear it and return to login.
		// Hash-based routing keeps deep links working on static hosts without
		// an SPA rewrite rule.
		clearSession();
		if (!window.location.hash.startsWith("#/login")) {
			window.location.replace(`${window.location.origin}/#/login`);
			window.location.reload();
		}
	}
	return response;
}

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
	const response = await request(path, init);
	if (!response.ok) {
		let detail = `Request failed (${response.status})`;
		try {
			const body = await response.json();
			if (body && typeof body.detail === "string") {
				detail = body.detail;
			}
		} catch {
			// keep default detail
		}
		throw new Error(detail);
	}
	if (response.status === 204) {
		return undefined as T;
	}
	return (await response.json()) as T;
}

export function projectMediaUrl(path?: string | null): string | null {
	if (!path) return null;
	return path.startsWith("http") ? path : `${API_BASE_URL}${path.replace(/^\/api/, "")}`;
}

/** Fetch an authenticated media URL and return an object URL for <img>/<video>. */
export async function fetchAuthedBlobUrl(path: string): Promise<string> {
	const response = await request(path.replace(/^\/api/, ""));
	if (!response.ok) {
		throw new Error(`Media request failed (${response.status})`);
	}
	const blob = await response.blob();
	return URL.createObjectURL(blob);
}

// ── platforms ────────────────────────────────────────────────────────────────

export function listPlatforms(): Promise<PlatformCapability[]> {
	return requestJson<PlatformCapability[]>("/social/platforms");
}

// ── projects ─────────────────────────────────────────────────────────────────

export function listProjects(projectType?: ProjectType): Promise<Project[]> {
	const query = projectType ? `?project_type=${projectType}` : "";
	return requestJson<Project[]>(`/projects${query}`);
}

export function getProject(projectId: string): Promise<Project> {
	return requestJson<Project>(`/projects/${projectId}`);
}

export interface CreateProjectInput {
	projectType: ProjectType;
	name: string;
	description?: string;
	platform?: string;
	startDate?: string;
	endDate?: string;
	timezone?: string;
	image?: File | null;
}

export function createProject(input: CreateProjectInput): Promise<Project> {
	const form = new FormData();
	form.append("project_type", input.projectType);
	form.append("name", input.name);
	if (input.description) form.append("description", input.description);
	if (input.platform) form.append("platform", input.platform);
	if (input.startDate) form.append("start_date", input.startDate);
	if (input.endDate) form.append("end_date", input.endDate);
	if (input.timezone) form.append("timezone", input.timezone);
	if (input.image) form.append("image", input.image);
	return requestJson<Project>("/projects", { method: "POST", body: form });
}

export function deleteProject(projectId: string): Promise<void> {
	return requestJson<void>(`/projects/${projectId}`, { method: "DELETE" });
}

// ── campaign calendar + posts ────────────────────────────────────────────────

export function getCalendar(projectId: string): Promise<CalendarResponse> {
	return requestJson<CalendarResponse>(`/projects/${projectId}/calendar`);
}

export interface PostInput {
	content: string;
	date: string;
	time: string;
	timezone: string;
	link?: string;
	hashtags?: string;
	status: string;
	useProjectImage?: boolean;
	image?: File | null;
}

function postFormData(input: PostInput): FormData {
	const form = new FormData();
	form.append("content", input.content);
	form.append("date", input.date);
	form.append("time", input.time);
	form.append("timezone", input.timezone);
	form.append("link", input.link ?? "");
	form.append("hashtags", input.hashtags ?? "");
	form.append("status", input.status);
	form.append("use_project_image", String(Boolean(input.useProjectImage)));
	if (input.image) form.append("image", input.image);
	return form;
}

export function createPost(projectId: string, input: PostInput): Promise<SocialPost> {
	return requestJson<SocialPost>(`/projects/${projectId}/posts`, {
		method: "POST",
		body: postFormData(input),
	});
}

export function updatePost(postId: string, input: PostInput): Promise<SocialPost> {
	return requestJson<SocialPost>(`/posts/${postId}`, {
		method: "PUT",
		body: postFormData(input),
	});
}

export function deletePost(postId: string): Promise<void> {
	return requestJson<void>(`/posts/${postId}`, { method: "DELETE" });
}

export function publishPost(postId: string): Promise<SocialPost> {
	return requestJson<SocialPost>(`/posts/${postId}/publish`, { method: "POST" });
}

// ── video production scenes ──────────────────────────────────────────────────

export function listScenes(projectId: string): Promise<Scene[]> {
	return requestJson<Scene[]>(`/projects/${projectId}/scenes`);
}

export function importScenes(
	projectId: string,
	file: File,
	mode: "replace" | "append" = "replace",
): Promise<ImportResult> {
	const form = new FormData();
	form.append("file", file);
	return requestJson<ImportResult>(`/projects/${projectId}/import-scenes?mode=${mode}`, {
		method: "POST",
		body: form,
	});
}

export function updateScene(
	sceneId: string,
	prompts: Partial<Pick<Scene, "image_prompt" | "scene_prompt" | "audio_prompt">>,
): Promise<Scene> {
	return requestJson<Scene>(`/scenes/${sceneId}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(prompts),
	});
}

export type SceneComponent = "image" | "video" | "audio" | "subtitle";

export function generateComponent(
	sceneId: string,
	component: SceneComponent,
	force = false,
): Promise<Scene> {
	return requestJson<Scene>(`/scenes/${sceneId}/generate`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ component, force }),
	});
}

export function renderScene(sceneId: string): Promise<Scene> {
	return requestJson<Scene>(`/scenes/${sceneId}/render`, { method: "POST" });
}

export function renderProject(projectId: string): Promise<Project> {
	return requestJson<Project>(`/projects/${projectId}/render`, { method: "POST" });
}
