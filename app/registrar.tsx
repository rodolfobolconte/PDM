import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { useRouter } from "expo-router";
import { useState } from "react";

export default function Registrar() {
  const router = useRouter();

  // Estados dos campos
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // Função responsável pelo cadastro
  async function cadastrar() {
    console.log("=================================");
    console.log("1 - BOTÃO CADASTRAR CLICADO");
    console.log("=================================");

    // Verifica se todos os campos foram preenchidos
    if (!nome || !telefone || !cpf || !email || !senha || !confirmarSenha) {
      Alert.alert("Atenção", "Preencha todos os campos.");

      console.log("2 - ALGUM CAMPO ESTÁ VAZIO");

      return;
    }

    console.log("3 - TODOS OS CAMPOS FORAM PREENCHIDOS");

    // Verifica se as senhas são iguais
    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não são iguais.");

      console.log("4 - AS SENHAS SÃO DIFERENTES");

      return;
    }

    console.log("5 - AS SENHAS SÃO IGUAIS");

    try {
      console.log("6 - ENVIANDO DADOS PARA A API");

      // Verifica se o endereço da API foi encontrado
      const enderecoAPI = process.env.EXPO_PUBLIC_API_URL;
      console.log("=================================");
      console.log("TESTE DA API");
      console.log("ENDEREÇO:", process.env.EXPO_PUBLIC_API_URL);
      console.log("=================================");

      console.log("ENDEREÇO DA API:", enderecoAPI);

      if (!enderecoAPI) {
        Alert.alert("Erro", "O endereço da API não foi encontrado no .env.");

        console.log("ERRO: EXPO_PUBLIC_API_URL não encontrada.");

        return;
      }

      // Envia os dados do cadastro para a API
      const resposta = await fetch(`${enderecoAPI}/api/cadastro`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          nome: nome.trim(),
          telefone: telefone.trim(),
          cpf: cpf.trim(),
          email: email.trim(),
          senha: senha,
        }),
      });

      console.log("7 - RESPOSTA RECEBIDA DA API");

      // Converte a resposta para JSON
      const resultado = await resposta.json();

      console.log("RESULTADO DA API:", resultado);

      // Verifica se a API retornou erro
      if (!resposta.ok) {
        console.log("ERRO DA API:", resultado);

        Alert.alert(
          "Erro no cadastro",
          resultado.mensagem || "Não foi possível realizar o cadastro.",
        );

        return;
      }

      console.log("8 - CADASTRO REALIZADO COM SUCESSO");

      console.log("USUÁRIO:", resultado.usuario);

      // Mostra mensagem de sucesso
      Alert.alert("Cadastro realizado!", "Sua conta foi criada com sucesso!", [
        {
          text: "OK",

          onPress: () => {
            router.replace("/login");
          },
        },
      ]);
    } catch (error) {
      console.log("ERRO AO CONECTAR COM A API:", error);

      Alert.alert("Erro", "Não foi possível conectar com o servidor.");
    }
  }

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={100}
      showsVerticalScrollIndicator={false}
    >
      {/* Título */}
      <Text style={styles.title}>Cadastramento de usuario</Text>

      {/* Nome */}
      <Text style={styles.label}>Nome completo</Text>

      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Digite seu nome"
        placeholderTextColor="#8c958d"
      />

      {/* Telefone */}
      <Text style={styles.label}>Telefone</Text>

      <TextInput
        style={styles.input}
        value={telefone}
        onChangeText={setTelefone}
        placeholder="Digite seu telefone"
        placeholderTextColor="#8c958d"
        keyboardType="phone-pad"
      />

      {/* CPF */}
      <Text style={styles.label}>CPF</Text>

      <TextInput
        style={styles.input}
        value={cpf}
        onChangeText={setCpf}
        placeholder="Digite seu CPF"
        placeholderTextColor="#8c958d"
        keyboardType="numeric"
      />

      {/* Email */}
      <Text style={styles.label}>Email</Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Digite seu email"
        placeholderTextColor="#8c958d"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Senha */}
      <Text style={styles.label}>Senha</Text>

      <TextInput
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
        placeholder="Digite sua senha"
        placeholderTextColor="#8c958d"
        secureTextEntry
      />

      {/* Confirmar senha */}
      <Text style={styles.label}>Confirmar senha</Text>

      <TextInput
        style={styles.input}
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
        placeholder="Digite a senha novamente"
        placeholderTextColor="#8c958d"
        secureTextEntry
      />

      {/* Botão cadastrar */}
      <TouchableOpacity style={styles.button} onPress={cadastrar}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      {/* Voltar para login */}
      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.loginText}>Já tem uma conta? Faça login</Text>
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
    padding: 30,
    paddingTop: 60,
    paddingBottom: 80,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#5DBB63",
    marginBottom: 30,
    textAlign: "center",
  },

  label: {
    color: "#5DBB63",
    marginBottom: 5,
    marginTop: 10,
    fontWeight: "600",
  },

  input: {
    borderWidth: 1,
    borderColor: "#5DBB63",
    borderRadius: 8,
    height: 45,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },

  button: {
    backgroundColor: "#5DBB63",
    height: 50,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  loginText: {
    textAlign: "center",
    marginTop: 20,
    color: "#5DBB63",
    fontWeight: "600",
  },
});
