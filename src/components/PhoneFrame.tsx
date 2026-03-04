import type { ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Battery,
  CornerUpLeft,
  Menu,
  Signal,
} from "lucide-react";

export function PhoneFrame({
  children,
  side,
}: {
  children: ReactNode;
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

            <div className="flex-1 overflow-y-auto bg-white">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
