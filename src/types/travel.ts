import type { LucideIcon } from "lucide-react";

export type UserRole = "guest" | "user" | "admin";
export type ThemeMode = "dark" | "light";
export type VerificationStatus = "verified" | "estimated" | "manual" | "api-provided" | "user-added" | "unverified" | "expired soon" | "seasonal" | "member-only";
export type ModuleId = "home" | "dashboard" | "planner" | "hotels" | "transport" | "tickets" | "deals" | "klook" | "saved" | "integrations" | "settings" | "admin" | "profile";

export interface NavItem {
  id: ModuleId;
  label: string;
  icon: LucideIcon;
  protected?: boolean;
  adminOnly?: boolean;
}

export interface UserAccount {
  name: string;
  email: string;
  role: UserRole;
  currency: string;
  timezone: string;
}

export interface PromptBuilderState {
  destination: string;
  dateRange: string;
  travelers: string;
  adults: number;
  kids: number;
  budget: string;
  tripType: string;
  hotelLevel: string;
  transportPreference: string;
  mustSee: string;
  pace: string;
  accessibility: string;
  food: string;
  includeKlook: boolean;
  includeDiscounts: boolean;
  optimizeFor: "cheapest" | "best value" | "fastest" | "premium";
  promptType: string;
}

export interface RecommendationLink {
  label: string;
  url: string;
  source: string;
  linkType: "direct" | "deep link" | "affiliate" | "api result" | "manual";
  status: VerificationStatus;
}

export interface Recommendation {
  id: string;
  category: "hotel" | "transport" | "ticket" | "deal" | "klook";
  title: string;
  destination: string;
  summary: string;
  price: string;
  meta: string;
  idealFor?: string;
  notes: string[];
  link: RecommendationLink;
}

export interface AIProviderConfig {
  id: string;
  name: string;
  endpoint: string;
  model: string;
  apiKey: string;
  headersJson: string;
  temperature: number;
  maxTokens: number;
  active: boolean;
  defaultProvider: boolean;
  priority: number;
  health: "healthy" | "degraded" | "needs key" | "inactive";
  latency: string;
  usage: string;
}

export interface WebhookConfig {
  id: string;
  name: string;
  event: string;
  url: string;
  active: boolean;
  retryPolicy: string;
  status: "success" | "failed" | "untested";
  lastRun: string;
}
