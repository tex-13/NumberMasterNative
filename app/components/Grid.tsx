// app/components/Grid.tsx
import React from "react";
import { View } from "react-native";
import Cell from "./Cell";

type Props = {
  grid: any[][];
  CELL_SIZE: number;
  selectedCell: any;
  shake: any;
  matchAnimation: any;
  animScale: any;
  animShake: any;
  onCellPress: (r: number, c: number) => void;
};

export default function Grid({
  grid,
  CELL_SIZE,
  selectedCell,
  shake,
  matchAnimation,
  animScale,
  animShake,
  onCellPress,
}: Props) {
  return (
    <View style={{ width: "100%", alignItems: "center", marginTop: 8 }}>
      {grid.map((row, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection: "row", justifyContent: "center", marginBottom: 8 }}>
          {row.map((cell: any, colIndex: number) => {
            const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            const isShaking =
              shake &&
              ((shake.a && shake.a.row === rowIndex && shake.a.col === colIndex) ||
                (shake.b && shake.b.row === rowIndex && shake.b.col === colIndex));
            const isMatching =
              matchAnimation &&
              ((matchAnimation.a && matchAnimation.a.row === rowIndex && matchAnimation.a.col === colIndex) ||
                (matchAnimation.b && matchAnimation.b.row === rowIndex && matchAnimation.b.col === colIndex));

            return (
              <Cell
                key={cell.id}
                cell={cell}
                rowIndex={rowIndex}
                colIndex={colIndex}
                CELL_SIZE={CELL_SIZE}
                onPress={onCellPress}
                isSelected={isSelected}
                isMatching={isMatching}
                isShaking={isShaking}
                animScale={animScale}
                animShake={animShake}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}