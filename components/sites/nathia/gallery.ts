// Opening the gallery lightbox at an image: a window event the scene's <GalleryLightbox> listens for (as
// explorer.ts). The grid's buttons are plain server-rendered [data-gallery-open] buttons; the lightbox opens
// them through one delegated click listener.

export const GALLERY_EVENT = "nathia:gallery";

export interface GalleryRequest {
  index: number;
  /** The control that opened it; focus returns there on close. */
  trigger: HTMLElement | null;
}

export function openGallery(index: number, trigger: HTMLElement | null) {
  window.dispatchEvent(new CustomEvent<GalleryRequest>(GALLERY_EVENT, { detail: { index, trigger } }));
}
