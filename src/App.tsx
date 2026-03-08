import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ArtView } from "./components/ArtView";
import { InfoView } from "./components/InfoView";
import { PhoneFrame } from "./components/PhoneFrame";
import SlipcaseShelf from "./components/SlipcaseShelf";
import { portfolioData } from "./data/galleryData";

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
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

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % portfolioData.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + portfolioData.length) % portfolioData.length);
  };

  const getLeftPhoneStyle = (isActive: boolean): React.CSSProperties => ({
    transform: isActive 
      ? `perspective(1500px) rotateY(${25 + mouseOffset.x}deg) rotateX(${15 + mouseOffset.y}deg) rotateZ(-5deg)`
      : `perspective(1500px) rotateY(15deg) rotateX(5deg)`,
    transformStyle: "preserve-3d",
    transition: "all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)",
  });

  const getRightPhoneStyle = (isActive: boolean): React.CSSProperties => ({
    transform: isActive 
      ? `perspective(1500px) rotateY(${-25 + mouseOffset.x}deg) rotateX(${15 + mouseOffset.y}deg) rotateZ(5deg)`
      : `perspective(1500px) rotateY(-15deg) rotateX(5deg)`,
    transformStyle: "preserve-3d",
    transition: "all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)",
  });

  return (
    <div
      className="min-h-screen bg-black flex flex-col items-center justify-center font-sans overflow-hidden relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMouseOffset({ x: 0, y: 0 })}
    >
      {/* Navigation Overlay */}
      <div className={`absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 sm:px-12 z-[60] transition-opacity duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
        <button 
          onClick={prevSlide}
          className="p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/5 cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
        <button 
          onClick={nextSlide}
          className="p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/5 cursor-pointer"
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      </div>

      {/* Unified Carousel Track */}
      <div className="relative w-full h-full flex items-center justify-center">
        {portfolioData.map((item, index) => {
          const isActive = index === activeIndex;
          const isPrev = index === (activeIndex - 1 + portfolioData.length) % portfolioData.length;
          const isNext = index === (activeIndex + 1) % portfolioData.length;
          const isBookshelf = item.id === "3books";
          
          let translateX = "0%";
          let opacity = 0;
          let zIndex = 0;
          let pointerEvents: React.CSSProperties["pointerEvents"] = "none";
          let scale = 0.85;

          if (isActive) {
            translateX = "0%";
            opacity = 1;
            zIndex = 20;
            pointerEvents = "auto";
            scale = 1;
          } else if (isPrev) {
            translateX = "-30%";
            opacity = 0;
            zIndex = 10;
          } else if (isNext) {
            translateX = "30%";
            opacity = 0;
            zIndex = 10;
          }

          if (isBookshelf) {
            return (
              <div
                key={item.id}
                className="absolute inset-0 transition-opacity duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                style={{
                  opacity: isLoaded ? opacity : 0,
                  zIndex,
                  pointerEvents,
                  visibility: opacity > 0 ? "visible" : "hidden",
                }}
              >
                <SlipcaseShelf isActive={isActive} />
              </div>
            );
          }

          return (
            <div
              key={item.id}
              className="absolute inset-0 flex flex-col xl:flex-row items-center justify-center p-4 sm:p-8 gap-12 xl:gap-24 transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
              style={{
                transform: `translateX(${translateX}) scale(${scale})`,
                opacity: isLoaded ? opacity : 0,
                zIndex,
                pointerEvents,
              }}
            >
              <div className={`scale-[0.55] sm:scale-[0.65] md:scale-75 lg:scale-90 xl:scale-95 -mt-16 xl:-mt-8 transition-all duration-1000`}>
                <div style={getLeftPhoneStyle(isActive)} className="relative">
                  <PhoneFrame side="left">
                    <ArtView data={item} />
                  </PhoneFrame>
                </div>
              </div>

              <div className={`scale-[0.55] sm:scale-[0.65] md:scale-75 lg:scale-90 xl:scale-95 -mt-24 xl:mt-8 transition-all duration-1000 delay-100`}>
                <div style={getRightPhoneStyle(isActive)} className="relative">
                  <PhoneFrame side="right">
                    <InfoView data={item} />
                  </PhoneFrame>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Indicators Overlay */}
      <div className={`absolute bottom-8 sm:bottom-12 flex gap-3 z-[60] transition-opacity duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
        {portfolioData.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`cursor-pointer w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === activeIndex 
                ? "bg-white scale-125" 
                : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
