import { NextResponse, type NextRequest } from "next/server";

import {
	getOneByNickname,
  checkAccessTokenByWalletAddress,
} from '@lib/api/user';

import {
  createThirdwebClient,
  getContract,
  sendTransaction,
} from "thirdweb";



import {
  balanceOf,
  transfer,
} from "thirdweb/extensions/erc20";
 
import {
  ethereum,
  polygon,
  arbitrum,
  bsc,
} from "thirdweb/chains";

import {
  chain,
  ethereumContractAddressUSDT,
  polygonContractAddressUSDT,
  arbitrumContractAddressUSDT,
  bscContractAddressUSDT,

  arbitrumContractAddressCKEC,
} from "@/app/config/contractAddresses";


import {
  privateKeyToAccount,
  smartWallet,
 } from "thirdweb/wallets";




export async function POST(request: NextRequest) {

  const body = await request.json();

  //console.log("body", body);

  const {
    accessToken,
    storecode,
    userCode,
    toWalletAddress,
    amount,
  } = body;

  if (!accessToken) {
    return NextResponse.json({
      error: "Missing access token",
    }, { status: 400 });
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    return NextResponse.json({
      error: "Invalid amount",
    }, { status: 400 });
  }

  if (amount > 1000000) {
    return NextResponse.json({
      error: "Amount exceeds the maximum limit of 1000000 CKEC",
    }, { status: 400 });
  }



  const result = await getOneByNickname(
    storecode,
    userCode,
  );

  if (!result) {
    return NextResponse.json({
      error: "User not found",
    }, { status: 404 });
  }


  if (!await checkAccessTokenByWalletAddress(result.walletAddress, accessToken)) {
    return NextResponse.json({
      error: "Invalid access token",
    }, { status: 401 });
  }



  const walletAddress = result.walletAddress;
  const walletPrivateKey = result.walletPrivateKey;



  const client = createThirdwebClient({
    secretKey: process.env.THIRDWEB_SECRET_KEY || "",
  });

  const contract = getContract({
    // the client you have created via `createThirdwebClient()`
    client,
    // the chain the contract is deployed on
    
    
    //chain: arbitrum,
    chain:  chain === "ethereum" ? ethereum :
            chain === "polygon" ? polygon :
            chain === "arbitrum" ? arbitrum :
            chain === "bsc" ? bsc : arbitrum,
  
  
  
    // the contract's address
    ///address: contractAddressArbitrum,

    address: chain === "ethereum" ? arbitrumContractAddressCKEC :
            chain === "polygon" ? arbitrumContractAddressCKEC :
            chain === "arbitrum" ? arbitrumContractAddressCKEC :
            chain === "bsc" ? arbitrumContractAddressCKEC : arbitrumContractAddressCKEC,


    // OPTIONAL: the contract's abi
    //abi: [...],
  });


  /*
  const resultBalance = await balanceOf({
    contract,
    address: walletAddress,
  });


  const balance = Number(resultBalance) / 10 ** 18;
  */



  // transfer from my wallet to user's wallet
  try {

    const personalAccount = privateKeyToAccount({
      client,
      privateKey: walletPrivateKey,
    });

    if (!personalAccount) {
      return NextResponse.json({
        error: "wallet account not found",
      }, { status: 500 });
    }

    const wallet = smartWallet({
      chain: chain === "ethereum" ? ethereum :
             chain === "polygon" ? polygon :
             chain === "arbitrum" ? arbitrum :
             chain === "bsc" ? bsc : arbitrum,

      //factoryAddress: "0x655934C0B4bD79f52A2f7e6E60714175D5dd319b", // your own deployed account factory address
      sponsorGas: true,
    });

    // Connect the smart wallet
    const account = await wallet.connect({
      client: client,
      personalAccount: personalAccount,
    });

    if (!account) {
      return NextResponse.json({
        result: null,
      });
    }




    const transaction = transfer({
      contract,
      to: toWalletAddress,
      amount: amount,
    });

    const { transactionHash } = await sendTransaction({
      account,
      transaction,
    });


    return NextResponse.json({

      result: {
        nickname: userCode,
        amount: amount,
        toWalletAddress: toWalletAddress,
        transactionHash: transactionHash,
        embeddedWalletAddress: walletAddress,
      }
    
    });

  } catch (error) {
    console.error("Send error:", error);
    return NextResponse.json({
      error: "Send failed",
    }, { status: 500 });
  }
  
}
