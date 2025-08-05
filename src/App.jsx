import React, { useEffect, useMemo, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
} from "@solana/wallet-adapter-wallets";

import { clusterApiUrl, Keypair, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";

const CreateTokenApp = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const network = "devnet";
  const endpoint = useMemo(() => clusterApiUrl(network), []);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  const { publicKey, sendTransaction } = useWallet();

  const handleCreateToken = async () => {
    if (!publicKey) {
      alert("Connect your Phantom wallet first");
      return;
    }

    try {
      setLoading(true);
      setStatus("Creating token...");

      const mint = Keypair.generate();
      const connection = new window.solanaWeb3.Connection(endpoint, "confirmed");

      const lamportsForRentExemption = await connection.getMinimumBalanceForRentExemption(
        window.solanaWeb3.MINT_SIZE
      );

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mint.publicKey,
          space: window.solanaWeb3.MINT_SIZE,
          lamports: lamportsForRentExemption,
          programId: window.solanaWeb3.TOKEN_PROGRAM_ID,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      setStatus(`Token created! Mint Address: ${mint.publicKey.toBase58()}`);
    } catch (error) {
      console.error(error);
      setStatus("Error creating token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div style={styles.container}>
            <h1 style={styles.title}>Solana Token Creator</h1>
            <WalletMultiButton />
            <button style={styles.button} onClick={handleCreateToken} disabled={loading}>
              {loading ? "Processing..." : "Create SPL Token"}
            </button>
            <p style={styles.status}>{status}</p>
          </div>
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
  },
};
