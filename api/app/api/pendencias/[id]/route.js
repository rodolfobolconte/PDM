import { supabase } from "../../../../lib/supabase";
import { jsonResponse, optionsResponse } from "../../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const { data: pendencia, error: erroBusca } = await supabase
      .from("pendência")
      .select("*")
      .eq("id_pendência", id)
      .maybeSingle();

    if (erroBusca || !pendencia) {
      return jsonResponse(
        { sucesso: false, mensagem: "Pendência não encontrada." },
        { status: 404 },
      );
    }

    const { error: erroOperacao } = await supabase
      .from("operação")
      .update({ id_pendência: null })
      .eq("id_pendência", id);

    if (erroOperacao) {
      console.log("ERRO AO DESVINCULAR OPERAÇÃO:", erroOperacao);
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "Erro ao atualizar a operação.",
          erro: erroOperacao.message,
        },
        { status: 500 },
      );
    }

    const { error: erroExcluir } = await supabase
      .from("pendência")
      .delete()
      .eq("id_pendência", id);

    if (erroExcluir) {
      console.log("ERRO AO EXCLUIR PENDÊNCIA:", erroExcluir);
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "Erro ao excluir a pendência.",
          erro: erroExcluir.message,
        },
        { status: 500 },
      );
    }

    console.log("PENDÊNCIA EXCLUÍDA COM SUCESSO!");

    return jsonResponse({ sucesso: true, mensagem: "Pendência excluída." });
  } catch (erro) {
    console.log("ERRO INTERNO AO EXCLUIR PENDÊNCIA:", erro);
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
