import { Feather, Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { useUser } from "../context/UserContext";
import { ClassicAlertModal } from "../components/ClassicAlertModal";

type ProviderCoursesScreenProps = NativeStackScreenProps<any, "Courses">;

interface CourseItem {
  id: string;
  title: string;
  price: string;
  subtitle: string; // "12 Students" or "45 mins"
  desc?: string;
  isActive: boolean;
}

const INITIAL_COURSES_TEACHER: CourseItem[] = [
  {
    id: "1",
    title: "Quran Tajweed Basics",
    price: "₹800/month",
    subtitle: "24 Students enrolled",
    isActive: true,
  },
  {
    id: "2",
    title: "Sanskrit Shloka Recitation",
    price: "₹1,200/month",
    subtitle: "18 Students enrolled",
    isActive: true,
  },
  {
    id: "3",
    title: "Intro to Bible Studies",
    price: "₹600/month",
    subtitle: "14 Students enrolled",
    isActive: false,
  },
];

const INITIAL_PACKAGES_OTHER: CourseItem[] = [
  {
    id: "1",
    title: "Comprehensive Kundli Matching",
    price: "₹2,500/session",
    subtitle: "45 mins consult",
    desc: "Complete matching process including Guna Milan, Dosha analysis, and remedies description.",
    isActive: true,
  },
  {
    id: "2",
    title: "Career & Financial Astrology Path",
    price: "₹1,800/session",
    subtitle: "30 mins consult",
    desc: "Specific chart reading focusing on career growth, job changes, business prospects, and financial health.",
    isActive: true,
  },
];

export const ProviderCoursesScreen: React.FC<ProviderCoursesScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { providerType } = useUser();
  const isTeacher = providerType === "teacher";

  const [items, setItems] = useState<CourseItem[]>(
    isTeacher ? INITIAL_COURSES_TEACHER : INITIAL_PACKAGES_OTHER
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: "success" | "warning" | "error" | "info";
    title: string;
    message: string;
  }>({
    visible: false,
    type: "info",
    title: "",
    message: "",
  });

  const showAlert = (
    type: "success" | "warning" | "error" | "info",
    title: string,
    message: string
  ) => {
    setAlertConfig({
      visible: true,
      type,
      title,
      message,
    });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const toggleActive = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    );
  };

  const handleCreate = () => {
    if (!newTitle || !newPrice) {
      showAlert("error", "Error", "Please fill in the title and pricing fields.");
      return;
    }

    const newItem: CourseItem = {
      id: (items.length + 1).toString(),
      title: newTitle,
      price: newPrice.includes("₹") ? newPrice : `₹${newPrice}`,
      subtitle: newSubtitle || (isTeacher ? "0 Students enrolled" : "30 mins consult"),
      desc: isTeacher ? undefined : newDesc || "No description provided.",
      isActive: true,
    };

    setItems([...items, newItem]);
    setModalVisible(false);
    setNewTitle("");
    setNewPrice("");
    setNewSubtitle("");
    setNewDesc("");
    showAlert("success", "Success", `${isTeacher ? "Course" : "Package"} created successfully!`);
  };

  const renderItem = ({ item }: { item: CourseItem }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          </View>
          <Text style={styles.cardPrice}>{item.price}</Text>
        </View>

        {item.desc ? <Text style={styles.cardDesc}>{item.desc}</Text> : null}

        <View style={styles.cardFooter}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: item.isActive ? "#4CAF50" : "#9E9E9E" },
              ]}
            />
            <Text style={styles.statusText}>{item.isActive ? "Active" : "Inactive"}</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleBtn, item.isActive ? styles.toggleBtnActive : null]}
            onPress={() => toggleActive(item.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleBtnText, item.isActive ? styles.toggleBtnTextActive : null]}>
              {item.isActive ? "Deactivate" : "Activate"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header Banner */}
      <LinearGradient
        colors={COLORS.gradient}
        style={[
          styles.header,
          { paddingTop: insets.top > 0 ? insets.top + 12 : 24 },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isTeacher ? "My Courses" : "My Packages"}
          </Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
            <Feather name="plus" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* List */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={48} color="#CCCCCC" />
            <Text style={styles.emptyText}>No items found</Text>
          </View>
        }
      />

      {/* Add Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 30 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isTeacher ? "Create Course" : "Create Package"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder={isTeacher ? "e.g., Quran Memorization Basics" : "e.g., Kundli Analysis"}
              placeholderTextColor={COLORS.textHint}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={styles.inputLabel}>Pricing (e.g., ₹800/month or ₹1,500/session)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., ₹1,000"
              placeholderTextColor={COLORS.textHint}
              value={newPrice}
              onChangeText={setNewPrice}
            />

            <Text style={styles.inputLabel}>
              {isTeacher ? "Students Limit (e.g., 20 max)" : "Consult Duration (e.g., 45 mins)"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={isTeacher ? "e.g., 20 students limit" : "e.g., 45 mins consult"}
              placeholderTextColor={COLORS.textHint}
              value={newSubtitle}
              onChangeText={setNewSubtitle}
            />

            {!isTeacher && (
              <>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe your consultation service details..."
                  placeholderTextColor={COLORS.textHint}
                  multiline
                  value={newDesc}
                  onChangeText={setNewDesc}
                />
              </>
            )}

            <TouchableOpacity style={styles.createButton} onPress={handleCreate} activeOpacity={0.8}>
              <LinearGradient colors={COLORS.gradient} style={styles.createBtnGradient}>
                <Text style={styles.createBtnText}>Create Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ClassicAlertModal
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={hideAlert}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    flex: 1,
    marginLeft: 8,
  },
  addButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primaryDark,
  },
  cardDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "#F5F5F5",
    paddingTop: 10,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    borderTopWidth: 0.5,
    borderTopColor: "#F5F5F5",
    paddingTop: 12,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  toggleBtnActive: {
    borderColor: COLORS.error,
    backgroundColor: "#FFE8E8",
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  toggleBtnTextActive: {
    color: COLORS.error,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textHint,
    marginTop: 10,
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  createButton: {
    width: "100%",
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  createBtnGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  createBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },
});
