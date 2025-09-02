import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, err: null };
  }
  static getDerivedStateFromError(err) {
    return { hasError: true, err };
  }
  componentDidCatch(err, info) {
    console.error("🚨 React error boundary caught:", err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding:24,fontFamily:"system-ui, -apple-system, Segoe UI, Roboto"}}>
          <h1 style={{fontSize:20, fontWeight:800, marginBottom:8}}>Une erreur est survenue</h1>
          <p style={{color:"#475569", marginBottom:12}}>
            Merci de rafraîchir la page ou de vérifier la console pour plus de détails.
          </p>
          <pre style={{whiteSpace:"pre-wrap", background:"#f8fafc", padding:12, borderRadius:8, border:"1px solid #e2e8f0"}}>
            {String(this.state.err)}
          </pre>
          <button
            onClick={() => location.reload()}
            style={{marginTop:12, padding:"8px 12px", borderRadius:8, border:"1px solid #c34d54", color:"#c34d54", background:"white", cursor:"pointer"}}
          >
            Recharger
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
