import { supabase } from "../../../../../lib/supabase";
import { verificarGerente } from "../../../../../lib/auth";
import { jsonResponse, optionsResponse } from "../../../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

const DIAS_VALIDADE_PENDENCIA = 30;

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

    const tabela = operacao.id_semente ? "semente" : "recurso";
    const colunaId = operacao.id_semente ? "id_semente" : "id_recurso";
    const idItem = operacao.id_semente || operacao.id_recurso;

    const { data: item, error: erroItem } = await supabase
      .from(tabela)
      .select("*")
      .eq(colunaId, idItem)
      .maybeSingle();

    if (erroItem || !item) {
      return jsonResponse(
        {
          sucesso: false,
          mensagem: `${tabela === "semente" ? "Semente" : "Recurso"} da operação não foi encontrado(a).`,
        },
        { status: 404 },
      );
    }

    let novaQuantidade;

    if (operacao.tipo === "solicitação") {
      if (item.quantidade < operacao.quantidade) {
        return jsonResponse(
          {
            sucesso: false,
            mensagem: "Estoque insuficiente para aprovar essa solicitação.",
          },
          { status: 400 },
        );
      }
      novaQuantidade = item.quantidade - operacao.quantidade;
    } else {
      novaQuantidade = item.quantidade + operacao.quantidade;
    }

    const { error: erroAtualizarItem } = await supabase
      .from(tabela)
      .update({ quantidade: novaQuantidade })
      .eq(colunaId, idItem);

    if (erroAtualizarItem) {
      console.log("ERRO AO ATUALIZAR ESTOQUE:", erroAtualizarItem);
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "Erro ao atualizar o estoque.",
          erro: erroAtualizarItem.message,
        },
        { status: 500 },
      );
    }

    let pendencia = null;

    if (operacao.tipo === "solicitação") {
      const dataValidade = new Date();
      dataValidade.setDate(dataValidade.getDate() + DIAS_VALIDADE_PENDENCIA);

      const { data: pendenciaCriada, error: erroPendencia } = await supabase
        .from("pendência")
        .insert({
          id_operação: operacao.id_operação,
          status: "ativa",
          data_validade: dataValidade.toISOString(),
        })
        .select()
        .single();

      if (erroPendencia) {
        console.log("ERRO AO CRIAR PENDÊNCIA:", erroPendencia);
        return jsonResponse(
          {
            sucesso: false,
            mensagem: "Erro ao gerar a pendência.",
            erro: erroPendencia.message,
          },
          { status: 500 },
        );
      }

      pendencia = pendenciaCriada;
    }

    const { error: erroAtualizarOperacao } = await supabase
      .from("operação")
      .update({
        status: "aprovada",
        cpf_gerente: gerente.cpf_gerente,
        id_pendência: pendencia ? pendencia.id_pendência : null,
      })
      .eq("id_operação", operacao.id_operação);

    if (erroAtualizarOperacao) {
      console.log("ERRO AO ATUALIZAR OPERAÇÃO:", erroAtualizarOperacao);
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "Erro ao atualizar a operação.",
          erro: erroAtualizarOperacao.message,
        },
        { status: 500 },
      );
    }

    console.log(
      pendencia
        ? "OPERAÇÃO APROVADA E PENDÊNCIA CRIADA COM SUCESSO!"
        : "DOAÇÃO APROVADA COM SUCESSO!",
    );

    return jsonResponse({
      sucesso: true,
      mensagem: pendencia
        ? "Operação aprovada e pendência criada."
        : "Doação aprovada com sucesso.",
      pendencia,
    });
  } catch (erro) {
    console.log("ERRO INTERNO AO APROVAR:", erro);
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
