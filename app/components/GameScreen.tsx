// app/components/GameScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, SafeAreaView, Text, ScrollView, TouchableOpacity, Animated, Dimensions, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LEVELS, GRID_COLS, INITIAL_ROWS, MAX_ROWS, LEVEL_TIME } from "../constants/gameConfig";
import { generateNumberSequence, numbersToGrid, isPathClear } from "../utils/gameLogic";
import Grid from "./Grid";
import Header from "./Header";

/* This file contains the state & logic (same as your big file) — unchanged behavior. */

export default function GameScreen() {
  const [gameState, setGameState] = useState<"menu" | "playing" | "levelComplete" | "gameOver">("menu");
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [grid, setGrid] = useState<any[][]>([]);
  const [remainingNumbers, setRemainingNumbers] = useState<number[]>([]);
  const [rowCount, setRowCount] = useState<number>(INITIAL_ROWS);
  const [selectedCell, setSelectedCell] = useState<any | null>(null);
  const [matches, setMatches] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(LEVEL_TIME);
  const [shake, setShake] = useState<any | null>(null);
  const [matchAnimation, setMatchAnimation] = useState<any | null>(null);
  const [addRowsUsed, setAddRowsUsed] = useState<number>(0);

  const processingRef = useRef(false);
  const timerRef = useRef<any>(null);

  const animScale = useRef(new Animated.Value(0)).current;
  const animShake = useRef(new Animated.Value(0)).current;

  const level = LEVELS[currentLevel] ?? LEVELS[0];
  const screenW = Dimensions.get("window").width;
  const CELL_SIZE = Math.floor((screenW - 40) / GRID_COLS) * 0.9;

  useEffect(() => {
    const totalMaxPairs = Math.floor((MAX_ROWS * GRID_COLS) / 2);
    LEVELS.forEach((lvl) => {
      if (lvl.targetMatches > totalMaxPairs) console.warn(`Level ${lvl.id} target ${lvl.targetMatches} > max possible pairs ${totalMaxPairs}`);
    });
  }, []);

  // Timer
  useEffect(() => {
    if (gameState !== "playing") {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setGameState("gameOver");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState === "playing") {
      const allMatched = grid.length > 0 && grid.every((row) => row.every((cell) => cell.matched));
      if (allMatched) { setGameState("levelComplete"); return; }
      if (matches >= LEVELS[currentLevel].targetMatches) setGameState("levelComplete");
    }
  }, [matches, grid, gameState, currentLevel]);

  const startLevel = (levelIndex: number) => {
    const lvl = LEVELS[levelIndex];
    const totalInitialCells = INITIAL_ROWS * GRID_COLS;
    const totalPossibleCells = MAX_ROWS * GRID_COLS;

    const fullSequence = generateNumberSequence(totalPossibleCells, lvl.numberRange[0], lvl.numberRange[1], Math.floor(totalPossibleCells * 0.4));
    const initialNumbers = fullSequence.slice(0, totalInitialCells);
    const remaining = fullSequence.slice(totalInitialCells);

    setCurrentLevel(levelIndex);
    setGrid(numbersToGrid(initialNumbers, GRID_COLS));
    setRemainingNumbers(remaining);
    setMatches(0);
    setTimeLeft(LEVEL_TIME);
    setSelectedCell(null);
    setShake(null);
    setMatchAnimation(null);
    setAddRowsUsed(0);
    processingRef.current = false;
    setRowCount(INITIAL_ROWS);
    setGameState("playing");
  };

  const restartLevel = () => startLevel(currentLevel);

  const addNewRow = () => {
    const lvl = LEVELS[currentLevel];
    if (lvl.maxAddRows && addRowsUsed >= lvl.maxAddRows) return;
    if (grid.length >= MAX_ROWS) return;
    if (remainingNumbers.length < GRID_COLS) return;

    const newRowNums = remainingNumbers.slice(0, GRID_COLS);
    const newRow = newRowNums.map((v) => ({ value: v, matched: false, id: Math.random().toString(36).slice(2, 9) }));

    setGrid((g) => [...g, newRow]);
    setRemainingNumbers((r) => r.slice(GRID_COLS));
    setAddRowsUsed((a) => a + 1);
    setRowCount((rc) => rc + 1);
  };

  const runMatchAnim = () => {
    animScale.setValue(0);
    Animated.timing(animScale, { toValue: 1, duration: 600, useNativeDriver: true }).start(() => animScale.setValue(0));
  };

  const runWrongAnim = () => {
    animShake.setValue(0);
    Animated.sequence([
      Animated.timing(animShake, { toValue: 1, duration: 110, useNativeDriver: true }),
      Animated.timing(animShake, { toValue: -1, duration: 110, useNativeDriver: true }),
      Animated.timing(animShake, { toValue: 0, duration: 110, useNativeDriver: true }),
    ]).start();
  };

  const handleCellPress = (rowIndex: number, colIndex: number) => {
    if (gameState !== "playing") return;
    if (processingRef.current) return;

    const cell = grid[rowIndex]?.[colIndex];
    if (!cell || cell.matched) return;

    if (!selectedCell) {
      setSelectedCell({ row: rowIndex, col: colIndex, value: cell.value });
      return;
    }

    if (selectedCell.row === rowIndex && selectedCell.col === colIndex) {
      setSelectedCell(null);
      return;
    }

    processingRef.current = true;
    const lvl = LEVELS[currentLevel];
    const isValueMatch = cell.value === selectedCell.value || cell.value + selectedCell.value === 10;

    const pathClear = isPathClear(grid, { row: selectedCell.row, col: selectedCell.col }, { row: rowIndex, col: colIndex }, lvl.allowDiagonal);

    if (isValueMatch && pathClear) {
      setMatchAnimation({ a: { row: selectedCell.row, col: selectedCell.col }, b: { row: rowIndex, col: colIndex } });
      runMatchAnim();

      setTimeout(() => {
        setGrid((prev) => {
          const copy = prev.map((r) => r.map((c) => ({ ...c })));
          copy[rowIndex][colIndex].matched = true;
          copy[selectedCell.row][selectedCell.col].matched = true;
          return copy;
        });
        setMatches((m) => m + 1);
        setMatchAnimation(null);
        setTimeout(() => (processingRef.current = false), 120);
      }, 600);
    } else {
      setShake({ a: { row: selectedCell.row, col: selectedCell.col }, b: { row: rowIndex, col: colIndex } });
      runWrongAnim();
      setTimeout(() => { setShake(null); processingRef.current = false; }, 450);
    }

    setSelectedCell(null);
  };

  const nextLevel = () => { if (currentLevel < LEVELS.length - 1) startLevel(currentLevel + 1); else setGameState("menu"); };

  const canAddRow = grid.length < MAX_ROWS && remainingNumbers.length >= GRID_COLS && (!level.maxAddRows || addRowsUsed < level.maxAddRows);

  // render helpers (menu/playing/complete) — trimmed copy of original layout
  const renderMenu = () => (
    <ScrollView contentContainerStyle={[styles.center, { padding: 20 }]}>
      <Text style={[styles.title, { marginTop: 10 }]}>Number Master</Text>
      <Text style={styles.subtitle}>Match same numbers or pairs that sum to 10</Text>

      <View style={{ width: "100%", marginTop: 24 }}>
        {LEVELS.map((lvl, idx) => (
          <TouchableOpacity key={lvl.id} onPress={() => startLevel(idx)} activeOpacity={0.9} style={[styles.levelButton, { backgroundColor: lvl.colorFrom }]}>
            <View style={styles.levelRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.levelTitle}>Level {lvl.id}: {lvl.name}</Text>
                <Text style={styles.levelDesc}>{lvl.description}</Text>
                <Text style={styles.levelSmall}>Target: {lvl.targetMatches} matches</Text>
                {lvl.maxAddRows ? <Text style={styles.levelSmall}>Limited add-rows: {lvl.maxAddRows}</Text> : null}
              </View>
              <Feather name="play" size={28} color="#fff" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderLevelComplete = () => (
    <View style={[styles.center, { padding: 20, marginTop: 10 }]}>
      <Feather name="award" size={64} color="#FBBF24" />
      <Text style={[styles.title, { marginTop: 12 }]}>Level Complete!</Text>
      <Text style={styles.subtitle}>Matches: {matches}</Text>
      <Text style={styles.subtitle}>Time Left: {timeLeft}s</Text>

      <TouchableOpacity onPress={nextLevel} style={styles.bigButton}>
        <Text style={styles.bigButtonText}>{currentLevel < LEVELS.length - 1 ? "Next Level" : "Back to Menu"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={restartLevel} style={[styles.bigButton, { marginTop: 12, backgroundColor: "#ffffff22" }]}>
        <Text style={styles.bigButtonText}>Replay Level</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGameOver = () => (
    <View style={[styles.center, { padding: 20, marginTop: 10 }]}>
      <Text style={[styles.title]}>Time's Up!</Text>
      <Text style={styles.subtitle}>Matches: {matches}/{level.targetMatches}</Text>
      <TouchableOpacity onPress={restartLevel} style={styles.bigButton}>
        <Feather name="rotate-ccw" size={18} color="#111827" />
        <Text style={[styles.bigButtonText, { marginLeft: 8 }]}>Try Again</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setGameState("menu")} style={[styles.bigButton, { marginTop: 12, backgroundColor: "#ffffff22" }]}>
        <Text style={styles.bigButtonText}>Back to Menu</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPlaying = () => (
    <View style={[styles.container, { backgroundColor: level.colorFrom }]}>
      <Header level={level} matches={matches} timeLeft={timeLeft} onMenu={() => setGameState("menu")} onAddRow={addNewRow} canAddRow={canAddRow} addRowsUsed={addRowsUsed} />
      <Grid grid={grid} CELL_SIZE={CELL_SIZE} selectedCell={selectedCell} shake={shake} matchAnimation={matchAnimation} animScale={animScale} animShake={animShake} onCellPress={handleCellPress} />
      <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
        <Text style={{ color: "#fff", fontWeight: "700", marginBottom: 6 }}>Rules</Text>
        <Text style={styles.ruleText}>• Match same numbers OR pairs that sum to 10</Text>
        <Text style={styles.ruleText}>• Pairs can connect horizontally, vertically, or diagonally</Text>
        <Text style={styles.ruleText}>• Path must be clear (no blocking unmatched tiles)</Text>
        <Text style={styles.ruleText}>• End of row connects to start of next row</Text>
        <Text style={styles.ruleText}>• Complete {level.targetMatches} matches to win!</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {gameState === "menu" && renderMenu()}
      {gameState === "playing" && renderPlaying()}
      {gameState === "levelComplete" && renderLevelComplete()}
      {gameState === "gameOver" && renderGameOver()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0b1220" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { color: "#fff", fontSize: 28, fontWeight: "800", textAlign: "center", marginBottom: 8 },
  subtitle: { color: "#cbd5e1", fontSize: 15, textAlign: "center", marginBottom: 16 },

  container: { flex: 1, paddingVertical: 10, paddingHorizontal: 14 },

  levelButton: { padding: 16, borderRadius: 18, marginBottom: 12, width: "100%" },
  levelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  levelTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  levelDesc: { color: "#e5e7eb", fontSize: 13, marginTop: 4 },
  levelSmall: { color: "#d1d5db", fontSize: 12, marginTop: 2 },

  bigButton: { paddingVertical: 10, paddingHorizontal: 22, backgroundColor: "#fff", borderRadius: 10, marginTop: 16, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  bigButtonText: { fontWeight: "800", textAlign: "center", color: "#111827", fontSize: 15 },

  ruleText: { color: "#cbd5e1", fontSize: 12, marginBottom: 4, lineHeight: 18 },

  // header / stats / grid styles will be used by components too if needed
});