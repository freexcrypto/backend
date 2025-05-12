import axios from "axios";

export async function checkLiskTokenPayment(
  destinationWallet: string,
  amount: string
) {
  const contract = "0x18Bc5bcC660cf2B9cE3cd51a404aFe1a0cBD3C22";
  const url = `https://blockscout.lisk.com/api?module=account&action=tokentx&address=${destinationWallet}&contractaddress=${contract}`;
  const response = await axios.get(url);
  if (response.data.status !== "1") return null;

  // Find a transaction with the expected amount (amount is in token's smallest unit, check decimals)
  const tx = response.data.result.find(
    (tx: any) =>
      tx.to.toLowerCase() === destinationWallet.toLowerCase() &&
      tx.value === amount
  );
  return tx || null;
}
