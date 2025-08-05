import React, { useState } from 'react';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { createMint } from '@solana/spl-token';

const CreateToken = () => {
  const wallet = useWallet();
  const [tokenAddress, setTokenAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const handleCreateToken = async () => {
    if (!wallet.connected) {
      alert("Please connect your wallet first.");
      return;
    }

    setLoading(true);
    try {
      const mint = await createMint(
        connection,
        wallet, // payer
        wallet.publicKey,
        wallet.publicKey,
        9 // decimals
      );
      setTokenAddress(mint.toBase58());
    } catch (err) {
      console.error("Token creation failed:", err);
      alert("Error creating token. Check console.");
    }
    setLoading(false);
  };

  return (
    <div>
      <button
        onClick={handleCreateToken}
        disabled={loading}
        style={{ padding: '10px 20px', background: 'blue', color: '#fff' }}
      >
        {loading ? "Creating Token..." : "Create Token"}
      </button>

      {tokenAddress && (
        <p style={{ marginTop: '1rem' }}>
          ✅ Token Created! <br />
          <strong>{tokenAddress}</strong>
        </p>
      )}
    </div>
  );
};

export default CreateToken;