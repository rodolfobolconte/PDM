import { supabase } from "../../../lib/supabase";
import { jsonResponse, optionsResponse } from "../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request) {
  try {
    const { nome, telefone, cpf, email, senha, papel } = await request.json();

    const papelFinal = papel === "gerente" ? "gerente" : "agricultor";

    console.log("=================================");
    console.log("NOVO CADASTRO RECEBIDO");
    console.log("Papel:", papelFinal);
    console.log("Nome:", nome);
    console.log("Telefone:", telefone);
    console.log("CPF:", cpf);
    console.log("Email:", email);
    console.log("=================================");

    if (!nome || !telefone || !cpf || !email || !senha) {
      return jsonResponse(
        { sucesso: false, mensagem: "Preencha todos os campos." },
        { status: 400 },
      );
    }

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

    if (authError) {
      console.log("ERRO AO CRIAR USUÁRIO:", authError.message);
      return jsonResponse(
        { sucesso: false, mensagem: authError.message },
        { status: 400 },
      );
    }

    if (!usuarioAuth.user) {
      return jsonResponse(
        { sucesso: false, mensagem: "Não foi possível criar o usuário." },
        { status: 400 },
      );
    }

    console.log("USUÁRIO AUTH CRIADO:", usuarioAuth.user.id);
    console.log(
      "CADASTRO REALIZADO COM SUCESSO! (trigger cuidou da tabela certa)",
    );

    return jsonResponse(
      {
        sucesso: true,
        mensagem:
          "Cadastro realizado! Verifique seu e-mail para confirmar sua conta.",
        usuario: { nome, telefone, cpf, email, papel: papelFinal },
      },
      { status: 201 },
    );
  } catch (erro) {
    console.log("ERRO INTERNO NO CADASTRO:", erro);
    return jsonResponse(
      {
        sucesso: false,
        mensagem: "Erro interno do servidor.",
        erro: erro.message,
      },
      { status: 500 },
    );
  }
}
