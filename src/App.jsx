import React, { useCallback, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

export default function App() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const [tokenAddress, setTokenAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreateToken = useCallback(async () => {
    if (!publicKey) {
      alert("Connect your wallet first.");
      return;
    }

    try {
      setLoading(true);

      const mint = await createMint(
        connection,
        await signTransaction({}),
        publicKey,
        null,
        9 // decimals
      );

      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        await signTransaction({}),
        mint,
        publicKey
      );

      await mintTo(
        connection,
        await signTransaction({}),
        mint,
        tokenAccount.address,
        publicKey,
        1000000000 // 1,000 tokens (with 9 decimals)
      );

      setTokenAddress(mint.toBase58());
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey, sendTransaction, signTransaction]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Create SPL Token</h1>
      <WalletMultiButton />
      <br /><br />
      <button
        onClick={handleCreateToken}
        disabled={!publicKey || loading}
        style={{
          padding: "10px 20px",
          backgroundColor: "#4b0082",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        {loading ? "Creating..." : "Create Token"}
      </button>

      {tokenAddress && (
        <div style={{ marginTop: "20px" }}>
          <strong>Token Mint Address:</strong>
          <p>{tokenAddress}</p>
        </div>
      )}
    </div>
  );
        }
