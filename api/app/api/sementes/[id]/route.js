import { supabase } from "../../../../lib/supabase";
import { verificarGerente } from "../../../../lib/auth";
import { jsonResponse, optionsResponse } from "../../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

export async function PUT(request, { params }) {
  const { error: erroAuth } = await verificarGerente(request);
  if (erroAuth)
    return jsonResponse(
      { sucesso: false, mensagem: erroAuth.mensagem },
      { status: erroAuth.status },
    );

  try {
    const { id } = params;
    const { tipo, subtipo, quantidade } = await request.json();

    console.log("=================================");
    console.log("EDITANDO SEMENTE");
    console.log("ID:", id);
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
      .neq("id_semente", id)
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
          mensagem: `Já existe outra semente cadastrada com esse tipo e subtipo ("${existente.tipo} - ${existente.subtipo}").`,
        },
        { status: 409 },
      );
    }

    const { data, error } = await supabase
      .from("semente")
      .update({
        tipo: tipo.trim(),
        subtipo: subtipo.trim(),
        quantidade: Number(quantidade),
      })
      .eq("id_semente", id)
      .select()
      .single();

    if (error) {
      console.log("ERRO AO EDITAR SEMENTE:", error);
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "Erro ao editar semente.",
          erro: error.message,
        },
        { status: 500 },
      );
    }

    if (!data) {
      return jsonResponse(
        { sucesso: false, mensagem: "Semente não encontrada." },
        { status: 404 },
      );
    }

    console.log("SEMENTE EDITADA COM SUCESSO!");

    return jsonResponse({
      sucesso: true,
      mensagem: "Semente editada com sucesso!",
      semente: data,
    });
  } catch (erro) {
    console.log("ERRO INTERNO AO EDITAR SEMENTE:", erro);
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

export async function DELETE(request, { params }) {
  const { error: erroAuth } = await verificarGerente(request);
  if (erroAuth)
    return jsonResponse(
      { sucesso: false, mensagem: erroAuth.mensagem },
      { status: erroAuth.status },
    );

  try {
    const { id } = params;

    console.log("=================================");
    console.log("EXCLUINDO SEMENTE");
    console.log("ID:", id);
    console.log("=================================");

    const { data, error } = await supabase
      .from("semente")
      .delete()
      .eq("id_semente", id)
      .select();

    if (error) {
      console.log("ERRO AO EXCLUIR SEMENTE:", error);
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "Erro ao excluir semente.",
          erro: error.message,
        },
        { status: 500 },
      );
    }

    if (!data || data.length === 0) {
      return jsonResponse(
        { sucesso: false, mensagem: "Semente não encontrada." },
        { status: 404 },
      );
    }

    console.log("SEMENTE EXCLUÍDA COM SUCESSO!");

    return jsonResponse({
      sucesso: true,
      mensagem: "Semente excluída com sucesso!",
    });
  } catch (erro) {
    console.log("ERRO INTERNO AO EXCLUIR SEMENTE:", erro);
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
