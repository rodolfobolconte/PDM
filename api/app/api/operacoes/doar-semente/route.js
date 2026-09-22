import { supabase } from "../../../../lib/supabase";
import { verificarAgricultor } from "../../../../lib/auth";
import { jsonResponse, optionsResponse } from "../../../../lib/cors";

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
    const { tipo, subtipo, quantidade } = await request.json();

    console.log("=================================");
    console.log("NOVA DOAÇÃO DE SEMENTE RECEBIDA");
    console.log("Agricultor:", agricultor.cpf_agricultor);
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

    if (isNaN(quantidade) || quantidade <= 0) {
      return jsonResponse(
        { sucesso: false, mensagem: "A quantidade deve ser maior que zero." },
        { status: 400 },
      );
    }

    let { data: semente, error: erroBusca } = await supabase
      .from("semente")
      .select("*")
      .ilike("tipo", tipo.trim())
      .ilike("subtipo", subtipo.trim())
      .maybeSingle();

    if (erroBusca) {
      console.log("ERRO AO BUSCAR SEMENTE:", erroBusca);
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "Erro ao buscar semente.",
          erro: erroBusca.message,
        },
        { status: 500 },
      );
    }

    if (!semente) {
      const { data: sementeCriada, error: erroCriar } = await supabase
        .from("semente")
        .insert({ tipo, subtipo: subtipo.trim(), quantidade: 0 })
        .select()
        .single();

      if (erroCriar) {
        console.log("ERRO AO CRIAR SEMENTE:", erroCriar);
        return jsonResponse(
          {
            sucesso: false,
            mensagem: "Erro ao cadastrar o novo tipo de semente.",
            erro: erroCriar.message,
          },
          { status: 500 },
        );
      }

      semente = sementeCriada;
    }

    const { data: operacao, error: erroOperacao } = await supabase
      .from("operação")
      .insert({
        tipo: "doação",
        status: "pendente",
        cpf_agricultor: agricultor.cpf_agricultor,
        id_semente: semente.id_semente,
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
          mensagem: "Erro ao registrar a doação.",
          erro: erroOperacao.message,
        },
        { status: 500 },
      );
    }

    console.log("DOAÇÃO DE SEMENTE REGISTRADA COM SUCESSO!");

    return jsonResponse(
      {
        sucesso: true,
        mensagem: "Doação enviada! Aguarde a aprovação do gerente.",
        operacao,
      },
      { status: 201 },
    );
  } catch (erro) {
    console.log("ERRO INTERNO AO DOAR SEMENTE:", erro);
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
