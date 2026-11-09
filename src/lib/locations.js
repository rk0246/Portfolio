/**
 * Short, chip-sized labels for Unsplash location names.
 *
 * Only what the visitor sees changes — filtering still keys on the full
 * location, and the chips carry the full name in their title / aria-label.
 *
 * New locations fall back to the text before the first comma, with "National
 * Park" shortened to "NP". Add an entry to LABELS for a custom label.
 */
const LABELS = {
  "Busan, South Korea": "Busan",
  "Chicago, United States": "Chicago",
  "Glacier National Park, Montana, USA": "Glacier NP",
  "Grand Teton National Park, Wyoming, USA": "Grand Teton",
  "Huntington Beach, United States": "Huntington Beach",
  "Las Vegas, United States": "Las Vegas",
  "Los Angeles, United States": "Los Angeles",
  "Philadelphia, United States": "Philadelphia",
  "Pittsburgh, United States": "Pittsburgh",
  "Valley Forge, United States": "Valley Forge",
  "Washington, United States": "Washington",
  "Yellowstone National Park, United States": "Yellowstone",
};

export function displayLocation(full) {
  if (!full) return "";
  return LABELS[full] ?? full.split(",")[0].replace("National Park", "NP").trim();
}
