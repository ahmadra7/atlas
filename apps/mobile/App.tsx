import { useEffect } from "react";
import { I18nManager, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { HomeScreen, IngredientsScreen } from "./src/screens/HomeIngredients";
import { RecommendationsScreen } from "./src/screens/RecommendationsScreen";
import { RecipeScreen } from "./src/screens/RecipeScreen";
import { CookScreen } from "./src/screens/CookScreen";
import {
  FavoritesScreen,
  HistoryScreen,
  ProfileScreen,
} from "./src/screens/MoreScreens";
import type { RootStackParamList, TabParamList } from "./src/navigation/types";
import { theme } from "./src/theme";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.ink,
    border: theme.colors.border,
    primary: theme.colors.primary,
  },
};

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: focused ? theme.colors.primarySoft : "transparent",
      }}
    >
      <Text
        style={{
          fontSize: 11,
          color: focused ? theme.colors.primary : theme.colors.inkFaint,
          fontWeight: focused ? "700" : "500",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="خانه" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="Ingredients"
        component={IngredientsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="مواد" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="علاقه" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="تاریخچه" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="پروفایل" focused={focused} />
          ),
        }}
      />
    </Tabs.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    if (!I18nManager.isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="dark" />
        <Stack.Navigator>
          <Stack.Screen
            name="Tabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Recommendations"
            component={RecommendationsScreen}
            options={{
              title: "پیشنهادها",
              headerTitleAlign: "center",
            }}
          />
          <Stack.Screen
            name="Recipe"
            component={RecipeScreen}
            options={{
              title: "دستور",
              headerTitleAlign: "center",
            }}
          />
          <Stack.Screen
            name="Cook"
            component={CookScreen}
            options={{
              headerShown: false,
              presentation: "fullScreenModal",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
