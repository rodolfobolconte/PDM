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
      .neq("id_recurso", id)
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
          mensagem: `Já existe outro recurso cadastrado com esse nome ("${existente.nome_recurso}").`,
        },
        { status: 409 },
      );
    }

    const { data, error } = await supabase
      .from("recurso")
      .update({
        nome_recurso: nome_recurso.trim(),
        quantidade: Number(quantidade),
      })
      .eq("id_recurso", id)
      .select()
      .single();

    if (error) {
      console.log("ERRO AO EDITAR RECURSO:", error);
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "Erro ao editar recurso.",
          erro: error.message,
        },
        { status: 500 },
      );
    }

    if (!data) {
      return jsonResponse(
        { sucesso: false, mensagem: "Recurso não encontrado." },
        { status: 404 },
      );
    }

    return jsonResponse({
      sucesso: true,
      mensagem: "Recurso editado com sucesso!",
      recurso: data,
    });
  } catch (erro) {
    console.log("ERRO INTERNO AO EDITAR RECURSO:", erro);
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

    const { data, error } = await supabase
      .from("recurso")
      .delete()
      .eq("id_recurso", id)
      .select();

    if (error) {
      console.log("ERRO AO EXCLUIR RECURSO:", error);
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "Erro ao excluir recurso.",
          erro: error.message,
        },
        { status: 500 },
      );
    }

    if (!data || data.length === 0) {
      return jsonResponse(
        { sucesso: false, mensagem: "Recurso não encontrado." },
        { status: 404 },
      );
    }

    return jsonResponse({
      sucesso: true,
      mensagem: "Recurso excluído com sucesso!",
    });
  } catch (erro) {
    console.log("ERRO INTERNO AO EXCLUIR RECURSO:", erro);
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
