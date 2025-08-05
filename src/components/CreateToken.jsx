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
  SystemProgram,
  Transaction,
  Connection,
} from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";

const CreateToken = () => {
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
      const connection = new Connection(endpoint, "confirmed");

      const lamportsForRentExemption = await connection.getMinimumBalanceForRentExemption(82);

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mint.publicKey,
          space: 82,
          lamports: lamportsForRentExemption,
          programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
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

export default CreateToken;

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
