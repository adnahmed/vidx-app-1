import { useEffect, useState } from 'react';

interface HistoryItem {
    id: string;
    createdAt: string;
    transition: string;
    videoCount: number;
    hasAudio: boolean;
    status: 'success' | 'failed' | 'processing';
    downloadUrl?: string;
}

interface HistoryDialogProps {
    onClose: () => void;
}

export default function HistoryDialog({ onClose }: HistoryDialogProps) {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await fetch('/api/history', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setHistory(data.history);
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success':
                return 'text-green-600 bg-green-100';
            case 'failed':
                return 'text-red-600 bg-red-100';
            case 'processing':
                return 'text-yellow-600 bg-yellow-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return '✅';
            case 'failed':
                return '❌';
            case 'processing':
                return '⏳';
            default:
                return '❓';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Merge History</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ✕
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading history...</p>
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-4">📹</div>
                        <p className="text-gray-600">No merge history yet</p>
                        <p className="text-gray-500 text-sm">Your completed merges will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {history.map((item) => (
                            <div key={item.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{getStatusIcon(item.status)}</span>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">
                                                {item.transition} Transition
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {new Date(item.createdAt).toLocaleDateString()} at{' '}
                                                {new Date(item.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <span>🎬</span>
                                        <span>{item.videoCount} videos</span>
                                    </div>
                                    {item.hasAudio && (
                                        <div className="flex items-center gap-1">
                                            <span>🎵</span>
                                            <span>Audio included</span>
                                        </div>
                                    )}
                                </div>

                                {item.status === 'success' && item.downloadUrl && (
                                    <div className="flex gap-2">
                                        <a
                                            href={item.downloadUrl}
                                            download
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                        >
                                            Download
                                        </a>
                                        <button
                                            onClick={() => window.open(item.downloadUrl, '_blank')}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                        >
                                            Preview
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}