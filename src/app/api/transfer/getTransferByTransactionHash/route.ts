import { NextResponse, type NextRequest } from "next/server";

import {
    getTransferByTransactionHash,
} from '@lib/api/transfer';

export async function POST(request: NextRequest) {

  const body = await request.json();

  const { transactionHash } = body;

  console.log("transactionHash", transactionHash);


  const result = await getTransferByTransactionHash({
    transactionHash: transactionHash,
  });

  return NextResponse.json({

    result,
    
  });
  
}
