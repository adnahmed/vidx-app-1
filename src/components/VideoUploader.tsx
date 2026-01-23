import { useRef } from 'react';
import { FaUpload, FaTimes, FaFileVideo } from 'react-icons/fa';

interface VideoUploaderProps {
    selectedVideos: File[];
    onVideosChange: (videos: File[]) => void;
    maxVideos: number;
}

export default function VideoUploader({ selectedVideos, onVideosChange, maxVideos }: VideoUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        const videoFiles = files.filter(file => file.type.startsWith('video/'));

        if (selectedVideos.length + videoFiles.length > maxVideos) {
            alert(`You can only upload up to ${maxVideos} videos`);
            return;
        }

        onVideosChange([...selectedVideos, ...videoFiles]);
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);
        const videoFiles = files.filter(file => file.type.startsWith('video/'));

        if (selectedVideos.length + videoFiles.length > maxVideos) {
            alert(`You can only upload up to ${maxVideos} videos`);
            return;
        }

        onVideosChange([...selectedVideos, ...videoFiles]);
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
    };

    const removeVideo = (index: number) => {
        const newVideos = selectedVideos.filter((_, i) => i !== index);
        onVideosChange(newVideos);
    };

    return (
        <div className="space-y-4">
            <button
                type="button"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="w-full border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-purple-500 hover:bg-purple-50/30 transition-all cursor-pointer group bg-slate-50/50"
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="w-12 h-12 mx-auto bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FaUpload className="w-6 h-6" />
                </div>
                <p className="text-slate-700 font-medium mb-1">
                    Click to upload or drag and drop
                </p>
                <p className="text-sm text-slate-500 mb-4">
                    MP4, WebM, or MOV (max {maxVideos} files)
                </p>
                <p className="text-xs font-semibold text-purple-600 bg-purple-50 inline-block px-3 py-1 rounded-full border border-purple-100">
                    {selectedVideos.length} / {maxVideos} videos used
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </button>

            {selectedVideos.length > 0 && (
                <div className="space-y-2">
                    {selectedVideos.map((video, index) => (
                        <div
                            key={video.name + video.lastModified + video.size}
                            className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center text-slate-500">
                                    <FaFileVideo className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <div className="font-medium text-slate-700 truncate">
                                        {video.name}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {(video.size / (1024 * 1024)).toFixed(1)} MB
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeVideo(index);
                                }}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <FaTimes className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}