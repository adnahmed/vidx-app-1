import { useEffect, useState } from "react";
import { FaImage } from "react-icons/fa";
import { fetchAuthedBlobUrl } from "@/lib/projectsApi";

/** Renders an authenticated backend image via an object URL. */
export function AuthedImage({
	path,
	alt,
	className,
	fallback,
}: {
	path?: string | null;
	alt: string;
	className?: string;
	fallback?: React.ReactNode;
}) {
	const [objectUrl, setObjectUrl] = useState<string | null>(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		let revoked = false;
		let created: string | null = null;
		setFailed(false);
		if (!path) {
			setObjectUrl(null);
			return;
		}
		fetchAuthedBlobUrl(path)
			.then((url) => {
				if (revoked) {
					URL.revokeObjectURL(url);
					return;
				}
				created = url;
				setObjectUrl(url);
			})
			.catch(() => {
				setObjectUrl(null);
				setFailed(true);
			});
		return () => {
			revoked = true;
			if (created) URL.revokeObjectURL(created);
		};
	}, [path]);

	if (!path || failed || !objectUrl) {
		return (
			<div
				className={`flex items-center justify-center bg-slate-100 text-slate-400 ${className ?? ""}`}
			>
				{fallback ?? <FaImage className="w-6 h-6" />}
			</div>
		);
	}
	return <img src={objectUrl} alt={alt} className={className} />;
}

/** Renders an authenticated backend video via an object URL. */
export function AuthedVideo({
	path,
	className,
}: {
	path?: string | null;
	className?: string;
}) {
	const [objectUrl, setObjectUrl] = useState<string | null>(null);

	useEffect(() => {
		let revoked = false;
		let created: string | null = null;
		if (!path) {
			setObjectUrl(null);
			return;
		}
		fetchAuthedBlobUrl(path)
			.then((url) => {
				if (revoked) {
					URL.revokeObjectURL(url);
					return;
				}
				created = url;
				setObjectUrl(url);
			})
			.catch(() => setObjectUrl(null));
		return () => {
			revoked = true;
			if (created) URL.revokeObjectURL(created);
		};
	}, [path]);

	if (!path || !objectUrl) {
		return <div className={`bg-slate-900 ${className ?? ""}`} />;
	}
	return <video src={objectUrl} controls className={className} />;
}

const STATUS_STYLES: Record<string, string> = {
	idle: "bg-slate-100 text-slate-500",
	queued: "bg-amber-100 text-amber-700",
	processing: "bg-blue-100 text-blue-700",
	completed: "bg-emerald-100 text-emerald-700",
	failed: "bg-red-100 text-red-700",
	Draft: "bg-slate-100 text-slate-600",
	Scheduled: "bg-blue-100 text-blue-700",
	Published: "bg-emerald-100 text-emerald-700",
	Failed: "bg-red-100 text-red-700",
	draft: "bg-slate-100 text-slate-500",
	image_ready: "bg-cyan-100 text-cyan-700",
	video_ready: "bg-indigo-100 text-indigo-700",
};

export function StatusBadge({ status, title }: { status: string; title?: string }) {
	const classes = STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600";
	return (
		<span
			title={title}
			className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${classes}`}
		>
			{status.replace(/_/g, " ")}
		</span>
	);
}
