import { useRef } from 'react';

interface AudioUploaderProps {
    selectedAudio: File | null;
    onAudioChange: (audio: File | null) => void;
}

export default function AudioUploader({ selectedAudio, onAudioChange }: AudioUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('audio/')) {
            onAudioChange(file);
        }
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith('audio/')) {
            onAudioChange(file);
        }
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
    };

    const removeAudio = () => {
        onAudioChange(null);
    };

    return (
        <div className="space-y-4">
            {!selectedAudio ? (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="text-4xl mb-4">🎵</div>
                    <p className="text-gray-600 mb-2">Drop audio file here or click to select</p>
                    <p className="text-sm text-gray-500">Optional background audio</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
            ) : (
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="text-2xl">🎵</div>
                        <div>
                            <div className="font-medium text-gray-800">{selectedAudio.name}</div>
                            <div className="text-sm text-gray-500">
                                {(selectedAudio.size / (1024 * 1024)).toFixed(1)} MB
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={removeAudio}
                        className="text-red-500 hover:text-red-700 transition-colors"
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}