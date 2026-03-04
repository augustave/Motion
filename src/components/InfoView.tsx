import type { GalleryItem } from "../types/gallery";

export function InfoView({ data }: { data: GalleryItem }) {
  return (
    <div className="relative flex flex-col h-full bg-white overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <img
          src={data.imageSrc}
          alt={data.imageAlt}
          className="w-full h-full object-cover"
        />
        {/* Glass Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-white/60 backdrop-blur-lg border-t border-white/40 shadow-xl" />
      </div>
      
      {/* Content over glass */}
      <div className="relative z-10 p-6 flex-1 flex flex-col justify-end pb-4">
        <h2 className="text-3xl font-black tracking-tighter text-black uppercase mb-3 drop-shadow-sm">
          {data.title}
        </h2>
        <p className="text-black text-[15px] leading-relaxed">
          {data.quote}
        </p>
      </div>
    </div>
  );
}
