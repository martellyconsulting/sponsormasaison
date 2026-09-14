"use client";

import { Component, type ReactNode } from "react";

type Props = { fallback: ReactNode; children: ReactNode };
type State = { hasError: boolean };

/** Filet de sécurité : si le .glb existe mais est corrompu/invalide, on retombe sur l'avatar de secours plutôt que de casser toute la page. */
export class ModelErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[avatar] Échec du chargement du scan 3D, retour à l'avatar de secours:", error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
