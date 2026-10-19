block = await tronWeb.trx.getCurrentBlock();
console.log(block.block_header.raw_data.number);
console.log(block.blockID);
console.log(new Date(block.block_header.raw_data.timestamp).toISOString());
