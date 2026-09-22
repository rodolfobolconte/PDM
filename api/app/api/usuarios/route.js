import { supabase } from "../../../lib/supabase";
import { jsonResponse, optionsResponse } from "../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const { data, error } = await supabase.from("agricultor").select("*");

    if (error) {
      console.log("ERRO DO SUPABASE:", error);
      return jsonResponse(
        {
          sucesso: false,
          mensagem: "Erro ao buscar agricultores.",
          erro: error.message,
        },
        { status: 500 },
      );
    }

    return jsonResponse({ sucesso: true, usuarios: data });
  } catch (erro) {
    console.log("ERRO INTERNO:", erro);
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
