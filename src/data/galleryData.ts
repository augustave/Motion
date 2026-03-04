import type { GalleryItem } from "../types/gallery";

export const galleryData: GalleryItem[] = [
  {
    id: "whisk-1",
    phoneSide: "left",
    layout: "art",
    title: "The Technology",
    imageSrc: "/images/left-art.jpg",
    imageAlt: "ChipAgents Art representation",
    quote: "ChipAgents does not just write code; it deploys specialized agents like the Waveform Agent. When a simulation fails, this agent analyzes the gigabytes of waveform data (visual traces of signals) to determine causality. It might identify that \"Signal A went high, which blocked the arbiter, causing a deadlock on the bus,\" and then generate a natural language explanation and a fix.3",
  },
  {
    id: "whisk-2",
    phoneSide: "right",
    layout: "info",
    title: "Auto-Refactoring",
    imageSrc: "/images/right-gallery.jpg",
    imageAlt: "Auto-Refactoring visual representation",
    quote: "The platform allows for semantic refactoring of hardware codebases e.g., \"Update the AXI interface across all modules to support 64-bit addressing\" a task that is perilous with standard text-search tools.3",
  },
];
