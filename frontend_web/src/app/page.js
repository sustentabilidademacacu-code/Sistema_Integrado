'use client';
import LoginWrapper from './LoginWrapper';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootIndex() {
  const router = useRouter();

  useEffect(() => {
    const perfil = localStorage.getItem('smiic_perfil');
    if (perfil === 'gabinete') {
      router.push('/gabinete');
    } else if (perfil === 'operacional') {
      router.push('/operacional');
    }
  }, [router]);

  return (
    <LoginWrapper>
      <div className="h-screen w-full bg-[#03132e] flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p className="text-slate-400 font-semibold tracking-widest uppercase">Redirecionando para o seu painel...</p>
      </div>
    </LoginWrapper>
  );
}
