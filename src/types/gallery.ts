export type PhoneSide = "left" | "right";
export type ScreenLayout = "art" | "info";

export type GalleryItem = {
  id: string;
  phoneSide: PhoneSide;
  layout: ScreenLayout;
  title: string;
  subtitle?: string;
  imageSrc: string;
  imageAlt: string;
  quote?: string;
  author?: string;
  work?: string;
};
