import { supabase } from "../../../lib/supabase";
import { verificarGerente } from "../../../lib/auth";
import { jsonResponse, optionsResponse } from "../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("recurso")
      .select("*")
      .order("nome_recurso", { ascending: true });

    if (error) {
      console.log("ERRO AO BUSCAR RECURSOS:", error);
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "Erro ao buscar recursos.",
          erro: error.message,
        },
        { status: 500 },
      );
    }

    return jsonResponse({ sucesso: true, recursos: data });
  } catch (erro) {
    console.log("ERRO INTERNO AO BUSCAR RECURSOS:", erro);
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

export async function POST(request) {
  const { error: erroAuth } = await verificarGerente(request);
  if (erroAuth)
    return jsonResponse(
      { sucesso: false, mensagem: erroAuth.mensagem },
      { status: erroAuth.status },
    );

  try {
    const { nome_recurso, quantidade } = await request.json();

    if (!nome_recurso || quantidade === undefined) {
      return jsonResponse(
        { sucesso: false, mensagem: "Preencha todos os campos." },
        { status: 400 },
      );
    }

    if (isNaN(quantidade) || quantidade < 0) {
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "A quantidade deve ser um número maior ou igual a zero.",
        },
        { status: 400 },
      );
    }

    const { data: existente, error: erroExistente } = await supabase
      .from("recurso")
      .select("*")
      .ilike("nome_recurso", nome_recurso.trim())
      .maybeSingle();

    if (erroExistente) {
      console.log("ERRO AO VERIFICAR RECURSO EXISTENTE:", erroExistente);
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "Erro ao verificar recursos existentes.",
          erro: erroExistente.message,
        },
        { status: 500 },
      );
    }

    if (existente) {
      return jsonResponse(
        {
          sucesso: false,
          mensagem: `Já existe um recurso cadastrado com esse nome ("${existente.nome_recurso}"). Edite a quantidade dele em vez de criar um novo.`,
        },
        { status: 409 },
      );
    }

    const { data, error } = await supabase
      .from("recurso")
      .insert({
        nome_recurso: nome_recurso.trim(),
        quantidade: Number(quantidade),
      })
      .select()
      .single();

    if (error) {
      console.log("ERRO AO ADICIONAR RECURSO:", error);
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "Erro ao adicionar recurso.",
          erro: error.message,
        },
        { status: 500 },
      );
    }

    return jsonResponse(
      {
        sucesso: true,
        mensagem: "Recurso adicionado com sucesso!",
        recurso: data,
      },
      { status: 201 },
    );
  } catch (erro) {
    console.log("ERRO INTERNO AO ADICIONAR RECURSO:", erro);
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
