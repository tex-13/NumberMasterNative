// app/components/Header.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

type Props = {
  level: any;
  matches: number;
  timeLeft: number;
  onMenu: () => void;
  onAddRow: () => void;
  canAddRow: boolean;
  addRowsUsed: number;
};

export default function Header({ level, matches, timeLeft, onMenu, onAddRow, canAddRow, addRowsUsed }: Props) {
  return (
    <>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Level {level.id}: {level.name}</Text>
          <Text style={styles.headerSubtitle}>Target: {level.targetMatches} matches</Text>
        </View>
        <TouchableOpacity onPress={onMenu} style={styles.menuBtn}>
          <Text style={{ color: "#fff" }}>Menu</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Feather name="award" size={18} color="#fff" />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.statLabel}>Matches</Text>
            <Text style={styles.statValue}>{matches}/{level.targetMatches}</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <Feather name="clock" size={18} color="#fff" />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.statLabel}>Time</Text>
            <Text style={styles.statValue}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
            </Text>
          </View>
        </View>
      </View>

      {canAddRow && (
        <View style={{ paddingHorizontal: 24 }}>
          <TouchableOpacity onPress={onAddRow} style={styles.addRowBtn}>
            <Feather name="plus" size={18} color="#fff" />
            <Text style={{ color: "#fff", marginLeft: 8 }}>
              Add New Row {level.maxAddRows ? `(${addRowsUsed}/${level.maxAddRows})` : ""}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 45,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  headerSubtitle: { color: "#cbd5e1", fontSize: 12 },
  menuBtn: {
    backgroundColor: "#ffffff20",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  statsRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 6,
  },
  statCard: {
    backgroundColor: "#ffffff12",
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
  },
  statLabel: { color: "#cbd5e1", fontSize: 11 },
  statValue: { color: "#fff", fontSize: 16, fontWeight: "700" },

  addRowBtn: {
    backgroundColor: "#111827",
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
});