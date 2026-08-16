import PageShell from "@/components/PageShell";
import PhotoFrame from "@/components/PhotoFrame";
import { photos } from "@/data/photos";

export const metadata = {
  title: "Photography",
  description: "A selection of photographs, with the settings behind each one.",
};

export default function PhotographyPage() {
  return (
    <PageShell
      wide
      kicker="Photography"
      title="Frames"
      lede="Mostly available light, mostly wide open. Settings under each frame for anyone who cares — and I know you do."
    >
      {/* CSS columns rather than grid: the set mixes portrait and landscape,
          and masonry keeps them at their true aspect ratios without cropping. */}
      <div className="columns-1 gap-4 sm:columns-2 sm:gap-5 lg:columns-3">
        {photos.map((photo, i) => (
          <PhotoFrame key={photo.src + i} photo={photo} priority={i < 2} />
        ))}
      </div>
    </PageShell>
  );
}
