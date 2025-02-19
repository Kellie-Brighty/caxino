export function isValidXRPAddress(address: string): boolean {
  // XRP addresses are base58 encoded and start with 'r'
  const xrpAddressRegex = /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/;
  return xrpAddressRegex.test(address);
} 