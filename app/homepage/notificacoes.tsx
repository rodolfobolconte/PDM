import { View, Text, StyleSheet } from "react-native";

export default function Notificacoes() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sem notificações no momento!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 24,
    fontWeight: "400",
    color: "#535854",
  },
});
