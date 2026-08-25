import PageShell from "@/components/PageShell";
import PhotoGrid from "@/components/PhotoGrid";
import { getPhotos } from "@/lib/unsplash";

export const metadata = {
  title: "Photography",
  description: "A selection of photographs, with the settings behind each one.",
};

/** Rebuild the page at most once an hour; see lib/unsplash.js for why the two
 *  underlying fetches cache on different clocks. */
export const revalidate = 3600;

export default async function PhotographyPage() {
  const { photos, error } = await getPhotos();

  return (
    <PageShell
      wide
      kicker="Photography"
      title="Frames"
      lede="Mostly available light, mostly wide open. Hover a frame for the settings behind it — for anyone who cares, and I know you do."
    >
      {error ? (
        <p className="font-mono text-sm text-muted">{error}</p>
      ) : (
        <PhotoGrid photos={photos} />
      )}
    </PageShell>
  );
}
