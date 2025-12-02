
import React from 'react';
import YouTubeEmbed from './YouTubeEmbed';

interface MarkdownViewProps {
  content: string;
}

const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  const parseInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const extractYouTubeUrl = (text: string): string | null => {
    const youtubeRegex = /https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
    const match = text.match(youtubeRegex);
    return match ? match[0] : null;
  };

  const renderContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        i++;
        continue;
      }

      // H1 - Main Title
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="text-3xl font-extrabold text-white mt-8 mb-4 tracking-tight border-b border-white/10 pb-4">
            {parseInline(line.substring(2))}
          </h1>
        );
        i++; continue;
      }

      // H2 - Section Title
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-xl font-bold text-blue-400 mt-10 mb-4 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {parseInline(line.substring(3))}
          </h2>
        );
        i++; continue;
      }

      // H3 - Exercise Card (Modified logic to capture following list as card content)
      if (line.startsWith('### ')) {
        const title = line.substring(4);
        const cardContent: React.ReactNode[] = [];
        let videoUrl: string | null = null;
        i++; // Move to next line to capture details

        // Capture list items that belong to this card
        while (i < lines.length) {
          const nextLine = lines[i].trim();
          if (nextLine.startsWith('#') || nextLine.startsWith('---')) break; // End of card if new header or separator

          // Check for YouTube URL in the line
          const youtubeUrl = extractYouTubeUrl(nextLine);
          if (youtubeUrl) {
            videoUrl = youtubeUrl;
            i++;
            continue;
          }

          if (nextLine.startsWith('* ') || nextLine.startsWith('- ')) {
            const content = nextLine.substring(2);
            cardContent.push(
              <li key={`li-${i}`} className="flex items-start gap-2 text-sm md:text-base text-slate-300">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-500 shrink-0"></span>
                <span>{parseInline(content)}</span>
              </li>
            );
          } else if (nextLine.length > 0) {
            cardContent.push(<p key={`p-${i}`} className="text-sm text-slate-400 mt-2">{parseInline(nextLine)}</p>);
          }
          i++;
        }

        elements.push(
          <div key={`card-${i}`} className="bg-white/5 border border-white/5 rounded-2xl p-5 mb-4 hover:bg-white/10 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-white">{parseInline(title)}</h3>
            </div>
            <ul className="space-y-2">
              {cardContent}
            </ul>
            {videoUrl && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">🎥 Vídeo Demonstrativo:</h4>
                <YouTubeEmbed url={videoUrl} title={title} />
              </div>
            )}
          </div>
        );
        // Don't increment i here, loop already did
        continue;
      }

      // Separator
      if (trimmed === '---' || trimmed === '***') {
        elements.push(<div key={i} className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-8" />);
        i++; continue;
      }

      // Standard Lists (not inside a card)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const listItems: string[] = [];
        while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
          listItems.push(lines[i].trim().substring(2));
          i++;
        }
        elements.push(
          <ul key={i} className="list-none space-y-2 mb-6">
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-300">
                <span className="text-blue-500 mt-1">✓</span>
                {parseInline(item)}
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // Default Paragraph
      elements.push(<p key={i} className="text-slate-300 leading-relaxed mb-4">{parseInline(line)}</p>);
      i++;
    }

    return elements;
  };

  return (
    <div className="bg-[#1c1c1e] p-6 md:p-8 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden">
      {/* Subtle top gradient */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />

      <div className="font-sans">
        {renderContent(content)}
      </div>
    </div>
  );
};

export default MarkdownView;
