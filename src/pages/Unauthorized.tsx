export function Unauthorized() {
  return (
    <div className="h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold">
        🚫 Você não tem permissão para acessar esta página.
      </h1>
    </div>
  );
}