// Simple passcode hashing for client-side verification
// Note: This is a basic hash for passcode comparison, not cryptographic security

export const hashPasscode = async (passcode: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(passcode + "jacy-christmas-salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const verifyPasscode = async (
  passcode: string,
  hash: string
): Promise<boolean> => {
  const inputHash = await hashPasscode(passcode);
  return inputHash === hash;
};
