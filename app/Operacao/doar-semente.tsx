import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as SecureStore from "expo-secure-store";

const TIPOS = ["Feijão", "Fava", "Outras sementes"];

export default function DoarSemente() {
  const router = useRouter();

  const [tipo, setTipo] = useState("");
  const [subtipo, setSubtipo] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (!tipo || !subtipo || !quantidade) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    if (isNaN(Number(quantidade)) || Number(quantidade) <= 0) {
      Alert.alert("Atenção", "Digite uma quantidade válida.");
      return;
    }

    setEnviando(true);

    try {
      const sessaoSalva = await SecureStore.getItemAsync("supabase_session");

      if (!sessaoSalva) {
        Alert.alert("Erro", "Sua sessão expirou. Faça login novamente.");
        return;
      }

      const sessao = JSON.parse(sessaoSalva);
      const token = sessao?.access_token;

      const resposta = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/operacoes/doar-semente`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tipo,
            subtipo: subtipo.trim(),
            quantidade: Number(quantidade),
          }),
        },
      );

      const resultado = await resposta.json();

      if (!resposta.ok) {
        Alert.alert(
          "Erro",
          resultado.mensagem || "Não foi possível enviar a doação.",
        );
        return;
      }

      Alert.alert("Sucesso", resultado.mensagem || "Doação enviada!", [
        { text: "OK", onPress: () => router.push("/homepage/home") },
      ]);
    } catch (erro) {
      Alert.alert("Erro", "Não foi possível conectar com o servidor.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("../Operacao/doacao")}
      >
        <Ionicons name="chevron-back" size={20} color="#4CAF50" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Doar semente</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Tipo</Text>
        <View style={styles.opcoes}>
          {TIPOS.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.opcaoBotao,
                tipo === item && styles.opcaoBotaoAtiva,
              ]}
              onPress={() => setTipo(item)}
            >
              <Text
                style={[
                  styles.opcaoTexto,
                  tipo === item && styles.opcaoTextoAtivo,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Subtipo</Text>
        <TextInput
          style={styles.input}
          value={subtipo}
          onChangeText={setSubtipo}
          placeholder="Ex: Carioca, Preto, Manteiga..."
        />

        <Text style={styles.label}>Quantidade (garrafas)</Text>
        <TextInput
          style={styles.input}
          value={quantidade}
          onChangeText={setQuantidade}
          keyboardType="numeric"
          placeholder="Digite a quantidade"
        />

        <TouchableOpacity
          style={styles.botaoEnviar}
          onPress={enviar}
          disabled={enviando}
        >
          <Text style={styles.botaoEnviarTexto}>
            {enviando ? "Enviando..." : "Doar"}
          </Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 28,
    fontWeight: "bold",
    color: "#1c8020",
    alignSelf: "flex-start",
    marginLeft: 30,
    marginBottom: 20,
  },
  form: {
    width: "85%",
  },
  label: {
    color: "#1c8020",
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 14,
  },
  opcoes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  opcaoBotao: {
    borderWidth: 1.5,
    borderColor: "#4CAF50",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  opcaoBotaoAtiva: {
    backgroundColor: "#4CAF50",
  },
  opcaoTexto: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  opcaoTextoAtivo: {
    color: "#fff",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#A5D6A7",
    borderRadius: 10,
    height: 46,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
  },
  botaoEnviar: {
    backgroundColor: "#1c8020",
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 26,
  },
  botaoEnviarTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
