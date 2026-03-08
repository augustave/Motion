import type { PortfolioItem } from "../types/gallery";

export function ArtView({ data }: { data: PortfolioItem }) {
  return (
    <div className="relative flex flex-col h-full bg-zinc-950 overflow-hidden">
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
        <img
          src={data.leftImageSrc}
          alt={data.leftImageAlt}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content over glass */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-6 pt-16 flex flex-col gap-2 bg-gradient-to-t from-white/95 via-white/70 to-transparent backdrop-blur-md pointer-events-none text-left">
        <h2 className="text-4xl font-black tracking-tighter text-black uppercase mb-3 drop-shadow-sm">
          {data.projectTitle}
        </h2>
      </div>
    </div>
  );
}
