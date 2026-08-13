import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App crash:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: "#FFF5F5",
            padding: 24,
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#B91C1C" }}>
            خطا در اجرای اپ
          </Text>
          <ScrollView style={{ marginTop: 12, maxHeight: 320 }}>
            <Text style={{ color: "#7F1D1D", lineHeight: 22 }}>
              {this.state.error.message}
            </Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}
