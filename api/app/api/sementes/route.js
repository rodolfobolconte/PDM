import { supabase } from "../../../lib/supabase";
import { verificarGerente } from "../../../lib/auth";
import { jsonResponse, optionsResponse } from "../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("semente")
      .select("*")
      .order("tipo", { ascending: true });

    console.log("=================================");
    console.log("BUSCA DE SEMENTES");
    console.log("DATA:", data);
    console.log("ERRO:", error);
    console.log("=================================");

    if (error) {
      console.log("ERRO AO BUSCAR SEMENTES:", error);
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "Erro ao buscar sementes.",
          erro: error.message,
        },
        { status: 500 },
      );
    }

    return jsonResponse({ sucesso: true, sementes: data });
  } catch (erro) {
    console.log("ERRO INTERNO AO BUSCAR SEMENTES:", erro);
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
  const { gerente, error: erroAuth } = await verificarGerente(request);
  if (erroAuth)
    return jsonResponse(
      { sucesso: false, mensagem: erroAuth.mensagem },
      { status: erroAuth.status },
    );

  try {
    const { tipo, subtipo, quantidade } = await request.json();

    console.log("=================================");
    console.log("NOVA SEMENTE RECEBIDA");
    console.log("Gerente:", gerente.email);
    console.log("Tipo:", tipo);
    console.log("Subtipo:", subtipo);
    console.log("Quantidade:", quantidade);
    console.log("=================================");

    if (!tipo || !subtipo || quantidade === undefined) {
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
      .from("semente")
      .select("*")
      .ilike("tipo", tipo.trim())
      .ilike("subtipo", subtipo.trim())
      .maybeSingle();

    if (erroExistente) {
      console.log("ERRO AO VERIFICAR SEMENTE EXISTENTE:", erroExistente);
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "Erro ao verificar sementes existentes.",
          erro: erroExistente.message,
        },
        { status: 500 },
      );
    }

    if (existente) {
      return jsonResponse(
        {
          sucesso: false,
          mensagem: `Já existe uma semente cadastrada com esse tipo e subtipo ("${existente.tipo} - ${existente.subtipo}"). Edite a quantidade dela em vez de criar uma nova.`,
        },
        { status: 409 },
      );
    }

    const { data, error } = await supabase
      .from("semente")
      .insert({
        tipo: tipo.trim(),
        subtipo: subtipo.trim(),
        quantidade: Number(quantidade),
      })
      .select()
      .single();

    if (error) {
      console.log("ERRO AO ADICIONAR SEMENTE:", error);
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "Erro ao adicionar semente.",
          erro: error.message,
        },
        { status: 500 },
      );
    }

    console.log("SEMENTE ADICIONADA COM SUCESSO!");

    return jsonResponse(
      {
        sucesso: true,
        mensagem: "Semente adicionada com sucesso!",
        semente: data,
      },
      { status: 201 },
    );
  } catch (erro) {
    console.log("ERRO INTERNO AO ADICIONAR SEMENTE:", erro);
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
