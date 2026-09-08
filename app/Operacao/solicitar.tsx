import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Solicitar() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/homepage/RealizarOperacao")}
      >
        <Ionicons name="chevron-back" size={20} color="#4CAF50" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Solicitação</Text>
      <Text style={styles.subtitle}>O que você deseja solicitar?</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("../Operacao/tipos-semente")}
      >
        <Text style={styles.buttonText}>Semente</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("../Operacao/solicitar-recurso")}
      >
        <Text style={styles.buttonText}>Recurso</Text>
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
    color: "#1c8020",
    fontWeight: "bold",
    marginLeft: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1c8020",
    alignSelf: "flex-start",
    marginLeft: 30,
  },
  subtitle: {
    fontSize: 15,
    color: "#4CAF50",
    alignSelf: "flex-start",
    marginLeft: 30,
    marginBottom: 30,
  },
  card: {
    width: "85%",
    height: 70,
    borderWidth: 1,
    borderColor: "#A5D6A7",
    borderRadius: 15,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#1c8020",
    fontWeight: "bold",
    fontSize: 18,
  },
});
