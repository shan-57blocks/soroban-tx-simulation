import Safe, {
  getSignMessageLibContract,
  hashSafeMessage,
  SafeProvider,
  SigningMethod
} from '@safe-global/protocol-kit';
import {
  OperationType,
  SafeTransactionDataPartial
} from '@safe-global/types-kit';

const RPC_URL = '<Your RPC URL>';
const SAFE_ADDRESS = '<Your Safe address>';
const OWNER_PRIVATE_KET = '<Your private key>';
const MESSAGE = '<Your message>';

async function signMessage() {
  // Sign the message first
  let protocolKit = await Safe.init({
    provider: RPC_URL,
    safeAddress: SAFE_ADDRESS
  });
  protocolKit = await protocolKit.connect({
    provider: RPC_URL,
    signer: OWNER_PRIVATE_KET
  });

  // Sign the safeMessage with OWNER_PRIVATE_KEY
  // After this, the safeMessage contains the signature from OWNER_PRIVATE_KEY
  let safeMessage = protocolKit.createMessage(MESSAGE);
  safeMessage = await protocolKit.signMessage(
    safeMessage,
    SigningMethod.ETH_SIGN
  );
  console.log(safeMessage);

  // Get the contract with the correct version
  const signMessageLibContract = await getSignMessageLibContract({
    safeProvider: new SafeProvider({
      provider: RPC_URL
    }),
    safeVersion: '1.4.1'
  });
  const messageHash = hashSafeMessage(MESSAGE);
  // @ts-ignore
  const txData = signMessageLibContract.encode('signMessage', [messageHash]);
  const safeTransactionData: SafeTransactionDataPartial = {
    to: signMessageLibContract.contractAddress,
    value: '0',
    data: txData,
    operation: OperationType.DelegateCall
  };
  const signMessageTx = await protocolKit.createTransaction({
    transactions: [safeTransactionData]
  });
  await protocolKit.executeTransaction(signMessageTx);
}

async function validateSafeSignature(): Promise<boolean> {
  const protocolKit = await Safe.init({
    provider: RPC_URL,
    safeAddress: SAFE_ADDRESS
  });

  const messageHash = hashSafeMessage(MESSAGE);
  console.log(messageHash);

  const isValid = await protocolKit.isValidSignature(messageHash, '0x');
  console.log(isValid);
  return isValid;
}

signMessage();
validateSafeSignature();
