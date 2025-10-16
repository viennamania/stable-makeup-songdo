import { NextResponse, type NextRequest } from "next/server";

import {
	getOneByNickname,
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
 } from "thirdweb/wallets";


// MINT_WALLET_PRIVATE_KEY
const mintWalletPrivateKey = process.env.MINT_WALLET_PRIVATE_KEY || "";


export async function POST(request: NextRequest) {

  const body = await request.json();

  //console.log("body", body);

  const {
    storecode,
    userCode,
    amount,
  } = body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return NextResponse.json({
      error: "Invalid amount",
    }, { status: 400 });
  }

  if (amount > 1000) {
    return NextResponse.json({
      error: "Amount exceeds the maximum limit of 1000 CKEC",
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

  const walletAddress = result.walletAddress;



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



  // transfer from mint wallet to user's wallet
  try {

    const account = privateKeyToAccount({
      client,
      privateKey: mintWalletPrivateKey,
    });

    if (!account) {
      return NextResponse.json({
        error: "Mint wallet account not found",
      }, { status: 500 });
    }

    const transaction = transfer({
      contract,
      to: walletAddress,
      amount: amount,
    });

    const { transactionHash } = await sendTransaction({
      account,
      transaction,
    });


    return NextResponse.json({

      result: {
        nickname: userCode,
        mintedAmount: amount,
        transactionHash: transactionHash,
        embeddedWalletAddress: walletAddress,
      }
    
    });

  } catch (error) {
    console.error("Minting error:", error);
    return NextResponse.json({
      error: "Minting failed",
    }, { status: 500 });
  }
  
}
