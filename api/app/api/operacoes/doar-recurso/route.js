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
    const { nome_recurso, quantidade } = await request.json();

    console.log("=================================");
    console.log("NOVA DOAÇÃO DE RECURSO RECEBIDA");
    console.log("Agricultor:", agricultor.cpf_agricultor);
    console.log("Nome:", nome_recurso);
    console.log("Quantidade:", quantidade);
    console.log("=================================");

    if (!nome_recurso || quantidade === undefined) {
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

    let { data: recurso, error: erroBusca } = await supabase
      .from("recurso")
      .select("*")
      .ilike("nome_recurso", nome_recurso.trim())
      .maybeSingle();

    if (erroBusca) {
      console.log("ERRO AO BUSCAR RECURSO:", erroBusca);
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "Erro ao buscar recurso.",
          erro: erroBusca.message,
        },
        { status: 500 },
      );
    }

    if (!recurso) {
      const { data: recursoCriado, error: erroCriar } = await supabase
        .from("recurso")
        .insert({ nome_recurso: nome_recurso.trim(), quantidade: 0 })
        .select()
        .single();

      if (erroCriar) {
        console.log("ERRO AO CRIAR RECURSO:", erroCriar);
        return jsonResponse(
          {
            sucesso: false,
            mensagem: "Erro ao cadastrar o novo recurso.",
            erro: erroCriar.message,
          },
          { status: 500 },
        );
      }

      recurso = recursoCriado;
    }

    const { data: operacao, error: erroOperacao } = await supabase
      .from("operação")
      .insert({
        tipo: "doação",
        status: "pendente",
        cpf_agricultor: agricultor.cpf_agricultor,
        id_recurso: recurso.id_recurso,
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

    console.log("DOAÇÃO DE RECURSO REGISTRADA COM SUCESSO!");

    return jsonResponse(
      {
        sucesso: true,
        mensagem: "Doação enviada! Aguarde a aprovação do gerente.",
        operacao,
      },
      { status: 201 },
    );
  } catch (erro) {
    console.log("ERRO INTERNO AO DOAR RECURSO:", erro);
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
