import { useRef } from 'react';

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
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="text-4xl mb-4">📹</div>
                <p className="text-gray-600 mb-2">Drop video files here or click to select</p>
                <p className="text-sm text-gray-500">
                    {selectedVideos.length}/{maxVideos} videos uploaded
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>

            {selectedVideos.length > 0 && (
                <div className="space-y-2">
                    {selectedVideos.map((video, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">🎬</div>
                                <div>
                                    <div className="font-medium text-gray-800">{video.name}</div>
                                    <div className="text-sm text-gray-500">
                                        {(video.size / (1024 * 1024)).toFixed(1)} MB
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => removeVideo(index)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}