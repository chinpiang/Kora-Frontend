/**
 * Soroban contract interaction helpers.
 * Wraps contract calls with simulation, signing, and submission.
 */
import * as StellarSdk from "@stellar/stellar-sdk";
import { rpc, networkConfig } from "./client";

const INVOICE_CONTRACT_ID = process.env.NEXT_PUBLIC_INVOICE_CONTRACT_ID || "";
const MARKETPLACE_CONTRACT_ID = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ID || "";

/**
 * Build a Soroban contract call transaction (not yet signed).
 */
export async function buildContractCall({
  contractId,
  method,
  args,
  sourcePublicKey,
}: {
  contractId: string;
  method: string;
  args: StellarSdk.xdr.ScVal[];
  sourcePublicKey: string;
}): Promise<StellarSdk.Transaction> {
  const account = await rpc.getAccount(sourcePublicKey);
  const contract = new StellarSdk.Contract(contractId);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: networkConfig.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  // Simulate to get resource footprint
  const simResult = await rpc.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationError(simResult)) {
    throw new Error(`Simulation failed: ${simResult.error}`);
  }

  return StellarSdk.rpc.assembleTransaction(tx, simResult).build();
}

/**
 * Simulate a read-only contract call and return the result value.
 */
export async function readContract<T>({
  contractId,
  method,
  args,
  sourcePublicKey,
  parser,
}: {
  contractId: string;
  method: string;
  args: StellarSdk.xdr.ScVal[];
  sourcePublicKey: string;
  parser: (val: StellarSdk.xdr.ScVal) => T;
}): Promise<T> {
  const account = await rpc.getAccount(sourcePublicKey);
  const contract = new StellarSdk.Contract(contractId);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: networkConfig.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const simResult = await rpc.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationError(simResult)) {
    throw new Error(`Simulation failed: ${simResult.error}`);
  }
  if (!simResult.result?.retval) {
    throw new Error("No return value from contract");
  }

  return parser(simResult.result.retval);
}

// ─── Invoice Contract Methods ─────────────────────────────────────────────────

export const invoiceContract = {
  contractId: INVOICE_CONTRACT_ID,

  async mintInvoice(
    params: {
      ipfsCid: string;
      amount: bigint;
      financingAmount: bigint;
      discountRate: number;
      dueDate: bigint;
    },
    sourcePublicKey: string
  ) {
    return buildContractCall({
      contractId: INVOICE_CONTRACT_ID,
      method: "mint_invoice",
      args: [
        StellarSdk.xdr.ScVal.scvString(params.ipfsCid),
        StellarSdk.xdr.ScVal.scvI128(
          new StellarSdk.xdr.Int128Parts({
            hi: StellarSdk.xdr.Int64.fromString("0"),
            lo: StellarSdk.xdr.Uint64.fromString(params.amount.toString()),
          })
        ),
        StellarSdk.xdr.ScVal.scvI128(
          new StellarSdk.xdr.Int128Parts({
            hi: StellarSdk.xdr.Int64.fromString("0"),
            lo: StellarSdk.xdr.Uint64.fromString(params.financingAmount.toString()),
          })
        ),
        StellarSdk.xdr.ScVal.scvU32(params.discountRate),
        StellarSdk.xdr.ScVal.scvU64(
          StellarSdk.xdr.Uint64.fromString(params.dueDate.toString())
        ),
      ],
      sourcePublicKey,
    });
  },

  async getInvoice(tokenId: bigint, sourcePublicKey: string) {
    return readContract({
      contractId: INVOICE_CONTRACT_ID,
      method: "get_invoice",
      args: [
        StellarSdk.xdr.ScVal.scvU64(
          StellarSdk.xdr.Uint64.fromString(tokenId.toString())
        ),
      ],
      sourcePublicKey,
      parser: (val) => val, // caller parses the ScVal
    });
  },
};

// ─── Marketplace Contract Methods ─────────────────────────────────────────────

export const marketplaceContract = {
  contractId: MARKETPLACE_CONTRACT_ID,

  async fundInvoice(tokenId: bigint, amount: bigint, sourcePublicKey: string) {
    return buildContractCall({
      contractId: MARKETPLACE_CONTRACT_ID,
      method: "fund_invoice",
      args: [
        StellarSdk.xdr.ScVal.scvU64(
          StellarSdk.xdr.Uint64.fromString(tokenId.toString())
        ),
        StellarSdk.xdr.ScVal.scvI128(
          new StellarSdk.xdr.Int128Parts({
            hi: StellarSdk.xdr.Int64.fromString("0"),
            lo: StellarSdk.xdr.Uint64.fromString(amount.toString()),
          })
        ),
      ],
      sourcePublicKey,
    });
  },

  async repayInvoice(tokenId: bigint, sourcePublicKey: string) {
    return buildContractCall({
      contractId: MARKETPLACE_CONTRACT_ID,
      method: "repay_invoice",
      args: [
        StellarSdk.xdr.ScVal.scvU64(
          StellarSdk.xdr.Uint64.fromString(tokenId.toString())
        ),
      ],
      sourcePublicKey,
    });
  },
};
