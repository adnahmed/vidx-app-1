import { useCallback, useEffect, useState } from "react";

import { API_BASE_URL } from "@/lib/api";
import { buildAuthHeaders } from "@/lib/auth";

interface MergeHistoryItem {
    task_id: string;
    created_at: string;
    videos: string[];
    audio: string | null;
    transition: string;
}

interface HistoryDialogProps {
    onClose: () => void;
}

const PAGE_SIZE = 20;

type LoadMode = "initial" | "append";

export default function HistoryDialog({ onClose }: HistoryDialogProps) {
    const [history, setHistory] = useState<MergeHistoryItem[]>([]);
    const [offset, setOffset] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadHistory = useCallback(
					async (nextOffset: number, mode: LoadMode) => {
						if (mode === "initial") {
							setLoading(true);
						} else {
							setLoadingMore(true);
						}
						setError(null);

						try {
							const response = await fetch(
								`${API_BASE_URL}/api/video/history?limit=${PAGE_SIZE}&offset=${nextOffset}`,
								{
									headers: buildAuthHeaders(),
								},
							);

							if (!response.ok) {
								if (response.status === 401) {
									setError("You must be signed in to view your merge history.");
								} else {
									let detail = "Failed to fetch merge history.";
									try {
										const errorData = await response.json();
										detail = errorData?.detail ?? errorData?.message ?? detail;
									} catch {}
									setError(detail);
								}
								if (mode === "initial") {
									setHistory([]);
								}
								setHasMore(false);
								return;
							}

							const data: MergeHistoryItem[] = await response.json();
							setHistory((current) =>
								mode === "initial" ? data : [...current, ...data],
							);
							setOffset(nextOffset + data.length);
							setHasMore(data.length === PAGE_SIZE);
						} catch (requestError) {
							console.error("Failed to load merge history", requestError);
							setError("A network error occurred while fetching history.");
							if (mode === "initial") {
								setHistory([]);
							}
							setHasMore(false);
						} finally {
							if (mode === "initial") {
								setLoading(false);
							} else {
								setLoadingMore(false);
							}
						}
					},
					[],
				);

				useEffect(() => {
					void loadHistory(0, "initial");
				}, [loadHistory]);

    const handleLoadMore = () => {
        void loadHistory(offset, "append");
    };

    const formatTimestamp = (value: string) => {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    const renderHistory = () => {
        if (loading) {
            return (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading history...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-12">
                    <p className="text-red-600">{error}</p>
                </div>
            );
        }

        if (history.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="text-4xl mb-4">:)</div>
                    <p className="text-gray-600">No merge history yet</p>
                    <p className="text-gray-500 text-sm">Your completed merges will appear here once available.</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {history.map((item) => (
                    <div key={item.task_id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="font-semibold text-gray-800">Transition: {item.transition}</h3>
                                <p className="text-sm text-gray-500">{formatTimestamp(item.created_at)}</p>
                            </div>
                            <span className="text-xs font-mono text-gray-400">#{item.task_id}</span>
                        </div>

                        <div className="mt-4 space-y-3 text-sm text-gray-600">
                            <div>
                                <span className="font-medium text-gray-700">Videos ({item.videos.length}):</span>
                                <ul className="mt-2 list-disc list-inside text-gray-600">
                                    {item.videos.map((video) => (
                                        <li key={`${item.task_id}-${video}`}>{video}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">Audio:</span>
                                <span>{item.audio ?? "None"}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {hasMore && (
                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="px-4 py-2 rounded-lg border border-purple-300 text-purple-600 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loadingMore ? "Loading..." : "Load more"}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Merge History</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        Close
                    </button>
                </div>

                {renderHistory()}
            </div>
        </div>
    );
}


