'use client';
import LoginWrapper from './LoginWrapper';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootIndex() {
  const router = useRouter();

  useEffect(() => {
    // Só redireciona se já houver sessão salva (usuário logado)
    const perfil = localStorage.getItem('smiic_perfil');
    if (perfil === 'gabinete' || perfil === 'operacional') {
      router.push('/operacional');
    }
    // Se não tiver perfil salvo, não faz nada — o LoginWrapper mostra a tela de login
  }, [router]);

  return (
    <LoginWrapper>
      {/* conteúdo interno só aparece se o LoginWrapper autenticar o usuário */}
      <div className="h-screen w-full bg-[#03132e] flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p className="text-slate-400 font-semibold tracking-widest uppercase">Redirecionando para o seu painel...</p>
      </div>
    </LoginWrapper>
  );
}
