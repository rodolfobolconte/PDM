import { supabase } from "./supabase";

function pegarToken(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.replace("Bearer ", "");
}

export async function verificarAgricultor(request) {
  const token = pegarToken(request);

  if (!token) {
    return {
      error: {
        status: 401,
        mensagem: "Token não enviado. Faça login novamente.",
      },
    };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return {
      error: {
        status: 401,
        mensagem: "Sessão inválida ou expirada. Faça login novamente.",
      },
    };
  }

  const { data: agricultor, error: erroAgricultor } = await supabase
    .from("agricultor")
    .select("*")
    .eq("email", user.email)
    .maybeSingle();

  if (erroAgricultor || !agricultor) {
    return {
      error: { status: 403, mensagem: "Apenas agricultores podem fazer isso." },
    };
  }

  return { agricultor };
}

export async function verificarGerente(request) {
  const token = pegarToken(request);

  if (!token) {
    return {
      error: {
        status: 401,
        mensagem: "Token não enviado. Faça login novamente.",
      },
    };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return {
      error: {
        status: 401,
        mensagem: "Sessão inválida ou expirada. Faça login novamente.",
      },
    };
  }

  const { data: gerente, error: erroGerente } = await supabase
    .from("gerente")
    .select("*")
    .eq("email", user.email)
    .maybeSingle();

  if (erroGerente || !gerente) {
    return {
      error: { status: 403, mensagem: "Apenas gerentes podem fazer isso." },
    };
  }

  return { gerente };
}
