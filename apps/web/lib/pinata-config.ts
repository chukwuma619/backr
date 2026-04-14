"server only"

import { PinataSDK } from "pinata"

const pinataJwt = process.env.PINATA_JWT;
const pinataGateway = process.env.NEXT_PUBLIC_GATEWAY_URL;

if (!pinataJwt) {
  throw new Error("Missing PINATA_JWT environment variable.");
}

if (!pinataGateway) {
  throw new Error("Missing NEXT_PUBLIC_GATEWAY_URL environment variable.");
}

export const pinata = new PinataSDK({
  pinataJwt,
  pinataGateway,
});