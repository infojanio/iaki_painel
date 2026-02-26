import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import signIn from "@/api/sign-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

const signInForm = z.object({
  email: z.string().email({ message: "E-mail inválido" }),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type SignInForm = z.infer<typeof signInForm>;

export function SignIn() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInForm),
  });

  const { mutateAsync: authenticate } = useMutation({ mutationFn: signIn });
  const { signIn: saveAuth } = useAuth();

  async function handleSignIn(data: SignInForm) {
    try {
      const response = await authenticate(data);

      if (!response?.token) {
        toast.error("Token ausente na resposta da API.");
        return;
      }

      saveAuth({
        user: response.user,
        accessToken: response.token,
      });

      toast.success(`Bem-vindo, ${response.user.name}!`);
      setTimeout(() => navigate("/"), 100);
    } catch {
      toast.error("Credenciais inválidas.");
    }
  }

  return (
    <>
      <Helmet title="Login" />
      <center>
        <div className="flex-1 overflow-hidden mt-6">
          <img
            src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=84,fit=crop,q=95/YlevrNKVQLhQww36/logomarca-YZ9x42y6ODCVpDK3.JPG"
            alt="logo"
            className="w-120 h-120 object-center"
          />
        </div>
      </center>

      <div className="p-24">
        <div className="flex w-[350px] flex-col justify-center gap-6">
          <div className="flex flex-col gap-2 text-center">
            <p className="text-md text-muted-foreground">
              Painel Administrativo
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(handleSignIn)}>
            <div className="space-y-2">
              <Label htmlFor="email">Seu e-mail</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button disabled={isSubmitting} className="w-full" type="submit">
              Acessar painel
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
