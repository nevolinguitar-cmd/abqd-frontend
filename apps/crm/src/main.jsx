import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

window.__ABQD_CRM_BOOT__ = "main-started";

const rootEl = document.getElementById('root');
if (rootEl) {
  rootEl.innerHTML = `
    <div style="min-height:100vh;background:#0B0E14;color:rgba(255,255,255,.92);font-family:Montserrat,system-ui,Segoe UI,Roboto,Arial;padding:24px">
      <div style="max-width:1000px;margin:0 auto;border:1px solid rgba(255,255,255,.10);border-radius:18px;background:rgba(255,255,255,.03);padding:18px">
        <div style="font-size:16px;font-weight:900;margin-bottom:8px">CRM: загрузка…</div>
        <div style="opacity:.7">Если это сообщение не исчезает — App упал или не отрендерился.</div>
      </div>
    </div>
  `;
}

function crash(title, err){
  const el = document.getElementById('root');
  const msg = (err && (err.stack || err.message)) ? (err.stack || err.message) : String(err);
  if (!el) return;
  el.innerHTML = `
    <div style="min-height:100vh;background:#0B0E14;color:rgba(255,255,255,.92);font-family:Montserrat,system-ui,Segoe UI,Roboto,Arial;padding:24px">
      <div style="max-width:1000px;margin:0 auto;border:1px solid rgba(255,255,255,.10);border-radius:18px;background:rgba(255,255,255,.03);padding:18px">
        <div style="font-size:16px;font-weight:900;margin-bottom:10px">${title}</div>
        <div style="opacity:.7;margin-bottom:12px">Скопируй текст ошибки ниже и пришли сюда — это причина белого экрана.</div>
        <pre style="white-space:pre-wrap;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:12px;overflow:auto;font-size:12px">${msg}</pre>
      </div>
    </div>
  `;
}

window.addEventListener('error', (e) => crash('JS error', e?.error || e?.message || e));
window.addEventListener('unhandledrejection', (e) => crash('Unhandled rejection', e?.reason || e));

class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { err: null }; }
  static getDerivedStateFromError(err){ return { err }; }
  componentDidCatch(err, info){ console.error('[ABQD CRM] render error', err, info); }
  render(){
    if (this.state.err){
      return (
        <div style={{minHeight:'100vh',background:'#0B0E14',color:'rgba(255,255,255,.92)',fontFamily:'Montserrat,system-ui,Segoe UI,Roboto,Arial',padding:'24px'}}>
          <div style={{maxWidth:1000,margin:'0 auto',border:'1px solid rgba(255,255,255,.10)',borderRadius:18,background:'rgba(255,255,255,.03)',padding:18}}>
            <div style={{fontSize:16,fontWeight:900,marginBottom:10}}>Render error</div>
            <pre style={{whiteSpace:'pre-wrap',background:'rgba(0,0,0,.35)',border:'1px solid rgba(255,255,255,.10)',borderRadius:12,padding:12,overflow:'auto',fontSize:12}}>
{String(this.state.err?.stack || this.state.err)}
            </pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
