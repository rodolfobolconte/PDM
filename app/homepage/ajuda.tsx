import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Ajuda() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Botão voltar para a home */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/homepage/home")}
      >
        <Ionicons name="chevron-back" size={20} color="#4CAF50" />

        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      {/* Título */}
      <Text style={styles.title}>Ajuda</Text>

      {/* Botões */}

      <TouchableOpacity style={styles.card}>
        <Text style={styles.buttonText}>Tutorial para mexer no aplicativo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        //onPress={() => router.push("/EntrarContato")}
      >
        <Text style={styles.buttonText}>Entrar em contato</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecf0e9",
    paddingTop: 60,
    alignItems: "center",
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginLeft: 20,
    marginBottom: 20,
  },

  backText: {
    color: "#4CAF50",
    fontWeight: "bold",
    marginLeft: 5,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1c8020",
    marginBottom: 30,
    alignSelf: "flex-start",
    marginLeft: 30,
  },

  buttonText: {
    color: "#4CAF50",
    fontWeight: "bold",
    fontSize: 16,
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
});
