
import wallet from "../dev-wallet.json";
import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
} from "@solana/web3.js";
import {
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
  createInitializePermanentDelegateInstruction,
  createInitializeMintInstruction,
  getMintLen,
  createAccount,
  mintTo,
  transferChecked,
  burnChecked,
} from "@solana/spl-token";

const connection = new Connection(
  "https://devnet.helius-rpc.com/?api-key=6d425a30-4e2b-48ac-9cea-443700157a43",
  "confirmed"
);


const payer = Keypair.fromSecretKey(new Uint8Array(wallet));
const mintAuthority = payer;           // Can mint new tokens
const permanentDelegate = payer;       // Can transfer/burn tokens from anyone

// Generate Mint
const mintKeypair = Keypair.generate();
const mint = mintKeypair.publicKey;
const decimals = 2;

// Allocate Mint with Permanent Delegate Extension
const mintLen = getMintLen([ExtensionType.PermanentDelegate]);
const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);



console.log("✅ mintAuthority and permanentDelegate are BOTH:", payer.publicKey.toBase58());

const createAccountInstruction = SystemProgram.createAccount({
  fromPubkey: payer.publicKey,
  newAccountPubkey: mint,
  space: mintLen,
  lamports,
  programId: TOKEN_2022_PROGRAM_ID,
});


console.log("✅ Adding Permanent Delegate extension...");

const initDelegateIx = createInitializePermanentDelegateInstruction(
  mint,
  permanentDelegate.publicKey,
  TOKEN_2022_PROGRAM_ID
);



console.log("✅ Adding Mint settings (decimals, authority)...");

const initMintIx = createInitializeMintInstruction(
  mint,
  decimals,
  mintAuthority.publicKey,
  null,
  TOKEN_2022_PROGRAM_ID
);


console.log("🚀 Sending transaction to create the token mint...");


const tx1 = await sendAndConfirmTransaction(
  connection,
  new Transaction().add(createAccountInstruction, initDelegateIx, initMintIx),
  [payer, mintKeypair]
);
console.log("✅ Mint Created:", `https://explorer.solana.com/tx/${tx1}?cluster=devnet`);
console.log("🎉 Mint Created:", mint.toBase58());




const user1 = Keypair.generate().publicKey;
const user1TokenAccount = await createAccount(connection, payer, mint, user1, undefined, undefined, TOKEN_2022_PROGRAM_ID);
const user2TokenAccount = await createAccount(connection, payer, mint, payer.publicKey, undefined, undefined, TOKEN_2022_PROGRAM_ID);
console.log("✅ Token Account A (User1):", user1TokenAccount.toBase58());
console.log("✅ Token Account B (Payer):", user2TokenAccount.toBase58());

const tx2 = await mintTo(connection, payer, mint, user1TokenAccount, mintAuthority.publicKey, 200, undefined, undefined, TOKEN_2022_PROGRAM_ID);
console.log("✅ Minted 200 tokens:", `https://explorer.solana.com/tx/${tx2}?cluster=devnet`);


const tx3 = await transferChecked(connection, payer, user1TokenAccount, mint, user2TokenAccount, permanentDelegate.publicKey, 100, decimals, undefined, undefined, TOKEN_2022_PROGRAM_ID);
console.log("✅ Transferred 100 tokens:", `https://explorer.solana.com/tx/${tx3}?cluster=devnet`);


const tx4 = await burnChecked(connection, payer, user1TokenAccount, mint, permanentDelegate.publicKey, 50, decimals, undefined, undefined, TOKEN_2022_PROGRAM_ID);
console.log("✅ Burned 50 tokens:", `https://explorer.solana.com/tx/${tx4}?cluster=devnet`);
