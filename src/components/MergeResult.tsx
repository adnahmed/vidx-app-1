interface MergeResultProps {
    status: 'idle' | 'processing' | 'success' | 'failed';
    videoUrl: string;
    onReset: () => void;
}

export default function MergeResult({ status, videoUrl, onReset }: MergeResultProps) {
    if (status === 'idle') {
        return (
            <div className="text-center text-gray-500 py-12">
                <div className="text-4xl mb-4">🎬</div>
                <p>Select transition and videos to start merging</p>
            </div>
        );
    }

    if (status === 'processing') {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Processing...</p>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="text-center py-12">
                <div className="text-4xl mb-4 text-red-500">❌</div>
                <p className="text-red-600 mb-4">Merge failed</p>
                <button
                    onClick={onReset}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="text-center py-8">
                <div className="text-4xl mb-4 text-green-500">✅</div>
                <p className="text-green-600 mb-4">Merge successful!</p>
                {videoUrl && (
                    <div className="mb-4">
                        <video
                            className="w-full rounded-lg mb-4"
                            controls
                            src={videoUrl}
                        />
                        <div className="flex gap-2">
                            <a
                                href={videoUrl}
                                download="merged-video.mp4"
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
                            >
                                Download
                            </a>
                            <button
                                onClick={onReset}
                                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                New Merge
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return null;
}