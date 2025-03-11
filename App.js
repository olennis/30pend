import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { useEffect } from "react";
import { supabase } from "./supabaseClient";
import MainPage from "./MainPage";
import { Gesture, GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  useEffect(() => {
    const fetchData = async () => {
      try {
        await supabase.from("expenditure").select("*");
      } catch (error) {
        console.error("데이터 조회 실패:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        <MainPage />
        <StatusBar style="auto" />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
