import { useState } from 'react';
import AudioUploader from './AudioUploader';
import HistoryDialog from './HistoryDialog';
import MergeResult from './MergeResult';
import TransitionSelector from './TransitionSelector';
import UpgradeDialog from './UpgradeDialog';
import VideoUploader from './VideoUploader';

interface DashboardProps {
    userEmail: string;
    planMaxVideos: number;
    onLogout: () => void;
}

export default function Dashboard({ userEmail, planMaxVideos, onLogout }: DashboardProps) {
    const [selectedTransition, setSelectedTransition] = useState<string>('');
    const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
    const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
    const [showHistoryDialog, setShowHistoryDialog] = useState(false);
    const [mergeStatus, setMergeStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
    const [resultVideoUrl, setResultVideoUrl] = useState<string>('');

    const handleMerge = async () => {
        if (!selectedTransition || selectedVideos.length === 0) {
            alert('Please select a transition and at least one video');
            return;
        }

        setIsProcessing(true);
        setMergeStatus('processing');

        try {
            const formData = new FormData();
            formData.append('transition', selectedTransition);
            selectedVideos.forEach((video, index) => {
                formData.append(`video_${index}`, video);
            });
            if (selectedAudio) {
                formData.append('audio', selectedAudio);
            }

            const response = await fetch('/api/merge', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                pollMergeStatus(data.jobId);
            } else {
                throw new Error('Merge request failed');
            }
        } catch (error) {
            console.error('Merge failed:', error);
            setMergeStatus('failed');
            setIsProcessing(false);
        }
    };

    const pollMergeStatus = async (jobId: string) => {
        const poll = async () => {
            try {
                const response = await fetch(`/api/merge/status/${jobId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();

                    if (data.status === 'SUCCESS') {
                        setMergeStatus('success');
                        setIsProcessing(false);
                        fetchResultVideo(jobId);
                    } else if (data.status === 'FAILED') {
                        setMergeStatus('failed');
                        setIsProcessing(false);
                    } else {
                        setTimeout(poll, 2000); // Poll every 2 seconds
                    }
                }
            } catch (error) {
                console.error('Status polling failed:', error);
                setMergeStatus('failed');
                setIsProcessing(false);
            }
        };

        poll();
    };

    const fetchResultVideo = async (jobId: string) => {
        try {
            const response = await fetch(`/api/merge/result/${jobId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setResultVideoUrl(url);
            }
        } catch (error) {
            console.error('Failed to fetch result video:', error);
        }
    };

    const resetMerge = () => {
        setMergeStatus('idle');
        setResultVideoUrl('');
        setSelectedTransition('');
        setSelectedVideos([]);
        setSelectedAudio(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
            {/* Header */}
            <header className="flex justify-between items-center p-6 bg-white shadow-sm">
                <h1 className="text-2xl font-bold text-gray-800">Video Merger Dashboard</h1>
                <div className="flex items-center gap-4">
                    <span className="text-gray-600">Welcome, {userEmail}</span>
                    <button
                        onClick={() => setShowHistoryDialog(true)}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                    >
                        History
                    </button>
                    <button
                        onClick={() => setShowUpgradeDialog(true)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                    >
                        Upgrade
                    </button>
                    <button
                        onClick={onLogout}
                        className="px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="p-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Panels */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Transition Selection */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Select Transition</h2>
                            <TransitionSelector
                                selectedTransition={selectedTransition}
                                onSelect={setSelectedTransition}
                            />
                        </div>

                        {/* Video Upload */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">
                                Upload Videos (Max: {planMaxVideos})
                            </h2>
                            <VideoUploader
                                selectedVideos={selectedVideos}
                                onVideosChange={setSelectedVideos}
                                maxVideos={planMaxVideos}
                            />
                        </div>

                        {/* Audio Upload */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">
                                Background Audio (Optional)
                            </h2>
                            <AudioUploader
                                selectedAudio={selectedAudio}
                                onAudioChange={setSelectedAudio}
                            />
                        </div>

                        {/* Merge Button */}
                        <button
                            onClick={handleMerge}
                            disabled={isProcessing || !selectedTransition || selectedVideos.length === 0}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {isProcessing ? 'Processing...' : 'Merge Videos'}
                        </button>
                    </div>

                    {/* Right Panel - Result */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Result</h2>
                            <MergeResult
                                status={mergeStatus}
                                videoUrl={resultVideoUrl}
                                onReset={resetMerge}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            {showUpgradeDialog && (
                <UpgradeDialog onClose={() => setShowUpgradeDialog(false)} />
            )}
            {showHistoryDialog && (
                <HistoryDialog onClose={() => setShowHistoryDialog(false)} />
            )}
        </div>
    );
}