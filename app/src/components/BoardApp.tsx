import { useMemo, useState } from 'react';
import { Contract } from 'ethers';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../config/contracts';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { createEphemeralWallet, decryptMessage, encryptMessage } from '../utils/encryption';
import '../styles/BoardApp.css';

type BoardMessage = {
  id: number;
  author: string;
  timestamp: number;
  encryptedContent: string;
  encryptedKey: string;
};

type DecryptedResult = {
  message: string;
  randomAddress: string;
};

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export function BoardApp() {
  const { address } = useAccount();
  const signerPromise = useEthersSigner();
  const { instance, isLoading: zamaLoading, error: zamaError } = useZamaInstance();

  const isContractConfigured = CONTRACT_ADDRESS !== ZERO_ADDRESS;

  const { data: messagesData, refetch, isPending: fetchingMessages } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getMessages',
    query: {
      enabled: isContractConfigured,
    },
  });

  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [decryptingId, setDecryptingId] = useState<number | null>(null);
  const [decrypted, setDecrypted] = useState<Record<number, DecryptedResult>>({});

  const messages: BoardMessage[] = useMemo(() => {
    if (!Array.isArray(messagesData)) {
      return [];
    }

    return (messagesData as readonly any[]).map((item, index) => ({
      id: index,
      author: item[0] as string,
      timestamp: Number(item[1]),
      encryptedContent: item[2] as string,
      encryptedKey: item[3] as string,
    }));
  }, [messagesData]);

  const canSubmit = Boolean(
    content.trim() &&
      address &&
      signerPromise &&
      instance &&
      isContractConfigured &&
      !zamaLoading,
  );

  const handlePostMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    if (!canSubmit || !address || !instance || !signerPromise) {
      setErrorMessage('Unable to post message. Check your wallet and encryption service.');
      return;
    }

    setIsPosting(true);

    try {
      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Signer not available');
      }

      const randomWallet = createEphemeralWallet();
      const encryptedContent = encryptMessage(content, randomWallet.address);

      const input = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
      input.addAddress(randomWallet.address);
      const encryptedAddress = await input.encrypt();

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.postMessage(
        encryptedContent,
        encryptedAddress.handles[0],
        encryptedAddress.inputProof
      );

      await tx.wait();

      setContent('');
      setStatusMessage('Message posted successfully.');
      setDecrypted({});
      await refetch();
    } catch (error) {
      console.error('Failed to post message', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage(`Failed to post message: ${message}`);
    } finally {
      setIsPosting(false);
    }
  };

  const handleDecrypt = async (message: BoardMessage) => {
    if (!instance) {
      setErrorMessage('Encryption service unavailable.');
      return;
    }

    setErrorMessage(null);
    setDecryptingId(message.id);

    try {
      const results = await instance.publicDecrypt([message.encryptedKey]);
      const decryptedAddress = results[message.encryptedKey];

      if (!decryptedAddress || typeof decryptedAddress !== 'string') {
        throw new Error('Failed to decrypt random address');
      }

      const plainText = decryptMessage(message.encryptedContent, decryptedAddress);

      setDecrypted((prev) => ({
        ...prev,
        [message.id]: {
          message: plainText,
          randomAddress: decryptedAddress,
        },
      }));
    } catch (error) {
      console.error('Failed to decrypt message', error);
      const messageText = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage(`Decryption failed: ${messageText}`);
    } finally {
      setDecryptingId(null);
    }
  };

  return (
    <div className="board-app">
      <section className="composer-section">
        <h2 className="section-title">Post a secret message</h2>
        <p className="section-subtitle">
          Each message is encrypted with a random address, stored on-chain, and can be publicly decrypted via Zama FHE.
        </p>
        {!isContractConfigured && (
          <div className="status error">SecretBoard contract address is not configured.</div>
        )}
        <form className="composer-form" onSubmit={handlePostMessage}>
          <textarea
            className="composer-input"
            placeholder="Share something confidential..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={420}
          />
          <div className="composer-actions">
            <button type="submit" className="primary-button" disabled={!canSubmit || isPosting}>
              {zamaLoading && 'Preparing FHE...'}
              {!zamaLoading && isPosting && 'Publishing...'}
              {!zamaLoading && !isPosting && 'Publish message'}
            </button>
            <span className="composer-hint">{content.length} / 420</span>
          </div>
        </form>
        {!address && <div className="status error">Connect your wallet to post messages.</div>}
        {statusMessage && <div className="status success">{statusMessage}</div>}
        {errorMessage && <div className="status error">{errorMessage}</div>}
        {zamaError && <div className="status error">{zamaError}</div>}
      </section>

      <section className="messages-section">
        <div className="messages-header">
          <h2 className="section-title">Encrypted feed</h2>
          <button className="secondary-button" onClick={() => refetch()} disabled={fetchingMessages}>
            {fetchingMessages ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {messages.length === 0 ? (
          <p className="empty-state">No messages posted yet. Be the first to share a secret.</p>
        ) : (
          <ul className="message-list">
            {messages
              .slice()
              .reverse()
              .map((message) => {
                const decryptedInfo = decrypted[message.id];
                const isDecrypting = decryptingId === message.id;
                const date = new Date(message.timestamp * 1000);

                return (
                  <li key={message.id} className="message-card">
                    <div className="message-meta">
                      <span className="message-author">{message.author}</span>
                      <span className="message-time">{date.toLocaleString()}</span>
                    </div>
                    <div className="message-body">
                      <p className="encrypted-text">Encrypted content: {message.encryptedContent}</p>
                      <p className="encrypted-text">Encrypted key handle: {message.encryptedKey}</p>
                    </div>
                    {decryptedInfo ? (
                      <div className="decrypted-panel">
                        <p className="decrypted-text">Decrypted message: {decryptedInfo.message}</p>
                        <p className="decrypted-address">Random address: {decryptedInfo.randomAddress}</p>
                        <button
                          className="secondary-button"
                          onClick={() =>
                            setDecrypted((prev) => {
                              const next = { ...prev };
                              delete next[message.id];
                              return next;
                            })
                          }
                        >
                          Hide
                        </button>
                      </div>
                    ) : (
                      <button
                        className="primary-button outline"
                        onClick={() => handleDecrypt(message)}
                        disabled={isDecrypting || zamaLoading}
                      >
                        {isDecrypting ? 'Decrypting...' : 'Decrypt message'}
                      </button>
                    )}
                  </li>
                );
              })}
          </ul>
        )}
      </section>
    </div>
  );
}
