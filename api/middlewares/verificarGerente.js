const supabase = require("../supabase");

// Middleware que confere se quem está chamando a rota
// é um gerente logado. Espera o token no header:
// Authorization: Bearer <access_token>
async function verificarGerente(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Token não enviado. Faça login novamente.",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Confere se o token é válido e pega o usuário dono dele
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

    // Confere se esse usuário existe na tabela gerente
    const { data: gerente, error: erroGerente } = await supabase
      .from("gerente")
      .select("*")
      .eq("email", user.email)
      .maybeSingle();

    if (erroGerente || !gerente) {
      return res.status(403).json({
        sucesso: false,
        mensagem: "Apenas gerentes podem fazer isso.",
      });
    }

    // Deixa os dados do gerente disponíveis pra rota, se precisar
    req.gerente = gerente;

    next();
  } catch (erro) {
    console.log("ERRO NO MIDDLEWARE verificarGerente:", erro);

    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno ao verificar permissão.",
      erro: erro.message,
    });
  }
}

module.exports = verificarGerente;
