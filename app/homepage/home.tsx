import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  BackHandler,
} from "react-native";

import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Home() {
  const [menuVisible, setMenuVisible] = useState(false);

  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={{ width: "100%", alignItems: "center" }}>
        {/* Perfil */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.push("/homepage/perfil")}>
            <Ionicons name="person-circle-outline" size={32} color="#4CAF50" />
          </TouchableOpacity>

          {/* Ícones da direita */}
          <View style={styles.rightIcons}>
            <TouchableOpacity
              onPress={() => router.push("/homepage/notificacoes")}
            >
              <Ionicons
                name="notifications-outline"
                size={28}
                color="#4CAF50"
              />
            </TouchableOpacity>

            {/* Menu 3 pontos */}
            <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
              <Ionicons name="ellipsis-vertical" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu */}
        {menuVisible && (
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuRow}>
              <Ionicons name="settings-outline" size={20} color="#2E7D32" />
              <Text style={styles.menuItem}>Configurações</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuRow}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#2E7D32"
              />
              <Text style={styles.menuItem}>Sobre</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => BackHandler.exitApp()}
            >
              <Ionicons name="log-out-outline" size={20} color="red" />
              <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Título */}
        <Text style={styles.title}>Início</Text>

        {/* Sementes e recursos */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/homepage/RealizarOperacao")}
        >
          <Image
            source={require("../../assets/images/SementesRecursos.png")}
            style={styles.icon}
          />

          <Text style={styles.cardText}>Realizar operação</Text>
        </TouchableOpacity>

        {/* Lista de espera */}
        <TouchableOpacity style={styles.card}>
          <Image
            source={require("../../assets/images/ListaEspera.png")}
            style={styles.icon}
          />

          <Text style={styles.cardText}>Lista de espera</Text>
        </TouchableOpacity>

        {/* Histórico */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/homepage/historico")}
        >
          <Image
            source={require("../../assets/images/Historico.png")}
            style={styles.icon}
          />

          <Text style={styles.cardText}>Histórico</Text>
        </TouchableOpacity>

        {/* Memorial */}
        <TouchableOpacity style={styles.card}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.icon}
          />

          <Text style={styles.cardText}>Nosso memorial</Text>
        </TouchableOpacity>

        {/* Ajuda */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/homepage/ajuda")}
        >
          <Image
            source={require("../../assets/images/Ajuda.png")}
            style={styles.icon}
          />

          <Text style={styles.cardText}>Ajuda</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecf0e9",
    paddingTop: 60,
  },

  scrollContent: {
    paddingBottom: 30,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1c8020",
    marginBottom: 30,
    alignSelf: "flex-start",
    marginLeft: 30,
  },

  card: {
    width: "85%",
    height: 70,
    borderWidth: 1,
    borderColor: "#A5D6A7",
    borderRadius: 15,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 15,
  },

  icon: {
    width: 45,
    height: 45,
    marginRight: 15,
  },

  cardText: {
    color: "#1c8020",
    fontWeight: "bold",
    fontSize: 15,
  },

  topBar: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  menu: {
    position: "absolute",
    top: 55,
    right: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    zIndex: 999,
    elevation: 5,
  },

  menuItem: {
    marginLeft: 10,
    color: "#2E7D32",
    fontWeight: "bold",
  },

  logoutText: {
    marginLeft: 10,
    color: "red",
    fontWeight: "bold",
  },

  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
});
