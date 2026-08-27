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
      title="Photos"
      lede={[
        "Shot mainly on a Sony a7 IV + 24-105mm f/4, 35mm f/1.8, 20mm f/1.8, 70-200mm f/2.8, and a Helios 44m-4.",
        "Click any photo to view it full screen.",
      ]}
    >
      {error ? (
        <p className="font-mono text-sm text-muted">{error}</p>
      ) : (
        <PhotoGrid photos={photos} />
      )}
    </PageShell>
  );
}
