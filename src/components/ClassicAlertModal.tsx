import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/colors";

export interface ClassicAlertModalProps {
  visible: boolean;
  type?: "success" | "warning" | "info" | "error";
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const ClassicAlertModal: React.FC<ClassicAlertModalProps> = ({
  visible,
  type = "info",
  title,
  message,
  onClose,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
}) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <View style={[styles.iconCircle, styles.successCircle]}>
            <Ionicons name="checkmark-circle-outline" size={36} color="#2E7D32" />
          </View>
        );
      case "warning":
        return (
          <View style={[styles.iconCircle, styles.warningCircle]}>
            <Ionicons name="warning-outline" size={36} color="#E65100" />
          </View>
        );
      case "error":
        return (
          <View style={[styles.iconCircle, styles.errorCircle]}>
            <Ionicons name="alert-circle-outline" size={36} color="#C62828" />
          </View>
        );
      default:
        return (
          <View style={[styles.iconCircle, styles.infoCircle]}>
            <Ionicons name="information-circle-outline" size={36} color="#1565C0" />
          </View>
        );
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertCard}>
          {getIcon()}
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={[styles.buttonRow, onConfirm ? styles.rowSpace : styles.rowCenter]}>
            {onConfirm && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={onConfirm ? styles.confirmButtonHalf : styles.confirmButtonFull}
              onPress={onConfirm ? onConfirm : onClose}
              activeOpacity={0.8}
            >
              {onConfirm ? (
                <LinearGradient
                  colors={COLORS.gradient}
                  style={styles.btnGradient}
                >
                  <Text style={styles.confirmButtonText}>{confirmText}</Text>
                </LinearGradient>
              ) : (
                <LinearGradient
                  colors={COLORS.gradient}
                  style={styles.btnGradient}
                >
                  <Text style={styles.confirmButtonText}>{confirmText}</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  alertCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successCircle: {
    backgroundColor: "#E8F5E9",
  },
  warningCircle: {
    backgroundColor: "#FFF3E0",
  },
  errorCircle: {
    backgroundColor: "#FFEBEE",
  },
  infoCircle: {
    backgroundColor: "#E3F2FD",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonRow: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
  },
  rowCenter: {
    justifyContent: "center",
  },
  rowSpace: {
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  confirmButtonHalf: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  confirmButtonFull: {
    width: "100%",
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  btnGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },
});
