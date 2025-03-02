import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useEffect } from 'react';
import { supabase } from './supabaseClient';
import MainPage from './MainPage';

export default function App() {
  useEffect(() => {
    // Supabase에서 가계부 데이터를 조회하는 예시
    const fetchData = async () => {
      // 예시로 "transactions" 테이블에서 데이터를 가져옵니다.
      const { data, error } = await supabase.from('expenditure').select('*');
      if (error) {
        console.error('데이터 조회 실패:', error);
      } else {
        console.log('조회한 데이터:', data);
      }
    };

    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <MainPage />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
