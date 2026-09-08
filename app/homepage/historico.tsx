import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import historico from "../../constants/historicoData";

export default function Historico() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={20} color="#5D7F31" />

        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      {/* Título */}
      <Text style={styles.title}>Histórico</Text>

      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Produto</Text>

        <Text style={styles.headerText}>Data</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        {historico.map((item) => (
          <View key={item.id} style={styles.item}>
            <Text style={styles.produto}>{item.produto}</Text>

            <Text style={styles.data}>{item.data}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECF0E9",
  },

  content: {
    padding: 20,
    paddingTop: 50,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  backText: {
    color: "#5D7F31",
    fontWeight: "600",
    marginLeft: 3,
  },

  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 8,
  },

  headerText: {
    color: "#2E7D32",
    fontWeight: "700",
    fontSize: 15,
  },

  card: {
    backgroundColor: "#FFF",

    borderWidth: 0.5,
    borderColor: "#1b8715",

    borderRadius: 15,

    overflow: "hidden",
  },

  item: {
    flexDirection: "row",
    justifyContent: "space-between",

    padding: 14,

    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },

  produto: {
    color: "#2E7D32",
    fontWeight: "600",
  },

  data: {
    color: "#666",
  },
});
