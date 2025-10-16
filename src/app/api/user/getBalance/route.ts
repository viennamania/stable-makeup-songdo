import { NextResponse, type NextRequest } from "next/server";

import {
	getOneByNickname,
} from '@lib/api/user';

import {
  createThirdwebClient,
  getContract,
} from "thirdweb";



import { balanceOf } from "thirdweb/extensions/erc20";
 
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





export async function POST(request: NextRequest) {

  const body = await request.json();

  const {
    storecode,
    userCode,
  } = body;


  //console.log("walletAddress", walletAddress);


  /*
  const client = createThirdwebClient({
    secretKey: process.env.THIRDWEB_SECRET_KEY || "",
  });
 
  const user = await getUser({
    client,
    walletAddress: walletAddress,
    //walletAddress: "0xF1b051dceb3Aab2f8e35805F134e373b709382aA", // For testing purposes
  });

  console.log("user", user);
  */


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


  const resultBalance = await balanceOf({
    contract,
    address: walletAddress,
  });


  const balance = Number(resultBalance) / 10 ** 18;





  /*
  {
    result: {
      nickname: '0xe38A3D8786924E2c1C427a4CA5269e6C9D37BC9C',
      balance: 2342.65
    }
  }
  */
 
  return NextResponse.json({

    result: {
      nickname: userCode,
      balance: balance,
      embeddedWalletAddress: walletAddress,
    }
    
  });
  
}
