/**
 * Official Fiber documentation on https://docs.fiber.world/
 *
 * Note: There are no separate /connect-peers or /open-channel pages; those
 * steps live inside the Basic transfer guide. Always use docs.fiber.world
 * (not www.fiber.world) for this site.
 */
const QUICK = "https://docs.fiber.world/docs/quick-start";

export const fiberResources = {
  runNode: `${QUICK}/run-a-node`,
  /** Includes “Connect the Nodes” and “Open a Payment Channel” (no separate doc URLs). */
  basicTransfer: `${QUICK}/basic-transfer`,
  connectPublic: `${QUICK}/connect-nodes`,
  stablecoin: `${QUICK}/transfer-stablecoin`,
  fiberDocs: "https://docs.fiber.world/",
  fiberReleases: "https://github.com/nervosnetwork/fiber/releases",
  fiberRepo: "https://github.com/nervosnetwork/fiber",
  fiberReadme:
    "https://github.com/nervosnetwork/fiber/blob/develop/README.md",
  fiberPublicNodes:
    "https://github.com/nervosnetwork/fiber/blob/develop/docs/public-nodes.md",
  ckbPublicRpc:
    "https://github.com/nervosnetwork/ckb/wiki/Public-JSON-RPC-nodes",
  fiberRpcReadme:
    "https://github.com/nervosnetwork/fiber/blob/develop/crates/fiber-lib/src/rpc/README.md",
} as const;
