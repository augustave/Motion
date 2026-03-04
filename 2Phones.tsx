"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CornerUpLeft,
  ArrowLeft,
  ArrowRight,
  Menu,
  Battery,
  Signal,
} from "lucide-react";

type GalleryArtItem = {
  id: string;
  type: "art";
  gradientTop: string;
  gradientBottom: string;
};

type GalleryInfoItem = {
  id: string;
  type: "info";
  title: string;
  gradientImage: string;
  description: string;
};

type GalleryItem = GalleryArtItem | GalleryInfoItem;

const galleryData: GalleryItem[] = [
  {
    id: "art-1",
    type: "art",
    gradientTop: "from-indigo-500 via-purple-500 to-pink-500",
    gradientBottom: "from-cyan-400 via-blue-500 to-indigo-600",
  },
  {
    id: "info-1",
    type: "info",
    title: "Kunsthalle\nGöppingen, 2019",
    gradientImage: "from-emerald-400 via-teal-500 to-cyan-500",
    description:
      "The dimensions of about 24×13 meters are impressive. The floor drawing takes up almost the entire upper level of the Kunsthalle. For those entering, there remains a relatively narrow residual space of, at its widest point, about two meters, allowing them to circumnavigate the work. At their feet, Bastian Muhr has placed an oversized, linear net of 60 slender lines slanting in opposite directions.",
  },
];

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
      transform: `perspective(1500px) rotateY(${25 + mouseOffset.x}deg) rotateX(${
        15 + mouseOffset.y
      }deg) rotateZ(-5deg)`,
      transformStyle: "preserve-3d",
      transition: "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    }),
    [mouseOffset]
  );

  const rightPhoneStyle = useMemo<React.CSSProperties>(
    () => ({
      transform: `perspective(1500px) rotateY(${-25 + mouseOffset.x}deg) rotateX(${
        15 + mouseOffset.y
      }deg) rotateZ(5deg)`,
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
      <style>
        {`
          @keyframes gradient-xy {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient-xy 6s ease infinite;
          }
        `}
      </style>

      <div
        className={`scale-[0.65] sm:scale-75 md:scale-90 xl:scale-100 transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] -mt-24 xl:-mt-12
        ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-32"}`}
      >
        <div style={leftPhoneStyle} className="relative">
          <PhoneFrame side="left">
            <ArtView data={galleryData[0] as GalleryArtItem} />
          </PhoneFrame>
        </div>
      </div>

      <div
        className={`scale-[0.65] sm:scale-75 md:scale-90 xl:scale-100 transition-all duration-1000 delay-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] -mt-32 xl:mt-12
        ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-32"}`}
      >
        <div style={rightPhoneStyle} className="relative">
          <PhoneFrame side="right">
            <InfoView data={galleryData[1] as GalleryInfoItem} />
          </PhoneFrame>
        </div>
      </div>
    </div>
  );
}

function PhoneFrame({
  children,
  side,
}: {
  children: React.ReactNode;
  side: "left" | "right";
}) {
  return (
    <div className="relative">
      {side === "left" && (
        <div
          className="absolute top-[200px] -right-[5px] w-[5px] h-[80px] bg-gradient-to-r from-neutral-600 to-neutral-800 rounded-r-lg shadow-md"
          style={{ transform: "translateZ(-1px)" }}
        />
      )}
      {side === "right" && (
        <>
          <div
            className="absolute top-[120px] -left-[5px] w-[5px] h-[30px] bg-gradient-to-l from-neutral-600 to-neutral-800 rounded-l-lg shadow-md"
            style={{ transform: "translateZ(-1px)" }}
          />
          <div
            className="absolute top-[180px] -left-[5px] w-[5px] h-[65px] bg-gradient-to-l from-neutral-600 to-neutral-800 rounded-l-lg shadow-md"
            style={{ transform: "translateZ(-1px)" }}
          />
          <div
            className="absolute top-[260px] -left-[5px] w-[5px] h-[65px] bg-gradient-to-l from-neutral-600 to-neutral-800 rounded-l-lg shadow-md"
            style={{ transform: "translateZ(-1px)" }}
          />
        </>
      )}

      <div
        className={`p-[4px] rounded-[3.5rem] shadow-[0_25px_50px_-12px_rgba(255,255,255,0.05)] ${
          side === "left"
            ? "bg-gradient-to-br from-neutral-300 via-neutral-700 to-neutral-900"
            : "bg-gradient-to-bl from-neutral-300 via-neutral-700 to-neutral-900"
        }`}
      >
        <div className="p-[10px] rounded-[3.3rem] bg-black">
          <div className="relative w-[390px] h-[844px] bg-white rounded-[2.8rem] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center px-6 pt-4 pb-2 text-black text-xs font-semibold z-20">
              <span>11:32</span>
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-8 bg-black rounded-full" />
              <div className="flex items-center gap-1.5">
                {/* Stroke-first: avoid fill-current to prevent “weird filled” look */}
                <Signal size={14} strokeWidth={2} className="stroke-current" />
                <span className="text-[10px]">5G</span>
                <Battery size={16} strokeWidth={2} className="stroke-current" />
              </div>
            </div>

            <div className="px-4 pb-2 pt-2">
              <h1 className="text-[34px] font-bold tracking-tighter leading-none text-black">
                GALAXY WAVE
              </h1>
            </div>

            <div className="border-t-[3px] border-b-[3px] border-black flex justify-between items-center px-4 py-2 bg-white z-10">
              <button
                aria-label="Back"
                className="text-neutral-400 hover:text-black transition-colors"
              >
                <CornerUpLeft size={28} strokeWidth={2.5} />
              </button>

              <div className="flex items-center gap-4">
                <div className="flex items-center border-[1.5px] border-neutral-300 rounded px-1 py-0.5 gap-1">
                  <button
                    aria-label="Previous"
                    className="text-neutral-500 hover:text-black transition-colors"
                  >
                    <ArrowLeft size={22} strokeWidth={2} />
                  </button>
                  <button
                    aria-label="Next"
                    className="text-neutral-500 hover:text-black transition-colors"
                  >
                    <ArrowRight size={22} strokeWidth={2} />
                  </button>
                </div>
                <button
                  aria-label="Menu"
                  className="text-neutral-400 hover:text-black transition-colors"
                >
                  <Menu size={28} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArtView({ data }: { data: GalleryArtItem }) {
  return (
    <div className="p-4 flex flex-col gap-4">
      <div
        className={`w-full h-[450px] rounded-3xl animate-gradient bg-gradient-to-br ${data.gradientTop} shadow-inner`}
      />
      <div
        className={`w-full h-[300px] rounded-t-3xl animate-gradient bg-gradient-to-tr ${data.gradientBottom} shadow-inner`}
      />
    </div>
  );
}

function InfoView({ data }: { data: GalleryInfoItem }) {
  return (
    <div className="p-4 flex flex-col">
      <h2 className="text-3xl font-bold tracking-tight leading-none mb-4 text-black text-center whitespace-pre-line">
        {data.title}
      </h2>

      <div
        className={`w-full h-[320px] rounded-sm animate-gradient bg-gradient-to-r ${data.gradientImage} mb-6 shadow-sm`}
      />

      <p className="text-black text-[17px] leading-tight font-medium italic text-justify tracking-tight px-1 pb-8">
        {data.description}
      </p>
    </div>
  );
}