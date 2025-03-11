import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import {
  PlusCircle,
  Tag,
  Calendar,
  Trash,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import { supabase } from "./supabaseClient";
import Swipeable from "react-native-gesture-handler/Swipeable";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  const hours = ("0" + date.getHours()).slice(-2);
  const minutes = ("0" + date.getMinutes()).slice(-2);
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const MainPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState(0);
  const [memo, setMemo] = useState("");
  const [tags, setTags] = useState([]);
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  const totalExpense = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const tagOptions = ["식비", "교통비", "쇼핑", "문화생활", "기타"];
  const today = new Date();
  const isCurrentMonth =
    currentMonthDate.getMonth() === today.getMonth() &&
    currentMonthDate.getFullYear() === today.getFullYear();

  const getCurrentMonthExpense = async () => {
    try {
      const year = currentMonthDate.getFullYear();
      const month = currentMonthDate.getMonth();
      const startOfMonth = new Date(year, month, 1).toISOString();
      const startOfNextMonth = new Date(year, month + 1, 1).toISOString();

      const { data, error } = await supabase
        .from("expenditure")
        .select("*")
        .gte("created_at", startOfMonth)
        .lt("created_at", startOfNextMonth);

      if (error) {
        throw error;
      }

      setExpenses(data.reverse());
    } catch (error) {
      console.error("데이터 조회 실패:", error);
    }
  };

  const addExpense = async () => {
    try {
      await supabase
        .from("expenditure")
        .insert([{ amount, memo, tags, created_at: new Date().toISOString() }]);

      setAmount(0);
      setMemo("");
      getCurrentMonthExpense();
    } catch (error) {
      console.error("지출 추가 실패:", error);
    }
  };

  const deleteExpense = async (expenseId) => {
    try {
      await supabase.from("expenditure").delete().eq("id", expenseId);
      getCurrentMonthExpense();
    } catch (error) {
      console.error("지출 삭제 실패:", error);
    }
  };

  const renderRightActions = (expenseId) => {
    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteExpense(expenseId)}
      >
        <Trash size={20} color="#fff" />
      </TouchableOpacity>
    );
  };

  const handlePreviousMonth = () => {
    setCurrentMonthDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  // currentMonthDate가 바뀔 때마다 데이터를 새로 불러옴
  useEffect(() => {
    getCurrentMonthExpense();
  }, [currentMonthDate]);

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <TouchableOpacity onPress={handlePreviousMonth}>
            <ChevronLeft size={24} color="#2563eb" />
          </TouchableOpacity>
          <Text style={styles.summaryTitle}>
            {currentMonthDate.getMonth() + 1}월 총 지출
          </Text>
          <TouchableOpacity onPress={handleNextMonth} disabled={isCurrentMonth}>
            <ChevronRight
              size={24}
              color={isCurrentMonth ? "#d1d5db" : "#2563eb"}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.summaryAmount}>
          {totalExpense.toLocaleString()}원
        </Text>
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
              tags.filter((tag) => tag === tagOption).length > 0 &&
                styles.selectedTag,
            ]}
            onPress={() => setTags([...tags, tagOption])}
          >
            <Tag
              size={14}
              color={
                tags.filter((tag) => tag === tagOption).length > 0
                  ? "#2563eb"
                  : "#4b5563"
              }
            />
            <Text
              style={{
                color:
                  tags.filter((tag) => tag === tagOption).length > 0
                    ? "#2563eb"
                    : "#4b5563",
                marginLeft: 4,
              }}
            >
              {tagOption}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {expenses.length > 0 ? (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            return (
              <Swipeable renderRightActions={() => renderRightActions(item.id)}>
                <View style={styles.expenseItem}>
                  <View>
                    <Text style={styles.expenseMemo}>{item.memo || "-"}</Text>
                    <View style={styles.expenseDetails}>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Calendar size={12} color="#6b7280" />
                        <Text style={styles.expenseText}>
                          {formatDate(item.created_at)}
                        </Text>
                      </View>
                      <View style={[styles.tagContainer, { display: "block" }]}>
                        {item.tags.map((tagOption) => (
                          <View
                            key={tagOption}
                            style={[styles.tagButton, { marginLeft: 4 }]}
                          >
                            <Tag size={14} color="#4b5563" />
                            <Text style={{ color: "#4b5563", marginLeft: 4 }}>
                              {tagOption}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.expenseAmount}>
                    {item.amount.toLocaleString()}원
                  </Text>
                </View>
              </Swipeable>
            );
          }}
        />
      ) : (
        <View style={styles.noData}>
          <PiggyBank size={128} color="#4b5563" />
          <Text style={styles.noDataText}>아직 지출내역이 없네요!</Text>
        </View>
      )}
    </View>
  );
};

export default MainPage;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 64,
    backgroundColor: "#f9fafb",
    flex: 1,
    width: "100%",
  },
  summaryCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  monthChangeText: { color: "#2563eb", fontSize: 14 },
  summaryTitle: { fontSize: 20, color: "#6b7280" },
  summaryAmount: { fontSize: 24, fontWeight: "bold", color: "#1f2937" },
  inputCard: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
    height: 40,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 6,
  },
  addButtonText: { color: "white", marginLeft: 4 },
  memoInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    height: 40,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
    marginTop: 8,
  },
  tagButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
  },
  deleteButton: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 20,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedTag: {
    backgroundColor: "#dbeafe",
    borderColor: "#2563eb",
    borderWidth: 1,
  },
  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
  },
  expenseMemo: { fontSize: 16, fontWeight: "bold" },
  expenseDetails: { flexDirection: "column", marginTop: 4, gap: 4 },
  expenseText: { color: "#6b7280", fontSize: 12, marginLeft: 4 },
  expenseAmount: { fontSize: 16, fontWeight: "bold" },
  noData: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 120,
  },
  noDataText: { fontSize: 16, color: "#1f2937", marginTop: 16 },
});
