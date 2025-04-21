import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './estilo.css';

export default function App() {
  const [tema, setTema] = useState('');
  const [redacao, setRedacao] = useState('');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [notaAnimada, setNotaAnimada] = useState(0);
  const [correcaoConcluida, setCorrecaoConcluida] = useState(false);

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  useEffect(() => {
    if (resultado) {
      let notaAtual = 0;
      const intervalo = setInterval(() => {
        if (notaAtual >= resultado.nota_final) {
          clearInterval(intervalo);
        } else {
          notaAtual += 5;
          setNotaAnimada(notaAtual);
        }
      }, 10);
      setCorrecaoConcluida(true);
      return () => clearInterval(intervalo);
    }
  }, [resultado]);

  const corrigirRedacao = async () => {
    setLoading(true);
    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
    }, 3000);

    try {
      const response = await axios.post('http://localhost:8000/api/corrigir', {
        tema,
        redacao,
      });
      setResultado(response.data);
    } catch (error) {
      alert('Erro ao corrigir redação.');
    }
    setLoading(false);
  };

  return (
    <>
      <div className="container">
        <header className="header">
          <div className="header-logo">
            <a href="/"><h1 className="logo-corretor">CorretorIA 📖</h1></a>
          </div>
        </header>

        {showPopup && (
          <div className="popup-notificacao">
            <span className="popup-icon">✅</span>
            <span className="popup-texto">Redação enviada para correção com sucesso!</span>
          </div>
        )}

        {loading && !resultado ? (
          <div className="loading-box">
            <div className="loading-bar"></div>
            <p className="loading-text">Estamos escaneando sua redação com a IA...</p>
          </div>
        ) : null}

        {!loading && !resultado && (
          <div className="card">
            <h1 className="titulo">Corretor de Redações com IA 📚</h1>

            <div className="input-group">
              <label className="input-label">Tema da Redação</label>
              <input
                className="input"
                type="text"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                placeholder="Ex: Desafios da educação digital no Brasil"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Texto da Redação</label>
              <textarea
                className="textarea"
                value={redacao}
                onChange={(e) => setRedacao(e.target.value)}
                placeholder="Cole sua redação aqui..."
              />
            </div>

            <button className="button" onClick={corrigirRedacao} disabled={loading}>
              Corrigir Redação
            </button>
          </div>
        )}

        {resultado && (
          <div className="resultado-card">
            {correcaoConcluida && (
              <div className="aviso-conclusao">
                <span role="img" aria-label="concluido">✅</span>
                <strong>Correção concluída com sucesso!</strong>
              </div>
            )}

            <h2 className="resultado-titulo">Resultado</h2>

            <div className="nota-final-box">
              <div className="nota-label">
                Nota Final: <strong>{notaAnimada}</strong> / 1000
              </div>
              <div className="barra-container">
                <div
                  className="barra-progresso"
                  style={{ width: `${(notaAnimada / 1000) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="competencias">
              <h3>Competências Avaliadas:</h3>
              {resultado.competencias?.map((competencia, i) => (
                <div key={i} className="competencia-item">
                  <p><strong>{competencia.nome}:</strong> {competencia.nota}/200</p>
                  <p><strong>Descrição:</strong> {competencia.descricao}</p>
                </div>
              ))}
            </div>

            <div className="feedback">
              <strong>Feedback geral:</strong>
              <br />
              {resultado.feedback}
            </div>
            <div className="sugestoes">
              <strong>Sugestões de melhoria:</strong>
              <ul>
                <li>Evite repetições de ideias.</li>
                <li>Construa melhor os argumentos com exemplos práticos.</li>
                <li>Reforce a conclusão com uma proposta clara.</li>
              </ul>
            </div>
          </div>
        )}

        <div className="theme-toggle-float">
          <button className="toggle-theme" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '🌙' : '🌞'}
          </button>
        </div>
      </div>
    </>
  );
}