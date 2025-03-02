import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { PlusCircle, Tag, Calendar } from "lucide-react-native";
import { supabase } from './supabaseClient';

export default function MainPage() {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState(0);
  const [memo, setMemo] = useState("");
  const [tag, setTag] = useState("");

  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const tagOptions = ["식비", "교통비", "커피", "쇼핑", "문화생활", "기타"];

  const addExpense = async () => {
    try {
      await supabase
        .from('expenditure')
        .insert([{ amount, memo,tags:['test1','test2'], created_at: new Date().toISOString() }]);
      
        setAmount(0);
        setMemo('');
        getCurrentMonthExpense();
    } catch (error) {
      console.error('지출 추가 실패:', error);
    }
    
  };

  const getCurrentMonthExpense = async () => {
    try {
      const { data } = await supabase
      .from('expenditure')
      .select('*')

      setExpenses(data.reverse());
    } catch (error) {
      console.error('데이터 조회 실패:', error);
      return;
    }
  };

  

  useEffect(() => {
    getCurrentMonthExpense();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>3월 총 지출</Text>
        <Text style={styles.summaryAmount}>{totalExpense.toLocaleString()}원</Text>
      </View>

      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          placeholder="금액"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <TouchableOpacity style={styles.addButton} onPress={addExpense}>
          <PlusCircle size={20} color="white" />
          <Text style={styles.addButtonText}>추가</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.memoInput}
        placeholder="메모"
        value={memo}
        onChangeText={setMemo}
      />
    
      <View style={styles.tagContainer}>
        {tagOptions.map((tagOption) => (
          <TouchableOpacity
            key={tagOption}
            style={[
              styles.tagButton,
              tag === tagOption && styles.selectedTag,
            ]}
            onPress={() => setTag(tagOption)}
          >
            <Tag size={14} color={tag === tagOption ? "#2563eb" : "#4b5563"} />
            <Text
              style={{ color: tag === tagOption ? "#2563eb" : "#4b5563", marginLeft: 4 }}
            >
              {tagOption}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.expenseItem}>
            <View>
              <Text style={styles.expenseMemo}>{item.memo}</Text>
              <View style={styles.expenseDetails}>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                <Calendar size={14} color="#6b7280" />
                <Text style={styles.expenseText}>{item.created_at}</Text>
                </View>
                <View style={[styles.tagContainer,{display:'block'}]}>
                {
                  item.tags.map((tagOption) => (
                    <View key={tagOption} style={[styles.tagButton,{marginLeft:4}]}>
                      <Tag size={14} color="#4b5563" />
                      <Text style={{ color: "#4b5563", marginLeft: 4 }}>
                        {tagOption}
                      </Text>
                    </View>
                  ))
                }
                </View>
              </View>
            </View>
            <Text style={styles.expenseAmount}>{item.amount.toLocaleString()}원</Text>
          </View>
        )}
      /> 
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 64, backgroundColor: "#f9fafb", flex: 1, width: "100%" },
  summaryCard: { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginBottom: 16 },
  summaryTitle: { fontSize: 14, color: "#6b7280" },
  summaryAmount: { fontSize: 24, fontWeight: "bold", color: "#1f2937" },
  inputCard: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: "#d1d5db", padding: 8, borderRadius: 6, marginRight: 8 },
  addButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#2563eb", padding: 10, borderRadius: 6 },
  addButtonText: { color: "white", marginLeft: 4 },
  memoInput: { borderWidth: 1, borderColor: "#d1d5db", padding: 8, borderRadius: 6, marginBottom: 8 },
  tagContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  tagButton: { flexDirection: "row", alignItems: "center", padding: 6, borderRadius: 16, backgroundColor: "#e5e7eb" },
  selectedTag: { backgroundColor: "#dbeafe", borderColor: "#2563eb", borderWidth: 1 },
  expenseItem: { flexDirection: "row", justifyContent: "space-between", padding: 12, backgroundColor: "#fff", borderRadius: 8, marginBottom: 8 },
  expenseMemo: { fontSize: 16, fontWeight: "bold" },
  expenseDetails: { flexDirection: "column", alignItems: "center", marginTop: 4, gap: 4 },
  expenseText: { color: "#6b7280", fontSize: 12 },
  expenseAmount: { fontSize: 16, fontWeight: "bold" },
});