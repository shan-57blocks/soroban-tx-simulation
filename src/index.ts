import {
  Address,
  BASE_FEE,
  Contract,
  nativeToScVal,
  SorobanRpc,
  TransactionBuilder,
  xdr
} from '@stellar/stellar-sdk';

enum ScValType {
  address = 'address',
  u128 = 'u128',
  u64 = 'u64',
  u32 = 'u32',
  bool = 'bool',
  enum = 'enum'
}

const toScVal = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  type: ScValType
) => {
  switch (type) {
    case ScValType.address:
      return Address.fromString(value).toScVal();

    case ScValType.u128:
      return nativeToScVal(value, { type: ScValType.u128 });

    case ScValType.u64:
      return nativeToScVal(value, { type: ScValType.u64 });

    case ScValType.u32:
      return nativeToScVal(value, { type: ScValType.u32 });

    case ScValType.bool:
      return xdr.ScVal.scvBool(value);

    case ScValType.enum:
      return xdr.ScVal.scvVec([xdr.ScVal.scvSymbol(value)]);
  }
};

const simTransaction = async (
  publicKey: string,
  contractAddress: string,
  method: string,
  params: xdr.ScVal[] = []
) => {
  const server = new SorobanRpc.Server('https://soroban-testnet.stellar.org');
  const contract = new Contract(contractAddress);
  const account = await server.getAccount(publicKey);
  const builtTransaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: 'Test SDF Network ; September 2015'
  })
    .addOperation(contract.call(method, ...params))
    .setTimeout(30)
    .build();

  return server.simulateTransaction(builtTransaction);
};

const simTransactionExample = async () => {
  const poolOwnerPublicKey =
    'GBWOHPLK53VVKNEV7C6O6IYN7X3OLHXDML6GVZBPEB7MTWWHPB3N7VLC';
  const borrowerPublicKey =
    'GCJOREE3MWDTANSP4CRM6HZYMQTCZLOYUR6L3XFR34FP4R37WMR5NHWC';
  const creditManagerContract =
    'CDHYIC3ISV3F3RL7FROC3SI2GW65ZOJHMA2AMZJYLIRLWSDELFF3CR23';

  const result = await simTransaction(
    poolOwnerPublicKey,
    creditManagerContract,
    'approve_borrower',
    [
      toScVal(borrowerPublicKey, ScValType.address),
      toScVal(1000_0000000n, ScValType.u128),
      toScVal(5, ScValType.u32),
      toScVal(1200, ScValType.u32),
      toScVal(0, ScValType.u128),
      toScVal(0, ScValType.u64),
      toScVal(true, ScValType.bool)
    ]
  );

  console.log(result);
};

simTransactionExample();
