export type RootStackParamList = {
  Tabs: undefined;
  Ingredients: undefined;
  Recommendations: undefined;
  Recipe: { slug: string };
  Cook: { sessionId: string };
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Favorites: undefined;
  Profile: undefined;
};
