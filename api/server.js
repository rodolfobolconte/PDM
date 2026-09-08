const express = require("express");
const cors = require("cors");
const supabase = require("./supabase");
const sementesRoutes = require("./routes/sementes");
const recursosRoutes = require("./routes/recursos");
const operacoesRoutes = require("./routes/operacoes");
const monitoramentoRoutes = require("./routes/monitoramento");
const pendenciasRoutes = require("./routes/pendencias");

const app = express();

app.use(cors());
app.use(express.json());

// ROTA PRINCIPAL

app.get("/", (req, res) => {
  res.json({
    sucesso: true,
    mensagem: "API do TRSS funcionando!",
  });
});

app.use("/sementes", sementesRoutes);
app.use("/recursos", recursosRoutes);
app.use("/operacoes", operacoesRoutes);
app.use("/monitoramento", monitoramentoRoutes);
app.use("/pendencias", pendenciasRoutes);

// POST /cadastro
//cria um novo usuário, sendo agricultor ou gerente

app.post("/cadastro", async (req, res) => {
  try {
    const { nome, telefone, cpf, email, senha, papel } = req.body;

    // Só aceita um agricultor ou gerente

    const papelFinal = papel === "gerente" ? "gerente" : "agricultor";

    console.log("=================================");
    console.log("NOVO CADASTRO RECEBIDO");
    console.log("Papel:", papelFinal);
    console.log("Nome:", nome);
    console.log("Telefone:", telefone);
    console.log("CPF:", cpf);
    console.log("Email:", email);
    console.log("=================================");

    // fazer a verificação se todos os campos abaixo foram enviados
    if (!nome || !telefone || !cpf || !email || !senha) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Preencha todos os campos.",
      });
    }

    // cria o usuario no supa auth

    const { data: usuarioAuth, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: {
        data: {
          nome: nome.trim(),
          telefone: telefone.trim(),
          cpf: cpf.trim(),
          papel: papelFinal,
        },
      },
    });

    // se der erro ao criar conta:

    if (authError) {
      console.log("ERRO AO CRIAR USUÁRIO:", authError.message);

      return res.status(400).json({
        sucesso: false,
        mensagem: authError.message,
      });
    }

    // olha se o supa criou o usuário
    if (!usuarioAuth.user) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Não foi possível criar o usuário.",
      });
    }

    console.log("USUÁRIO AUTH CRIADO:", usuarioAuth.user.id);
    console.log(
      "CADASTRO REALIZADO COM SUCESSO! (trigger cuidou da tabela certa)",
    );

    // resposta que tem que aparecer no mobile:

    res.status(201).json({
      sucesso: true,
      mensagem:
        "Cadastro realizado! Verifique seu e-mail para confirmar sua conta.",
      usuario: {
        nome,
        telefone,
        cpf,
        email,
        papel: papelFinal,
      },
    });
  } catch (erro) {
    console.log("ERRO INTERNO NO CADASTRO:", erro);

    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
      erro: erro.message,
    });
  }
});

// POST /login
// ao fazer login descobre se é agrricultor ou gerente
// vai buscar nas 2 tabelas

app.post("/login", async (req, res) => {
  try {
    // Pega email e senha enviados e aparece no terminal
    const { email, senha } = req.body;

    console.log("=================================");
    console.log("TENTATIVA DE LOGIN");
    console.log("Email:", email);
    console.log("=================================");

    if (!email || !senha) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Digite o email e a senha.",
      });
    }

    // login no supa auth

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    if (error || !data.user) {
      console.log("ERRO NO LOGIN:", error?.message);

      return res.status(401).json({
        sucesso: false,
        mensagem: "Email ou senha incorretos.",
      });
    }

    console.log("LOGIN NO AUTH REALIZADO COM SUCESSO!");

    // vai buscar nas 2 tabelas

    const { data: agricultor, error: erroAgricultor } = await supabase
      .from("agricultor")
      .select("*")
      .eq("email", data.user.email)
      .maybeSingle(); //isso aq não vai dar erro caso n apareça nada

    if (erroAgricultor) {
      console.log("ERRO AO BUSCAR AGRICULTOR:", erroAgricultor.message);
    }

    if (agricultor) {
      console.log("USUÁRIO É AGRICULTOR!");

      return res.json({
        sucesso: true,
        mensagem: "Login realizado com sucesso!",
        usuario: { ...agricultor, papel: "agricultor" },
        session: data.session,
      });
    }

    const { data: gerente, error: erroGerente } = await supabase
      .from("gerente")
      .select("*")
      .eq("email", data.user.email)
      .maybeSingle();

    if (erroGerente) {
      console.log("ERRO AO BUSCAR GERENTE:", erroGerente.message);
    }

    if (gerente) {
      console.log("USUÁRIO É GERENTE!");

      return res.json({
        sucesso: true,
        mensagem: "Login realizado com sucesso!",
        usuario: { ...gerente, papel: "gerente" },
        session: data.session,
      });
    }

    console.log("USUÁRIO NÃO ENCONTRADO EM NENHUMA TABELA");

    //erro de conexão

    return res.status(500).json({
      sucesso: false,
      mensagem: "Login feito, mas não foi possível carregar seus dados.",
    });
  } catch (erro) {
    console.log("ERRO INTERNO NO LOGIN:", erro);

    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
      erro: erro.message,
    });
  }
});

// GET /usuarios

app.get("/usuarios", async (req, res) => {
  try {
    const { data, error } = await supabase.from("agricultor").select("*");

    if (error) {
      console.log("ERRO DO SUPABASE:", error);

      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao buscar agricultores.",
        erro: error.message,
      });
    }

    res.json({
      sucesso: true,
      usuarios: data,
    });
  } catch (erro) {
    console.log("ERRO INTERNO:", erro);

    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
      erro: erro.message,
    });
  }
});

// INICIA O SERVIDOR

const PORTA = 3000;

app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
