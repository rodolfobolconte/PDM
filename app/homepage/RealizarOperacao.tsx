import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function RealizarOperacao() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/homepage/home")}
      >
        <Ionicons name="chevron-back" size={20} color="#4CAF50" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Realizar operação</Text>
      <Text style={styles.subtitle}>O que você deseja fazer?</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/Operacao/solicitar")}
      >
        <Text style={styles.buttonText}>Solicitar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/Operacao/doacao")}
      >
        <Text style={styles.buttonText}>Doar</Text>
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
    color: "#4CAF50",
    alignSelf: "flex-start",
    marginLeft: 30,
    marginBottom: 30,
  },
  buttonText: {
    color: "#1c8020",
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
    justifyContent: "center",
    paddingHorizontal: 15,
    marginBottom: 15,
  },
});
