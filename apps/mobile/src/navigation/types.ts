export type RootStackParamList = {
  Tabs: undefined;
  Recommendations: undefined;
  Recipe: { slug: string };
  Cook: { sessionId: string };
};

export type TabParamList = {
  Home: undefined;
  Ingredients: undefined;
  Favorites: undefined;
  History: undefined;
  Profile: undefined;
};
