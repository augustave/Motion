import { useEffect, useMemo, useState } from "react";
import { ArtView } from "./components/ArtView";
import { InfoView } from "./components/InfoView";
import { PhoneFrame } from "./components/PhoneFrame";
import { galleryData } from "./data/galleryData";
import type { GalleryItem } from "./types/gallery";

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mouseOffset, setMouseOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoaded(true), 150);
    return () => window.clearTimeout(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;

    setMouseOffset({
      x: x * 10,
      y: y * -10,
    });
  };

  const leftPhoneStyle = useMemo<React.CSSProperties>(
    () => ({
      transform: `perspective(1500px) rotateY(${25 + mouseOffset.x}deg) rotateX(${15 + mouseOffset.y}deg) rotateZ(-5deg)`,
      transformStyle: "preserve-3d",
      transition: "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    }),
    [mouseOffset]
  );

  const rightPhoneStyle = useMemo<React.CSSProperties>(
    () => ({
      transform: `perspective(1500px) rotateY(${-25 + mouseOffset.x}deg) rotateX(${15 + mouseOffset.y}deg) rotateZ(5deg)`,
      transformStyle: "preserve-3d",
      transition: "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    }),
    [mouseOffset]
  );

  return (
    <div
      className="min-h-screen bg-black flex flex-col xl:flex-row items-center justify-center p-4 sm:p-8 gap-12 xl:gap-24 font-sans overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMouseOffset({ x: 0, y: 0 })}
    >
      <div
        className={`scale-[0.65] sm:scale-75 md:scale-90 xl:scale-100 transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] -mt-24 xl:-mt-12 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-32"
        }`}
      >
        <div style={leftPhoneStyle} className="relative">
          <PhoneFrame side="left">
            <ArtView data={galleryData[0]} />
          </PhoneFrame>
        </div>
      </div>

      <div
        className={`scale-[0.65] sm:scale-75 md:scale-90 xl:scale-100 transition-all duration-1000 delay-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] -mt-32 xl:mt-12 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-32"
        }`}
      >
        <div style={rightPhoneStyle} className="relative">
          <PhoneFrame side="right">
            <InfoView data={galleryData[1]} />
          </PhoneFrame>
        </div>
      </div>
    </div>
  );
}
