import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

export default function SolicitarRecurso() {
  const router = useRouter();

  const [recursos, setRecursos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [modalVisivel, setModalVisivel] = useState(false);
  const [recursoSelecionado, setRecursoSelecionado] = useState<any>(null);
  const [quantidade, setQuantidade] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function carregarRecursos() {
    try {
      const resposta = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/recursos`,
      );
      const resultado = await resposta.json();

      if (resposta.ok && resultado.sucesso) {
        setRecursos(resultado.recursos.filter((r: any) => r.quantidade > 0));
      } else {
        Alert.alert("Erro", "Não foi possível carregar os recursos.");
      }
    } catch (erro) {
      Alert.alert("Erro", "Não foi possível conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarRecursos();
  }, []);

  function abrirModal(recurso: any) {
    setRecursoSelecionado(recurso);
    setQuantidade("");
    setModalVisivel(true);
  }

  async function enviarSolicitacao() {
    if (!quantidade || isNaN(Number(quantidade)) || Number(quantidade) <= 0) {
      Alert.alert("Atenção", "Digite uma quantidade válida.");
      return;
    }

    if (Number(quantidade) > recursoSelecionado.quantidade) {
      Alert.alert(
        "Atenção",
        `Só há ${recursoSelecionado.quantidade} unidade(s) disponível(is) de ${recursoSelecionado.nome_recurso}.`,
      );
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
        `${process.env.EXPO_PUBLIC_API_URL}/operacoes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tipo: "solicitação",
            id_recurso: recursoSelecionado.id_recurso,
            quantidade: Number(quantidade),
          }),
        },
      );

      const resultado = await resposta.json();

      if (!resposta.ok) {
        Alert.alert(
          "Erro",
          resultado.mensagem || "Não foi possível enviar a solicitação.",
        );
        return;
      }

      Alert.alert("Sucesso", resultado.mensagem || "Solicitação enviada!");
      setModalVisivel(false);
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
        onPress={() => router.push("../Operacao/solicitar")}
      >
        <Ionicons name="chevron-back" size={20} color="#4CAF50" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Recursos</Text>

      <FlatList
        data={recursos}
        keyExtractor={(item) => String(item.id_recurso)}
        style={{ width: "100%" }}
        contentContainerStyle={styles.lista}
        refreshing={carregando}
        onRefresh={carregarRecursos}
        ListEmptyComponent={
          !carregando ? (
            <Text style={styles.vazio}>
              Nenhum subtipo de recurso disponível.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => abrirModal(item)}
          >
            <Text style={styles.buttonText}>{item.nome_recurso}</Text>
            <Text style={styles.quantidadeDisponivel}>
              {item.quantidade} un.
            </Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalVisivel} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalFundo}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalCaixa}>
              <Text style={styles.modalTitulo}>
                Solicitar {recursoSelecionado?.nome_recurso}
              </Text>

              <Text style={styles.label}>Quantidade</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={quantidade}
                onChangeText={setQuantidade}
                placeholder={`Máximo disponível: ${recursoSelecionado?.quantidade ?? 0}`}
              />

              <TouchableOpacity
                style={styles.botaoEnviar}
                onPress={enviarSolicitacao}
                disabled={enviando}
              >
                <Text style={styles.botaoEnviarTexto}>
                  {enviando ? "Enviando..." : "Solicitar"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setModalVisivel(false)}>
                <Text style={styles.cancelar}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
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
    marginBottom: 30,
    alignSelf: "flex-start",
    marginLeft: 30,
  },
  lista: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 40,
  },
  vazio: {
    color: "#8c958d",
    marginTop: 20,
  },
  card: {
    width: "85%",
    height: 70,
    borderWidth: 1,
    borderColor: "#A5D6A7",
    borderRadius: 15,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  buttonText: {
    color: "#1c8020",
    fontWeight: "bold",
    fontSize: 16,
  },
  quantidadeDisponivel: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  modalFundo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCaixa: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1c8020",
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    color: "#1c8020",
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#4CAF50",
    borderRadius: 10,
    height: 46,
    paddingHorizontal: 14,
  },
  botaoEnviar: {
    backgroundColor: "#1c8020",
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 22,
  },
  botaoEnviarTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelar: {
    textAlign: "center",
    color: "#999",
    marginTop: 14,
  },
});
