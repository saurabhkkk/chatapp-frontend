import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

const decryptMessage = (encryptedMessage) => {
  const decrypted = CryptoJS.AES.decrypt(
    encryptedMessage,
    ENCRYPTION_KEY
  ).toString(CryptoJS.enc.Utf8);
  return decrypted;
};

export default decryptMessage;
