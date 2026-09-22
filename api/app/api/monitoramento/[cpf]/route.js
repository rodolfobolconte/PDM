import { supabase } from "../../../../lib/supabase";
import { jsonResponse, optionsResponse } from "../../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(request, { params }) {
  try {
    const { cpf } = params;

    const { data: operacoes, error: erroOperacoes } = await supabase
      .from("operação")
      .select("*")
      .eq("cpf_agricultor", cpf)
      .not("id_pendência", "is", null);

    if (erroOperacoes) {
      console.log("ERRO AO BUSCAR OPERAÇÕES DO AGRICULTOR:", erroOperacoes);
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "Erro ao buscar pendências do agricultor.",
          erro: erroOperacoes.message,
        },
        { status: 500 },
      );
    }

    if (!operacoes || operacoes.length === 0) {
      return jsonResponse({ sucesso: true, pendencias: [] });
    }

    const idsPendencia = operacoes.map((o) => o.id_pendência);

    const { data: pendencias, error: erroPendencias } = await supabase
      .from("pendência")
      .select("*")
      .in("id_pendência", idsPendencia);

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

    const { data: sementes } = await supabase
      .from("semente")
      .select("id_semente, tipo, subtipo");
    const { data: recursos } = await supabase
      .from("recurso")
      .select("id_recurso, nome_recurso");

    const mapaSementes = {};
    (sementes || []).forEach((s) => {
      mapaSementes[s.id_semente] = s;
    });

    const mapaRecursos = {};
    (recursos || []).forEach((r) => {
      mapaRecursos[r.id_recurso] = r;
    });

    const mapaPendencias = {};
    (pendencias || []).forEach((p) => {
      mapaPendencias[p.id_pendência] = p;
    });

    const resultado = operacoes.map((operacao) => {
      const pendencia = mapaPendencias[operacao.id_pendência] || {};
      const semente = operacao.id_semente
        ? mapaSementes[operacao.id_semente]
        : null;
      const recurso = operacao.id_recurso
        ? mapaRecursos[operacao.id_recurso]
        : null;

      return {
        id_operação: operacao.id_operação,
        id_pendência: operacao.id_pendência,
        tipo_operação: operacao.tipo,
        quantidade: operacao.quantidade,
        data_operação: operacao.data_operação,
        tipo: semente ? semente.tipo : recurso ? recurso.nome_recurso : null,
        subtipo: semente ? semente.subtipo : null,
        status_pendencia: pendencia.status || null,
        data_validade: pendencia.data_validade || null,
      };
    });

    resultado.sort(
      (a, b) => new Date(b.data_operação) - new Date(a.data_operação),
    );

    return jsonResponse({ sucesso: true, pendencias: resultado });
  } catch (erro) {
    console.log("ERRO INTERNO AO BUSCAR PENDÊNCIAS DO AGRICULTOR:", erro);
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
