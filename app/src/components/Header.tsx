import { ConnectButton } from '@rainbow-me/rainbowkit';
import '../styles/Header.css';

export function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <div className="header-copy">
            <h1 className="header-title">Secret Board</h1>
            <p className="header-subtitle">
              Fully homomorphic message board secured with Zama FHE.
            </p>
          </div>
          <ConnectButton label="Connect" chainStatus="icon" />
        </div>
      </div>
    </header>
  );
}
