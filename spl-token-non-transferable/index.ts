
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
  createInitializeNonTransferableMintInstruction,
} from "@solana/spl-token";


const connection = new Connection(
  "https://devnet.helius-rpc.com/?api-key=6d425a30-4e2b-48ac-9cea-443700157a43",
  "confirmed"
);

const payer = Keypair.fromSecretKey(new Uint8Array(wallet));


console.log(payer.publicKey.toBase58());



const mintKeypair = Keypair.generate();

const mint = mintKeypair.publicKey;



const decimals = 9;


const mintAuthority = Keypair.generate();           // Can mint new tokens

const mintLen  = getMintLen([ExtensionType.NonTransferable])


const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);



const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: mint,
    space: mintLen,
    lamports,
    programId: TOKEN_2022_PROGRAM_ID,
})

const initializeNonTransferableIx = 
createInitializeNonTransferableMintInstruction(
    mint,
    TOKEN_2022_PROGRAM_ID
)


const initMintIx = createInitializeMintInstruction(mint,decimals,mintAuthority.publicKey,
    null,TOKEN_2022_PROGRAM_ID
)


const transaction = new Transaction().add(
    createAccountInstruction,
    initializeNonTransferableIx,
    initMintIx
)


const tx = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer, mintKeypair]
)


console.log("✅ Mint Created:", `https://explorer.solana.com/tx/${tx}?cluster=devnet`);
console.log("🎉 Mint Created:", mint.toBase58());























