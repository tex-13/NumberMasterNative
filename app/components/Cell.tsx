// app/components/Cell.tsx
import React from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";

type Props = {
  cell: any;
  rowIndex: number;
  colIndex: number;
  CELL_SIZE: number;
  onPress: (r: number, c: number) => void;
  isSelected: boolean;
  isMatching: boolean;
  isShaking: boolean;
  animScale?: Animated.Value;
  animShake?: Animated.Value;
};

export default function Cell({
  cell,
  rowIndex,
  colIndex,
  CELL_SIZE,
  onPress,
  isSelected,
  isMatching,
  isShaking,
  animScale,
  animShake,
}: Props) {
  // Animate transforms are passed from parent via animScale/animShake values
  const animatedScale = isMatching && animScale
    ? animScale.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] })
    : 1;
  const animatedTranslateX = isShaking && animShake
    ? animShake.interpolate({ inputRange: [-1, 0, 1], outputRange: [-8, 0, 8] })
    : 0;

  const bgDuringAnim = isMatching ? "#34D399" : isShaking ? "#F87171" : null;

  const CellInner = (
    <View
      style={[
        styles.cellInner,
        { width: CELL_SIZE, height: CELL_SIZE, borderRadius: 12 },
        cell.matched ? styles.cellMatched : isSelected ? styles.cellSelected : styles.cellNormal,
      ]}
    >
      <Text style={[styles.cellText, cell.matched ? styles.cellTextMatched : null]}>
        {cell.value}
      </Text>
    </View>
  );

  if (isMatching || isShaking) {
    return (
      <Animated.View
        style={{
          transform: [{ translateX: animatedTranslateX as any }, { scale: animatedScale as any }],
          marginHorizontal: 6,
        }}
      >
        <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(rowIndex, colIndex)} disabled={cell.matched || isMatching}>
          <View style={[{ width: CELL_SIZE, height: CELL_SIZE, borderRadius: 12, justifyContent: "center", alignItems: "center", backgroundColor: bgDuringAnim }, cell.matched && styles.cellMatched]}>
            <Text style={[styles.cellText, { color: "#fff", fontWeight: "700" }]}>{cell.value}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View style={{ marginHorizontal: 6 }}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(rowIndex, colIndex)} disabled={cell.matched}>
        {CellInner}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cellInner: { justifyContent: "center", alignItems: "center", aspectRatio: 1 },
  cellNormal: { backgroundColor: "#fff" },
  cellSelected: { backgroundColor: "#d1d5db" },
  cellMatched: { backgroundColor: "#374151", opacity: 0.75 },
  cellText: { fontSize: 16, color: "#111827", fontWeight: "700" },
  cellTextMatched: { color: "#cbd5e1" },
});