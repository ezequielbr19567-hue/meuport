"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="contentRecovery"><div className="panel">
    <span className="kicker">PORTFOLIO</span>
    <h1>Vamos tentar novamente?</h1>
    <p>Não foi possível exibir esta página. Tente novamente para recuperar o portfólio.</p>
    <button className="button primary" onClick={reset}>Tentar novamente / Try again</button>
  </div></main>;
}
