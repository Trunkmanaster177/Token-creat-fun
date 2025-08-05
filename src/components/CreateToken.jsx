import React, { useState } from "react";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";

const CreateToken = () => {
  const { publicKey, signTransaction } = useWallet();
  const [tokenAddress, setTokenAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  const createToken = async () => {
    if (!publicKey || !signTransaction) {
      alert("Connect your wallet first.");
      return;
    }

    try {
      setLoading(true);

      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

      const mintAuthority = Keypair.generate();

      const mint = await createMint(
        connection,
        mintAuthority,
        mintAuthority.publicKey,
        null,
        9
      );

      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        mintAuthority,
        mint,
        mintAuthority.publicKey
      );

      await mintTo(
        connection,
        mintAuthority,
        mint,
        tokenAccount.address,
        mintAuthority,
        1000000000
      );

      setTokenAddress(mint.toBase58());
      alert("Token created: " + mint.toBase58());
    } catch (err) {
      console.error(err);
      alert("Error creating token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={createToken} disabled={loading}>
        {loading ? "Creating..." : "Create Token"}
      </button>
      {tokenAddress && (
        <p>
          🎉 Token Mint Address: <br />
          <a href={`https://explorer.solana.com/address/${tokenAddress}?cluster=devnet`} target="_blank">
            {tokenAddress}
          </a>
        </p>
      )}
    </div>
  );
};

export default CreateToken;
