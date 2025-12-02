import React from 'react';

interface YouTubeEmbedProps {
    url: string;
    title?: string;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ url, title }) => {
    // Extract video ID from YouTube URL
    const getVideoId = (url: string): string | null => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getVideoId(url);

    if (!videoId) {
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors"
            >
                <div className="flex items-center gap-2 text-blue-400">
                    <span>🎥</span>
                    <span className="text-sm font-medium">Assistir Vídeo no YouTube</span>
                    <span className="text-xs text-slate-500">↗</span>
                </div>
            </a>
        );
    }

    return (
        <div className="relative w-full rounded-xl overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
            <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={title || 'Exercise Video'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
};

export default YouTubeEmbed;
