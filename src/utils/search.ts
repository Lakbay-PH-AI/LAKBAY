import type { PromptBuilderState, Recommendation } from "../types/travel";

export function buildTravelPrompt(state: PromptBuilderState) {
  return [
    `Create a ${state.promptType} for travel only within the Philippines.`,
    `Destination: ${state.destination}.`,
    `Dates: ${state.dateRange}. Travelers: ${state.travelers} (${state.adults} adults, ${state.kids} kids).`,
    `Budget: ${state.budget}. Trip type: ${state.tripType}. Hotel level: ${state.hotelLevel}.`,
    `Transport preference: ${state.transportPreference}. Pace: ${state.pace}.`,
    `Must-see places: ${state.mustSee || "recommend based on destination fit"}.`,
    `Accessibility needs: ${state.accessibility || "none specified"}. Food preferences: ${state.food || "local favorites and safe options"}.`,
    `Include Klook options: ${state.includeKlook ? "yes" : "no"}. Include discount code research: ${state.includeDiscounts ? "yes, but never invent codes" : "no"}.`,
    `Optimize for: ${state.optimizeFor}.`,
    "Return structured sections for itinerary, hotels, transport, tickets, Klook options, discount opportunities, risk notes, source links, and verification labels.",
    "Do not fabricate live availability, exact prices, official tickets, or valid promo codes without a connected source."
  ].join("\n");
}

export function filterRecommendations(items: Recommendation[], query: string, category: string) {
  const normalized = query.trim().toLowerCase();
  return items.filter((item) => {
    const matchesCategory = category === "all" || item.category === category;
    const matchesQuery =
      !normalized ||
      [item.title, item.destination, item.summary, item.meta, item.price].some((value) => value.toLowerCase().includes(normalized));
    return matchesCategory && matchesQuery;
  });
}

export function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(value);
  }

  return Promise.reject(new Error("Clipboard API is unavailable in this browser."));
}
