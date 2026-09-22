import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { useRouter } from "expo-router";
import { useState } from "react";
import * as SecureStore from "expo-secure-store";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function fazerLogin() {
    if (!email || !senha) {
      Alert.alert("Atenção", "Digite o email e a senha.");
      return;
    }

    try {
      const resposta = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            senha: senha,
          }),
        },
      );

      const resultado = await resposta.json();

      if (!resposta.ok) {
        Alert.alert(
          "Erro no login",
          resultado.mensagem || "Email ou senha incorretos.",
        );
        return;
      }

      if (!resultado.usuario) {
        Alert.alert("Erro", "Não foi possível encontrar o usuário.");
        return;
      }

      // O app mobile é só para agricultor - gerente usa o site
      if (resultado.usuario.papel !== "agricultor") {
        Alert.alert(
          "Acesso negado",
          "Essa conta é de gerente. Use o site para acessar.",
        );
        return;
      }

      // Guarda o token de sessão e os dados do usuário
      await SecureStore.setItemAsync(
        "supabase_session",
        JSON.stringify(resultado.session),
      );
      await SecureStore.setItemAsync(
        "usuario",
        JSON.stringify(resultado.usuario),
      );

      router.replace("/homepage/home");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível conectar com o servidor.");
    }
  }

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={150}
      showsVerticalScrollIndicator={false}
    >
      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
      />

      <Text style={styles.title}>Seja bem vindo!</Text>
      <Text style={styles.subtitle}>Faça seu login</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#8c958d"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Senha"
        placeholderTextColor="#8c958d"
        secureTextEntry
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity style={styles.button} onPress={fazerLogin}>
        <Text style={styles.buttonText}>Acessar</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Não tem uma conta?</Text>

      <TouchableOpacity onPress={() => router.push("/registrar")}>
        <Text style={styles.link}>Registra-se</Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecf0e9",
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 180,
    paddingBottom: 120,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    color: "#4CAF50",
  },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#4CAF50",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#81C784",
    width: "80%",
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  footer: {
    marginTop: 15,
    fontSize: 12,
    color: "#4CAF50",
  },
  link: {
    color: "#2E7D32",
    fontWeight: "bold",
    marginTop: 5,
  },
});
