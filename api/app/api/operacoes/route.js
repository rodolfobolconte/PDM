import { supabase } from "../../../lib/supabase";
import { verificarAgricultor } from "../../../lib/auth";
import { jsonResponse, optionsResponse } from "../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request) {
  const { agricultor, error: erroAuth } = await verificarAgricultor(request);
  if (erroAuth)
    return jsonResponse(
      { sucesso: false, mensagem: erroAuth.mensagem },
      { status: erroAuth.status },
    );

  try {
    const { tipo, id_semente, id_recurso, quantidade } = await request.json();

    console.log("=================================");
    console.log("NOVA OPERAÇÃO RECEBIDA");
    console.log("Agricultor:", agricultor.cpf_agricultor);
    console.log("Tipo:", tipo);
    console.log("Semente:", id_semente);
    console.log("Recurso:", id_recurso);
    console.log("Quantidade:", quantidade);
    console.log("=================================");

    if ((!id_semente && !id_recurso) || (id_semente && id_recurso)) {
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "Informe uma semente ou um recurso, não os dois.",
        },
        { status: 400 },
      );
    }

    if (!tipo || quantidade === undefined) {
      return jsonResponse(
        { sucesso: false, mensagem: "Preencha todos os campos." },
        { status: 400 },
      );
    }

    if (tipo !== "solicitação" && tipo !== "doação") {
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "Tipo inválido. Use 'solicitação' ou 'doação'.",
        },
        { status: 400 },
      );
    }

    if (isNaN(quantidade) || quantidade <= 0) {
      return jsonResponse(
        { sucesso: false, mensagem: "A quantidade deve ser maior que zero." },
        { status: 400 },
      );
    }

    if (id_semente) {
      const { data: semente, error: erroSemente } = await supabase
        .from("semente")
        .select("*")
        .eq("id_semente", id_semente)
        .maybeSingle();

      if (erroSemente || !semente) {
        return jsonResponse(
          { sucesso: false, mensagem: "Semente não encontrada." },
          { status: 404 },
        );
      }
    } else {
      const { data: recurso, error: erroRecurso } = await supabase
        .from("recurso")
        .select("*")
        .eq("id_recurso", id_recurso)
        .maybeSingle();

      if (erroRecurso || !recurso) {
        return jsonResponse(
          { sucesso: false, mensagem: "Recurso não encontrado." },
          { status: 404 },
        );
      }
    }

    const { data: operacao, error: erroOperacao } = await supabase
      .from("operação")
      .insert({
        tipo,
        status: "pendente",
        cpf_agricultor: agricultor.cpf_agricultor,
        id_semente: id_semente ? Number(id_semente) : null,
        id_recurso: id_recurso ? Number(id_recurso) : null,
        quantidade: Number(quantidade),
        data_operação: new Date().toISOString(),
      })
      .select()
      .single();

    if (erroOperacao) {
      console.log("ERRO AO CRIAR OPERAÇÃO:", erroOperacao);
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "Erro ao registrar a operação.",
          erro: erroOperacao.message,
        },
        { status: 500 },
      );
    }

    console.log("OPERAÇÃO CRIADA COM SUCESSO!");

    return jsonResponse(
      {
        sucesso: true,
        mensagem: "Solicitação enviada! Aguarde a aprovação do gerente.",
        operacao,
      },
      { status: 201 },
    );
  } catch (erro) {
    console.log("ERRO INTERNO AO CRIAR OPERAÇÃO:", erro);
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
