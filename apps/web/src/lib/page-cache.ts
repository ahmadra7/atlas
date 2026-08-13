import type {
  FavoriteItem,
  InventoryItem,
  RecommendationCard,
  UserProfile,
} from "@atlas/contracts";

/** In-memory cache so tab switches feel instant on revisit. */
export const pageCache = {
  inventory: null as InventoryItem[] | null,
  popular: null as RecommendationCard[] | null,
  favorites: null as FavoriteItem[] | null,
  profile: null as UserProfile | null,
};
