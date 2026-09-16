'use client';
import LoginWrapper from './LoginWrapper';

export default function RootIndex() {
  return (
    <LoginWrapper>
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p className="text-slate-400 font-semibold tracking-widest uppercase">Redirecionando para o seu painel...</p>
      </div>
    </LoginWrapper>
  );
}
