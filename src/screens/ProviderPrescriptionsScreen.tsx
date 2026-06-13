import { Feather, Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { ClassicAlertModal } from "../components/ClassicAlertModal";

type ProviderPrescriptionsScreenProps = NativeStackScreenProps<any, "Prescriptions">;

interface PrescriptionItem {
  id: string;
  patientName: string;
  date: string;
  diagnosis: string;
  medications: string[];
  notes?: string;
}

const INITIAL_PRESCRIPTIONS: PrescriptionItem[] = [
  {
    id: "1",
    patientName: "Amit Patel",
    date: "11 Jun 2026",
    diagnosis: "Hypertension Control",
    medications: [
      "Ramipril 5mg - 1-0-0 (Morning after food)",
      "Amlodipine 5mg - 0-0-1 (Night before food)",
    ],
    notes: "Please monitor blood pressure daily at home and log readings.",
  },
  {
    id: "2",
    patientName: "Neha Roy",
    date: "08 Jun 2026",
    diagnosis: "Seasonal Allergy Symptoms",
    medications: [
      "Cetirizine 10mg - 0-0-1 (Night after food)",
      "Fluticasone Nasal Spray - 2 sprays each nostril once daily",
    ],
    notes: "Avoid outdoors during peak pollen times.",
  },
];

export const ProviderPrescriptionsScreen: React.FC<
  ProviderPrescriptionsScreenProps
> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>(
    INITIAL_PRESCRIPTIONS
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [meds, setMeds] = useState("");
  const [notes, setNotes] = useState("");

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

  const handleSend = () => {
    if (!patientName || !diagnosis || !meds) {
      showAlert("error", "Error", "Please fill in patient name, diagnosis, and medications.");
      return;
    }

    const newPrescription: PrescriptionItem = {
      id: (prescriptions.length + 1).toString(),
      patientName,
      date: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      diagnosis,
      medications: meds.split("\n").filter((line) => line.trim() !== ""),
      notes,
    };

    setPrescriptions([newPrescription, ...prescriptions]);
    setModalVisible(false);
    setPatientName("");
    setDiagnosis("");
    setMeds("");
    setNotes("");

    showAlert("success", "Success", `Prescription successfully sent to ${patientName}!`);
  };

  const renderItem = ({ item }: { item: PrescriptionItem }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.patientName}>{item.patientName}</Text>
            <Text style={styles.diagnosis}>{item.diagnosis}</Text>
          </View>
          <Text style={styles.date}>{item.date}</Text>
        </View>

        <View style={styles.medsBlock}>
          <Text style={styles.medsTitle}>Medications:</Text>
          {item.medications.map((med, index) => (
            <View key={index} style={styles.medRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.medText}>{med}</Text>
            </View>
          ))}
        </View>

        {item.notes ? (
          <View style={styles.notesBlock}>
            <Text style={styles.notesLabel}>Notes: </Text>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        ) : null}
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
          <Text style={styles.headerTitle}>Prescriptions</Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.addButton}
          >
            <Feather name="plus-circle" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* List */}
      <FlatList
        data={prescriptions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="medical-outline" size={48} color="#CCCCCC" />
            <Text style={styles.emptyText}>No prescriptions found</Text>
          </View>
        }
      />

      {/* Add Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 30 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write New Prescription</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Patient Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Amit Patel"
                placeholderTextColor={COLORS.textHint}
                value={patientName}
                onChangeText={setPatientName}
              />

              <Text style={styles.inputLabel}>Diagnosis</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Seasonal Allergy Symptoms"
                placeholderTextColor={COLORS.textHint}
                value={diagnosis}
                onChangeText={setDiagnosis}
              />

              <Text style={styles.inputLabel}>Medications (one per line)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g., Ramipril 5mg - 1-0-0&#10;Cetirizine 10mg - 0-0-1"
                placeholderTextColor={COLORS.textHint}
                multiline
                value={meds}
                onChangeText={setMeds}
              />

              <Text style={styles.inputLabel}>Notes / Instructions</Text>
              <TextInput
                style={[styles.input, styles.notesArea]}
                placeholder="e.g., Avoid cold beverages, follow up in 7 days."
                placeholderTextColor={COLORS.textHint}
                multiline
                value={notes}
                onChangeText={setNotes}
              />

              <TouchableOpacity style={styles.sendButton} onPress={handleSend} activeOpacity={0.8}>
                <LinearGradient colors={COLORS.gradient} style={styles.sendBtnGradient}>
                  <Text style={styles.sendBtnText}>Send to Patient</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
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
    marginBottom: 12,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  diagnosis: {
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: "600",
    marginTop: 2,
  },
  date: {
    fontSize: 11,
    color: COLORS.textHint,
  },
  medsBlock: {
    backgroundColor: "#FAF0E6",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  medsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  medRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  bullet: {
    fontSize: 14,
    color: COLORS.primary,
    marginRight: 6,
    marginTop: -2,
  },
  medText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  notesBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  notesText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 85,
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
    maxHeight: "85%",
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
  notesArea: {
    height: 60,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  sendButton: {
    width: "100%",
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    marginVertical: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  sendBtnGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },
});
