import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import CreateToken from './components/CreateToken';

function App() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Create Your SPL Token</h1>
      <WalletMultiButton />
      <CreateToken />
    </div>
  );
}

export default App;
