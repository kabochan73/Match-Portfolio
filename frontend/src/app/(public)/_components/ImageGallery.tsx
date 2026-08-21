"use client";

// CC。表示中の画像インデックスを保持する必要があるため、page.tsx(SC)から切り出したアイランド
import { useState } from "react";

type JobPostingImage = {
  id: number;
  url: string;
};

export function ImageGallery({ images }: { images: JobPostingImage[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) {
    return null;
  }

  const goToPrev = () => {
    setCurrentIndex((index) => (index === 0 ? images.length - 1 : index - 1));
  };

  const goToNext = () => {
    setCurrentIndex((index) => (index === images.length - 1 ? 0 : index + 1));
  };

  return (
    <div className="pb-6">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element -- 外部(Laravelのpublic disk)から配信される画像なのでnext/imageの最適化対象外 */}
        <img
          src={images[currentIndex].url}
          alt=""
          className="h-120 w-full border border-zinc-200 bg-zinc-50 object-cover"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrev}
              aria-label="前の画像"
              className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/90 p-2 text-zinc-700 shadow transition hover:bg-white"
            >
              ←
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="次の画像"
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/90 p-2 text-zinc-700 shadow transition hover:bg-white"
            >
              →
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`${index + 1}枚目の画像を表示`}
              className={`h-2 w-2 rounded-full transition ${
                index === currentIndex ? "bg-brand" : "bg-zinc-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
