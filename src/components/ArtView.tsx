import type { GalleryItem } from "../types/gallery";

export function ArtView({ data }: { data: GalleryItem }) {
  return (
    <div className="relative flex flex-col h-full bg-white overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <img
          src={data.imageSrc}
          alt={data.imageAlt}
          className="w-full h-full object-cover"
        />
        {/* Glass Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/80 via-white/50 to-transparent backdrop-blur-md" />
      </div>
      
      {/* Content over glass */}
      <div className="relative z-10 p-6 flex flex-col gap-2 flex-1 justify-end h-full">
        <h2 className="text-4xl font-black tracking-tighter text-black uppercase mb-3 drop-shadow-sm">
          {data.title}
        </h2>
        {data.quote && (
          <p className="text-black text-[15px] leading-relaxed">
            {data.quote}
          </p>
        )}
      </div>
    </div>
  );
}
