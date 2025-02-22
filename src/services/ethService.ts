import { ethers } from "ethers";

export const ETH_PAYMENT_AMOUNT = "0.003";

export class EthService {
  private provider: ethers.BrowserProvider | null = null;
  private static instance: EthService;

  private constructor() {}

  static getInstance(): EthService {
    if (!EthService.instance) {
      EthService.instance = new EthService();
    }
    return EthService.instance;
  }

  async connectWallet(): Promise<string> {
    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask to continue");
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("Please connect your MetaMask wallet");
      }

      // Set up the provider after successful connection
      this.provider = new ethers.BrowserProvider(window.ethereum);

      const address = accounts[0];
      return address;
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error("Please accept the wallet connection request");
      }
      throw new Error(error.message || "Failed to connect wallet");
    }
  }

  async makePayment(receiverAddress: string): Promise<string> {
    // Ensure provider is set up
    if (!this.provider) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
    }

    const signer = await this.provider.getSigner();
    const tx = await signer.sendTransaction({
      to: receiverAddress,
      value: ethers.parseEther(ETH_PAYMENT_AMOUNT),
    });

    return tx.hash;
  }
}
