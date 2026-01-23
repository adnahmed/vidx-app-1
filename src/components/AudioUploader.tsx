import { useRef } from 'react';
import { FaMusic, FaTimes, FaUpload } from 'react-icons/fa';

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
                    className="w-full border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-pink-500 hover:bg-pink-50/30 transition-all cursor-pointer group bg-slate-50/50"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="w-12 h-12 mx-auto bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FaUpload className="w-6 h-6" />
                    </div>
                    <p className="text-slate-700 font-medium mb-1">Drop audio file here or click to select</p>
                    <p className="text-sm text-slate-500">Optional background audio</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
            ) : (
                <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center">
                            <FaMusic className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="font-medium text-slate-700">{selectedAudio.name}</div>
                            <div className="text-xs text-slate-500">
                                {(selectedAudio.size / (1024 * 1024)).toFixed(1)} MB
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={removeAudio}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <FaTimes className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}