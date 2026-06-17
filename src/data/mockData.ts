import type { AIProviderConfig, Recommendation, WebhookConfig } from "../types/travel";

export const destinations = [
  "Manila",
  "Cebu",
  "Boracay",
  "Palawan",
  "El Nido",
  "Coron",
  "Bohol",
  "Siargao",
  "Davao",
  "Baguio",
  "Iloilo",
  "Dumaguete",
  "Bacolod",
  "Camiguin"
];

export const recommendations: Recommendation[] = [
  {
    id: "hotel-1",
    category: "hotel",
    title: "Henann Palm Beach Resort",
    destination: "Boracay",
    summary: "Beachfront Station 2 stay with strong walkability and family-friendly amenities.",
    price: "Estimated PHP 8,500-14,000/night",
    meta: "Resort · White Beach · breakfast options · refundable rates vary",
    idealFor: "Couples and families who want beachfront convenience",
    notes: ["Check exact cancellation terms before booking.", "Verify live room inventory on the source before purchase."],
    link: {
      label: "View Deal",
      url: "https://www.booking.com/searchresults.html?ss=Henann%20Palm%20Beach%20Resort%20Boracay",
      source: "Booking.com search",
      linkType: "manual",
      status: "estimated"
    }
  },
  {
    id: "hotel-2",
    category: "hotel",
    title: "Spin Designer Hostel",
    destination: "El Nido",
    summary: "Budget-friendly social hostel near town, helpful for island hopping pickup logistics.",
    price: "Estimated PHP 1,200-3,000/night",
    meta: "Hostel · El Nido town · Wi-Fi · backpacker-friendly",
    idealFor: "Solo travelers and budget pairs",
    notes: ["Ask about power backup and early breakfast for tour days.", "Verify rates and dates on the source before purchase."],
    link: {
      label: "Open Source",
      url: "https://www.agoda.com/search?city=18218&textToSearch=Spin%20Designer%20Hostel%20El%20Nido",
      source: "Agoda search",
      linkType: "manual",
      status: "estimated"
    }
  },
  {
    id: "transport-1",
    category: "transport",
    title: "Caticlan Airport to Boracay Hotel Transfer",
    destination: "Boracay",
    summary: "Airport-to-island transfer path covering van, boat, terminal fees, and hotel drop-off options.",
    price: "Estimated PHP 700-1,500/person",
    meta: "Airport transfer · 60-120 minutes · weather dependent",
    notes: ["Leave buffer for terminal queues.", "Confirm luggage rules for shared transfer."],
    link: {
      label: "Book / Check Route",
      url: "https://www.klook.com/en-PH/search/result/?query=Boracay%20airport%20transfer",
      source: "Klook search",
      linkType: "manual",
      status: "estimated"
    }
  },
  {
    id: "ticket-1",
    category: "ticket",
    title: "Underground River Tour",
    destination: "Puerto Princesa",
    summary: "UNESCO cave and paddle boat experience, usually best booked with transport and permit handling.",
    price: "Estimated PHP 1,900-2,800/person",
    meta: "Nature tour · 6-8 hours · permit required",
    notes: ["Best for dry-season mornings.", "Check permit inclusions and lunch details."],
    link: {
      label: "View Ticket",
      url: "https://www.klook.com/en-PH/search/result/?query=Puerto%20Princesa%20Underground%20River",
      source: "Klook search",
      linkType: "manual",
      status: "estimated"
    }
  },
  {
    id: "deal-1",
    category: "deal",
    title: "Klook seasonal activity bundles",
    destination: "Philippines",
    summary: "Seasonal deal pages may include activity bundles, app-only offers, and member promos.",
    price: "Discount varies",
    meta: "Seasonal · member-only possible · never assume code validity",
    notes: ["No live promo code is claimed.", "Use See Deal Page until a verified code source exists."],
    link: {
      label: "See Deal Page",
      url: "https://www.klook.com/en-PH/promo/",
      source: "Klook promo page",
      linkType: "manual",
      status: "seasonal"
    }
  },
  {
    id: "klook-1",
    category: "klook",
    title: "Coron Super Ultimate Tour",
    destination: "Coron",
    summary: "Lake, lagoon, reef, and beach route commonly used for first-time Coron itineraries.",
    price: "Estimated PHP 1,900-3,200/person",
    meta: "Island hopping · full day · Klook availability indicator: likely",
    notes: ["Compare inclusions with local operators.", "Watch cancellation windows during rainy season."],
    link: {
      label: "Open on Klook",
      url: "https://www.klook.com/en-PH/search/result/?query=Coron%20Super%20Ultimate%20Tour",
      source: "Klook search",
      linkType: "manual",
      status: "estimated"
    }
  }
];

export const aiProviders: AIProviderConfig[] = [
  { id: "openai", name: "ChatGPT", endpoint: "https://api.openai.com/v1", model: "gpt-4.1", apiKey: "", headersJson: "{}", temperature: 0.6, maxTokens: 2400, active: true, defaultProvider: true, priority: 1, health: "needs key", latency: "-", usage: "Credentials required" },
  { id: "claude", name: "Claude", endpoint: "https://api.anthropic.com", model: "claude-sonnet-4", apiKey: "", headersJson: "{}", temperature: 0.5, maxTokens: 2200, active: true, defaultProvider: false, priority: 2, health: "needs key", latency: "-", usage: "Credentials required" },
  { id: "gemini", name: "Gemini", endpoint: "https://generativelanguage.googleapis.com", model: "gemini-2.5-pro", apiKey: "", headersJson: "{}", temperature: 0.55, maxTokens: 2000, active: true, defaultProvider: false, priority: 3, health: "needs key", latency: "-", usage: "Credentials required" },
  { id: "grok", name: "Grok", endpoint: "https://api.x.ai/v1", model: "grok-3", apiKey: "", headersJson: "{}", temperature: 0.7, maxTokens: 1800, active: false, defaultProvider: false, priority: 4, health: "inactive", latency: "-", usage: "Inactive" },
  { id: "openrouter", name: "OpenRouter", endpoint: "https://openrouter.ai/api/v1", model: "auto", apiKey: "", headersJson: "{}", temperature: 0.5, maxTokens: 2000, active: true, defaultProvider: false, priority: 5, health: "needs key", latency: "-", usage: "Credentials required" }
];

export const webhookEvents = [
  "trip.created",
  "trip.updated",
  "ai.response.completed",
  "itinerary.exported",
  "deal.saved",
  "provider.connection.failed",
  "user.settings.updated"
];

export const webhooks: WebhookConfig[] = [
  { id: "wh-1", name: "Trip CRM Sync", event: "trip.created", url: "https://example.com/hooks/trips", active: true, retryPolicy: "3 retries with exponential backoff", status: "success", lastRun: "2 minutes ago" },
  { id: "wh-2", name: "Provider Failure Alert", event: "provider.connection.failed", url: "https://example.com/hooks/alerts", active: true, retryPolicy: "5 retries", status: "failed", lastRun: "18 minutes ago" },
  { id: "wh-3", name: "Export Archive", event: "itinerary.exported", url: "https://example.com/hooks/export", active: false, retryPolicy: "manual retry", status: "untested", lastRun: "Never" }
];
