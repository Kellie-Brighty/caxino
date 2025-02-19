// import { Client, ClientOptions } from 'xrpl';

// export class XRPService {
//   private client: Client | null = null;
//   private static instance: XRPService;

//   private constructor() {}

//   static getInstance(): XRPService {
//     if (!XRPService.instance) {
//       XRPService.instance = new XRPService();
//     }
//     return XRPService.instance;
//   }

//   async connect(): Promise<boolean> {
//     try {
//       if (!this.client) {
//         const options: ClientOptions = {
//           timeout: 20000,
//           connectionTimeout: 10000,
//           retry: {
//             maxAttempts: 3,
//             minDelay: 1000,
//           },
//         };

//         this.client = new Client('wss://s.altnet.rippletest.net:51233', options);
//       }

//       if (!this.client.isConnected()) {
//         await this.client.connect();
//       }
      
//       return true;
//     } catch (error) {
//       console.error('Failed to connect to XRPL:', error);
//       return false;
//     }
//   }

//   async disconnect(): Promise<void> {
//     if (this.client && this.client.isConnected()) {
//       await this.client.disconnect();
//     }
//   }

//   async getAccountInfo(address: string) {
//     if (!this.client || !this.client.isConnected()) {
//       throw new Error('Client not connected');
//     }

//     try {
//       const response = await this.client.request({
//         command: 'account_info',
//         account: address,
//         ledger_index: 'validated'
//       });
//       return response.result.account_data;
//     } catch (error) {
//       console.error('Failed to get account info:', error);
//       return null;
//     }
//   }

//   async getTestWallet() {
//     if (!this.client || !this.client.isConnected()) {
//       throw new Error('Client not connected');
//     }

//     try {
//       const fund_result = await this.client.fundWallet();
//       return fund_result.wallet;
//     } catch (error) {
//       console.error('Failed to create test wallet:', error);
//       return null;
//     }
//   }
// } 