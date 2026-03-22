interface YoutubeEmbedProps {
  videoId: string;
  title: string;
  className?: string;
}

/**
 * Embed YouTube en mode privacy-enhanced (youtube-nocookie.com).
 * Ratio 16/9 responsive, sans JavaScript tiers jusqu'au clic.
 */
export function YoutubeEmbed({ videoId, title, className }: YoutubeEmbedProps) {
  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-2xl bg-[#000] ${className ?? ""}`}
    >
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
