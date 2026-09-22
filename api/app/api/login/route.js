import { supabase } from "../../../lib/supabase";
import { jsonResponse, optionsResponse } from "../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request) {
  try {
    const { email, senha } = await request.json();

    console.log("=================================");
    console.log("TENTATIVA DE LOGIN");
    console.log("Email:", email);
    console.log("=================================");

    if (!email || !senha) {
      return jsonResponse(
        { sucesso: false, mensagem: "Digite o email e a senha." },
        { status: 400 },
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    if (error || !data.user) {
      console.log("ERRO NO LOGIN:", error?.message);
      return jsonResponse(
        { sucesso: false, mensagem: "Email ou senha incorretos." },
        { status: 401 },
      );
    }

    console.log("LOGIN NO AUTH REALIZADO COM SUCESSO!");

    const { data: agricultor, error: erroAgricultor } = await supabase
      .from("agricultor")
      .select("*")
      .eq("email", data.user.email)
      .maybeSingle();

    if (erroAgricultor) {
      console.log("ERRO AO BUSCAR AGRICULTOR:", erroAgricultor.message);
    }

    if (agricultor) {
      console.log("USUÁRIO É AGRICULTOR!");
      return jsonResponse({
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
      return jsonResponse({
        sucesso: true,
        mensagem: "Login realizado com sucesso!",
        usuario: { ...gerente, papel: "gerente" },
        session: data.session,
      });
    }

    console.log("USUÁRIO NÃO ENCONTRADO EM NENHUMA TABELA");

    return jsonResponse(
      {
        sucesso: false,
        mensagem: "Login feito, mas não foi possível carregar seus dados.",
      },
      { status: 500 },
    );
  } catch (erro) {
    console.log("ERRO INTERNO NO LOGIN:", erro);
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
