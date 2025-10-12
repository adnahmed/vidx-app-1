// Transcript API types based on OpenAPI schema

export interface TranscriptSnippet {
	text: string;
	start: number;
	duration: number;
}

export interface TranscriptResponse {
	video_id: string;
	language: string;
	language_code: string;
	is_generated: boolean;
	snippets: TranscriptSnippet[];
}

export interface TranscriptRequest {
	video_id: string;
	languages?: string[];
	preserve_formatting?: boolean;
}

export interface TranscriptMetadata {
	video_id: string;
	language: string;
	language_code: string;
	is_generated: boolean;
	is_translatable: boolean;
	translation_languages: Record<string, unknown>[];
}

export interface TranscriptListResponse {
	video_id: string;
	transcripts: TranscriptMetadata[];
}

export interface TranslateTranscriptRequest {
	video_id: string;
	source_language: string;
	target_language: string;
}

export interface ErrorResponse {
	error: string;
	detail?: string | null;
}
