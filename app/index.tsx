import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  BackHandler,
} from "react-native";
import { useRouter } from "expo-router";
// importa o router para navegar entre telas

export default function Index() {
  const router = useRouter();
  // cria o router

  return (
    // estrutura principal da tela
    <View style={styles.container}>
      {/* logo */}
      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
      />
      {/* título */}
      <Text style={styles.title}>T.R.S.S</Text>
      {/* subtítulo */}
      <Text style={styles.subtitle}>
        Troca de Recursos de Sementes Semiáridas
      </Text>
      {/* botão entrar */}
      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.buttonTextPrimary}>Entrar</Text>
      </TouchableOpacity>
      {/* botão sair */}
      <TouchableOpacity
        style={styles.buttonOutline}
        onPress={() => BackHandler.exitApp()}
      >
        <Text style={styles.buttonTextOutline}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // tela principal
  container: {
    flex: 1,
    backgroundColor: "#ecf0e9",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  // estilo da logo
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },

  // estilo do título
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
  },

  // estilo do subtítulo
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginVertical: 10,
    color: "#2E7D32",
  },

  // botão verde
  buttonPrimary: {
    backgroundColor: "#81C784",
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
    width: "80%",
    alignItems: "center",
  },

  // texto do botão entrar
  buttonTextPrimary: {
    color: "#fff",
    fontWeight: "bold",
  },

  // botão com borda
  buttonOutline: {
    borderWidth: 1,
    borderColor: "#2E7D32",
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
    width: "80%",
    alignItems: "center",
  },

  // texto do botão sair
  buttonTextOutline: {
    color: "#2E7D32",
    fontWeight: "bold",
  },
});
