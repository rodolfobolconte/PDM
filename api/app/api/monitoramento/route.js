import { supabase } from "../../../lib/supabase";
import { jsonResponse, optionsResponse } from "../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const { data: agricultores, error: erroAgricultores } = await supabase
      .from("agricultor")
      .select("cpf_agricultor, nome");

    if (erroAgricultores) {
      console.log("ERRO AO BUSCAR AGRICULTORES:", erroAgricultores);
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "Erro ao buscar agricultores.",
          erro: erroAgricultores.message,
        },
        { status: 500 },
      );
    }

    const { data: pendencias, error: erroPendencias } = await supabase
      .from("pendência")
      .select("id_pendência, id_operação");

    if (erroPendencias) {
      console.log("ERRO AO BUSCAR PENDÊNCIAS:", erroPendencias);
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "Erro ao buscar pendências.",
          erro: erroPendencias.message,
        },
        { status: 500 },
      );
    }

    const { data: operacoes, error: erroOperacoes } = await supabase
      .from("operação")
      .select("id_operação, cpf_agricultor");

    if (erroOperacoes) {
      console.log("ERRO AO BUSCAR OPERAÇÕES:", erroOperacoes);
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "Erro ao buscar operações.",
          erro: erroOperacoes.message,
        },
        { status: 500 },
      );
    }

    const mapaOperacaoParaAgricultor = {};
    operacoes.forEach((operacao) => {
      mapaOperacaoParaAgricultor[operacao.id_operação] =
        operacao.cpf_agricultor;
    });

    const contagemPorAgricultor = {};
    pendencias.forEach((pendencia) => {
      const cpf = mapaOperacaoParaAgricultor[pendencia.id_operação];
      if (!cpf) return;
      contagemPorAgricultor[cpf] = (contagemPorAgricultor[cpf] || 0) + 1;
    });

    const resultado = agricultores.map((agricultor) => ({
      cpf_agricultor: agricultor.cpf_agricultor,
      nome: agricultor.nome,
      pendencias: contagemPorAgricultor[agricultor.cpf_agricultor] || 0,
    }));

    return jsonResponse({ sucesso: true, agricultores: resultado });
  } catch (erro) {
    console.log("ERRO INTERNO NO MONITORAMENTO:", erro);
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
