import { Monitor } from "lucide-react";
import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="grid min-h-screen grid-cols-2 antialiased">
      {/* Coluna da esquerda com imagem de fundo */}
      <div className="relative flex h-full flex-col justify-between border-r border-foreground/5 bg-gray-50 p-10 text-muted-foreground overflow-hidden">
        {/* Imagem de fundo */}
        <img
          src="https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&w=1200&q=80"
          alt="Background"
          className="absolute inset-0 h-full w-full object-cover opacity-60 z-0"
        />

        {/* Conteúdo sobre a imagem */}
        <div className="relative z-10 flex flex-col items-center gap-3 text-lg text-foreground">
          <Monitor className="h-5 w-5" />
          <span className="font-semibold text-center">IAki.com.br</span>
        </div>

        <footer className="relative z-10 text-sm mt-auto">
          <center>
            Licenciado por &copy; IAki - {new Date().getFullYear()}
          </center>
        </footer>
      </div>

      {/* Coluna da direita (formulário) */}
      <div className="flex flex-col items-center justify-center p-8">
        <Outlet />
      </div>
    </div>
  );
}
