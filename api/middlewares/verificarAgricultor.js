const supabase = require("../supabase");

// Middleware que confere se quem está chamando a rota
// é um agricultor logado. Espera o token no header:
// Authorization: Bearer <access_token>
async function verificarAgricultor(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Token não enviado. Faça login novamente.",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Sessão inválida ou expirada. Faça login novamente.",
      });
    }

    const { data: agricultor, error: erroAgricultor } = await supabase
      .from("agricultor")
      .select("*")
      .eq("email", user.email)
      .maybeSingle();

    if (erroAgricultor || !agricultor) {
      return res.status(403).json({
        sucesso: false,
        mensagem: "Apenas agricultores podem fazer isso.",
      });
    }

    req.agricultor = agricultor;

    next();
  } catch (erro) {
    console.log("ERRO NO MIDDLEWARE verificarAgricultor:", erro);

    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno ao verificar permissão.",
      erro: erro.message,
    });
  }
}

module.exports = verificarAgricultor;
