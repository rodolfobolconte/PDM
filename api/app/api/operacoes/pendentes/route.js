import { supabase } from "../../../../lib/supabase";
import { verificarGerente } from "../../../../lib/auth";
import { jsonResponse, optionsResponse } from "../../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(request) {
  const { error: erroAuth } = await verificarGerente(request);
  if (erroAuth)
    return jsonResponse(
      { sucesso: false, mensagem: erroAuth.mensagem },
      { status: erroAuth.status },
    );

  try {
    const { data: operacoes, error: erroOperacoes } = await supabase
      .from("operação")
      .select("*")
      .eq("status", "pendente")
      .order("data_operação", { ascending: true });

    if (erroOperacoes) {
      console.log("ERRO AO BUSCAR OPERAÇÕES:", erroOperacoes);
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "Erro ao buscar operações pendentes.",
          erro: erroOperacoes.message,
        },
        { status: 500 },
      );
    }

    const { data: agricultores } = await supabase
      .from("agricultor")
      .select("cpf_agricultor, nome, telefone");
    const { data: sementes } = await supabase
      .from("semente")
      .select("id_semente, tipo, subtipo, quantidade");
    const { data: recursos } = await supabase
      .from("recurso")
      .select("id_recurso, nome_recurso, quantidade");

    const mapaAgricultores = {};
    (agricultores || []).forEach((a) => {
      mapaAgricultores[a.cpf_agricultor] = {
        nome: a.nome,
        telefone: a.telefone,
      };
    });

    const mapaSementes = {};
    (sementes || []).forEach((s) => {
      mapaSementes[s.id_semente] = s;
    });

    const mapaRecursos = {};
    (recursos || []).forEach((r) => {
      mapaRecursos[r.id_recurso] = r;
    });

    const resultado = operacoes.map((operacao) => {
      const agricultorInfo = mapaAgricultores[operacao.cpf_agricultor] || {};

      return {
        id_operação: operacao.id_operação,
        tipo: operacao.tipo,
        quantidade: operacao.quantidade,
        data_operação: operacao.data_operação,
        cpf_agricultor: operacao.cpf_agricultor,
        nome_agricultor: agricultorInfo.nome || "Desconhecido",
        telefone_agricultor: agricultorInfo.telefone || null,
        semente: operacao.id_semente
          ? mapaSementes[operacao.id_semente] || null
          : null,
        recurso: operacao.id_recurso
          ? mapaRecursos[operacao.id_recurso] || null
          : null,
      };
    });

    return jsonResponse({ sucesso: true, operacoes: resultado });
  } catch (erro) {
    console.log("ERRO INTERNO AO BUSCAR PENDENTES:", erro);
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
