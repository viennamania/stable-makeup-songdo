import { NextResponse, type NextRequest } from "next/server";

import {
  UserProps,
	acceptBuyOrder,
  updateBuyOrderByQueueId,

  getBuyOrderByEscrowWalletAddress,

  updateBuyOrderEscrowBalance,

} from '@lib/api/order';


import {
  insertOne,
} from '@lib/api/transfer';


import {
  ethereumContractAddressUSDT,
  polygonContractAddressUSDT,
  arbitrumContractAddressUSDT,
  bscContractAddressUSDT,

  arbitrumContractAddressCKEC,
} from "../../../config/contractAddresses";


export async function POST(request: NextRequest) {

  const body = await request.json();


  /*
  const {
    queueId,
    status,
    chainId,
    fromAddress,
    toAddress,
    data,
    value,
    nonce,
    deployedContractAddress,
    deployedContractType,
    functionName,
    functionArgs,
    extension,
    gasLimit,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    transactionType,
    transactionHash,
    queuedAt,
    sentAt,
    minedAt,
    cancelledAt,
    errorMessage,
    sentAtBlockNumber,
    blockNumber,
    retryCount,
    onChainTxStatus,
    onchainStatus,
    effectiveGasPrice,
    cumulativeGasUsed,
    signerAddress,
    accountAddress,
    target,
    sender,
    initCode,
    callData,
    callGasLimit,
    verificationGasLimit,
    preVerificationGas,
    paymasterAndData,
    userOpHash,
    retryGasValues,
    retryMaxFeePerGas,
    retryMaxPriorityFeePerGas,
  } = body;
  */

  /*
  if (status === "mined") {


    const result = await updateBuyOrderByQueueId({
      queueId,
      transactionHash,
      minedAt,
    });

    console.log("updateBuyOrderByQueueId", result);

    if (result) {
      return NextResponse.json({
        result: "ok",
      });
    } else {
      return NextResponse.json({
        result: "error",
      });
    }


  }
  */

  const {
    data,
  } = body;

  console.log("data", data);

  /*
  data {
  chainId: 56,
  contractAddress: '0xeb0a5ea0001aa9f419bbaf8cedad265a60f0b10f',
  blockNumber: 56265858,
  transactionHash: '0x6f1c65f76b642bc63d889ca1229e2d564ce29fac7b472287274021dda36eac09',
  topics: [
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    '0x000000000000000000000000dee1e6e4f4b6ee8b9b11458d100db990082ac787',
    '0x000000000000000000000000dba19f3126eb135a0cea5766938a2d77ccf1db96'
  ],
  data: '0x0000000000000000000000000000000000000000000000000a0fb7a8a6288000',
  eventName: 'Transfer',
  decodedLog: {
    to: {
      type: 'address',
      value: '0xdBa19f3126eb135a0cEA5766938a2D77cCf1DB96'
    },
    from: {
      type: 'address',
      value: '0xDEe1E6E4F4b6eE8b9b11458D100DB990082ac787'
    },
    value: { type: 'uint256', value: '725000000000000000' }
  },
  timestamp: 1754197425000,
  transactionIndex: 96,
  logIndex: 723
}
  */




  const {
    chainId,
    contractAddress,
    blockNumber,
    transactionHash,
    topics,
    eventName,
    decodedLog,
    timestamp,
    transactionIndex,
    logIndex,
  } = data;


  



  const toAddress = decodedLog.to.value;
  const fromAddress = decodedLog.from.value;
  const value = decodedLog.value.value;

  const amount = value / 1e18; // Convert from wei to ether (assuming 18 decimals)



  if (contractAddress.toLowerCase() === arbitrumContractAddressCKEC.toLowerCase()) {


    console.log("toAddress", toAddress);
    console.log("fromAddress", fromAddress);
    console.log("amount", amount);

    // get buy order by escrow wallet address
    const buyOrder = await getBuyOrderByEscrowWalletAddress({
      escrowWalletAddress: toAddress,
    });
    if (buyOrder) {
      //console.log("buyOrder", buyOrder);

      // update buy order escrow balance
      const result = await updateBuyOrderEscrowBalance({
        orderId: buyOrder._id,
        escrowBalance: amount,
        transactionHash: transactionHash,
      });

      console.log("updateBuyOrderEscrowBalance result", result);

      /*
      if (result) {
        return NextResponse.json({
          result: "ok",
        });
      } else {
        return NextResponse.json({
          result: "error",
        });
      }
      */

    } else {
      console.log("No buy order found for escrow wallet address", toAddress);
    }

  }



  const result = insertOne({
    contractAddress,
    transactionHash,
    transactionIndex,
    fromAddress,
    toAddress,
    value,
    timestamp,
    //fromUser,
    //toUser,
  });



  /*
  const result = insertOne({
    transactionHash,
    transactionIndex,
    fromAddress,
    toAddress,
    value,
    timestamp,
  });
  */

  console.log("insertOne", result);
  
  

  return NextResponse.json({
    result: "ok",
  });








  
}
