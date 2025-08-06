// src/components/CreateToken.jsx
import React, { useMemo, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  clusterApiUrl,
  Keypair,
  Connection,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";

import "@solana/wallet-adapter-react-ui/styles.css";

const InnerApp = () => {
  const { publicKey, signTransaction } = useWallet();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateToken = async () => {
    if (!publicKey || !signTransaction) {
      alert("Please connect your Phantom Wallet");
      return;
    }

    setLoading(true);
    setStatus("⏳ Creating token...");

    try {
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

      const mintKeypair = Keypair.generate();

      // Airdrop 1 SOL (devnet only)
      const airdropSignature = await connection.requestAirdrop(
        publicKey,
        LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(airdropSignature, "confirmed");

      const mint = await createMint(
        connection,
        mintKeypair,
        publicKey,
        publicKey,
        9,
        mintKeypair
      );

      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        mintKeypair,
        mint,
        publicKey
      );

      await mintTo(
        connection,
        mintKeypair,
        mint,
        tokenAccount.address,
        publicKey,
        1_000_000_000
      );

      setStatus(`✅ Token Created!\nMint Address:\n${mint.toBase58()}`);
    } catch (err) {
      console.error(err);
      setStatus("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Solana Token Creator</h1>
      <WalletMultiButton />
      <button
        style={styles.button}
        onClick={handleCreateToken}
        disabled={loading}
      >
        {loading ? "Processing..." : "Create Token"}
      </button>
      <p style={styles.status}>{status}</p>
    </div>
  );
};

const CreateTokenApp = () => {
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <InnerApp />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default CreateTokenApp;

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "80px",
    fontFamily: "Arial",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  button: {
    marginTop: "20px",
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "5px",
    background: "purple",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  status: {
    marginTop: "20px",
    maxWidth: "90%",
    textAlign: "center",
    whiteSpace: "pre-wrap",
  },
};
