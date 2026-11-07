import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, RequireAuth } from "./lib/auth";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CadastroUsuario from "./pages/CadastroUsuario";
import EsqueciSenha from "./pages/EsqueciSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import Painel from "./pages/Painel";
import Movimentacao from "./pages/Movimentacao";
import Cadastros from "./pages/Cadastros";
import Historico from "./pages/Historico";

const protegida = (el: JSX.Element) => <RequireAuth>{el}</RequireAuth>;

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<CadastroUsuario />} />
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />

        {/* Exigem login */}
        <Route path="/painel" element={protegida(<Painel />)} />
        <Route path="/movimentacao" element={protegida(<Movimentacao />)} />
        <Route path="/cadastros" element={protegida(<Cadastros />)} />
        <Route path="/historico" element={protegida(<Historico />)} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
