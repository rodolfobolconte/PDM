import { supabase } from "../../../../../lib/supabase";
import { verificarGerente } from "../../../../../lib/auth";
import { jsonResponse, optionsResponse } from "../../../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

export async function PUT(request, { params }) {
  const { gerente, error: erroAuth } = await verificarGerente(request);
  if (erroAuth)
    return jsonResponse(
      { sucesso: false, mensagem: erroAuth.mensagem },
      { status: erroAuth.status },
    );

  try {
    const { id } = params;

    const { data: operacao, error: erroOperacao } = await supabase
      .from("operação")
      .select("*")
      .eq("id_operação", id)
      .maybeSingle();

    if (erroOperacao || !operacao) {
      return jsonResponse(
        { sucesso: false, mensagem: "Operação não encontrada." },
        { status: 404 },
      );
    }

    if (operacao.status !== "pendente") {
      return jsonResponse(
        { sucesso: false, mensagem: "Essa operação já foi analisada." },
        { status: 400 },
      );
    }

    const { error: erroAtualizar } = await supabase
      .from("operação")
      .update({ status: "recusada", cpf_gerente: gerente.cpf_gerente })
      .eq("id_operação", id);

    if (erroAtualizar) {
      console.log("ERRO AO RECUSAR OPERAÇÃO:", erroAtualizar);
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "Erro ao recusar a operação.",
          erro: erroAtualizar.message,
        },
        { status: 500 },
      );
    }

    console.log("OPERAÇÃO RECUSADA!");

    return jsonResponse({ sucesso: true, mensagem: "Operação recusada." });
  } catch (erro) {
    console.log("ERRO INTERNO AO RECUSAR:", erro);
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
