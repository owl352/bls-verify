const loadBls = require('@dashevo/bls')
const { GetIdentityBalanceRequest, PlatformDefinition, StateId, CanonicalVote, SignedMsgType } = require('./platform.js')
const { createChannel, createClient } = require('nice-grpc-web')
const { base58 } = require('@scure/base')
const fs = require('fs')
const { verifyIdentityBalanceForIdentityId, initSync } = require('./pkg')
const wire = require('@bufbuild/protobuf/wire')
const sha256 = require('sha256')

async function getIdentityBalanceProof (identifier) {
  const channel = createChannel('https://52.42.202.128:1443/')

  const client = createClient(PlatformDefinition, channel)

  const getIdentityBalanceRequest = GetIdentityBalanceRequest.fromPartial({
    v0: {
      id: base58.decode(identifier), prove: true
    }
  })

  const { v0 } = await client.getIdentityBalance(getIdentityBalanceRequest)

  const { proof, metadata } = v0

  return { proof, metadata }
}

async function getRootHashForIdentityBalance (grovedbProof, identifier) {
  const { root_hash: rootHash } = verifyIdentityBalanceForIdentityId(grovedbProof, base58.decode(identifier), true, 1)

  return rootHash
}

async function getQuorumPublicKey (quorumType, quorumHash) {
  // typically http://localhost:19998/
  const baseUrl = 'https://trpc.digitalcash.dev/'
  const basicAuth = btoa('user:pass')
  const payload = JSON.stringify({
    method: 'quorum', params: ['info', quorumType, quorumHash]
  })
  const resp = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`, 'Content-Type': 'application/json'
    },
    body: payload
  })

  const data = await resp.json()
  if (data.error) {
    const err = new Error(data.error.message)
    Object.assign(err, data.error)
    throw err
  }
  return data.result
}

function calculateStateIdHash (stateId) {
  const encoded = StateId.encode(stateId).finish()

  const writer = new wire.BinaryWriter()

  writer.bytes(encoded)

  return sha256(writer.finish(), { asBytes: true })
}

function signRequestId (prefix, height, round) {
  const prefixBuf = Buffer.from(prefix, 'utf8')

  // len + i64 + i32
  const buf = Buffer.alloc(prefixBuf.length + 8 + 4)

  prefixBuf.copy(buf, 0)
  buf.writeBigInt64LE(height, prefixBuf.length)
  buf.writeInt32LE(round, prefixBuf.length + 8)

  return sha256(buf, { asBytes: true })
}

function calculateMsgHash (chainId, height, round, type, blockId, stateId) {
  const fixedSize = 4 + 8 + 8 + 32 + 32
  const buf = Buffer.alloc(fixedSize + Buffer.byteLength(chainId))

  let offset = 0

  buf.writeInt32LE(type, offset)
  offset += 4

  buf.writeBigInt64LE(height, offset)
  offset += 8

  buf.writeBigInt64LE(BigInt(round), offset)
  offset += 8

  Buffer.from(blockId).copy(buf, offset)
  offset += 32

  Buffer.from(stateId).copy(buf, offset)
  offset += 32

  if (offset !== fixedSize) {
    throw new Error('Invalid input length while encoding sign bytes')
  }

  buf.write(chainId, offset, 'utf8')

  return sha256(buf, { asBytes: true })
}

function signHash (quorumType, quorumHash, requestId, signBytesHash) {
  const buf = Buffer.concat([
    Buffer.from([quorumType]),
    Buffer.from(quorumHash).reverse(),
    Buffer.from(requestId).reverse(),
    Buffer.from(signBytesHash).reverse()
  ])

  return sha256(sha256(buf, { asBytes: true }), { asBytes: true })
}

function calculateSignHash (commit, chainId, quorumType, quorumHash, height, round) {
  const requestId = signRequestId('dpbvote', height, round)
  const signBytesHash = calculateMsgHash(chainId, height, round, commit.type, commit.blockId, commit.stateId)

  return signHash(quorumType, quorumHash, requestId, signBytesHash)
}

async function verifyTenderdashProof (proof, metadata, rootHash, quorumPublicKey) {
  const stateId = StateId.fromPartial({
    appVersion: metadata.protocolVersion,
    coreChainLockedHeight: metadata.coreChainLockedHeight,
    time: metadata.timeMs,
    appHash: rootHash,
    height: metadata.height
  })

  const stateIdHash = calculateStateIdHash(stateId)

  const commit = CanonicalVote.fromPartial({
    type: SignedMsgType.PRECOMMIT,
    blockId: proof.blockIdHash,
    chainId: metadata.chainId,
    height: BigInt(metadata.height),
    round: proof.round,
    stateId: stateIdHash
  })

  const signDigest = calculateSignHash(
    commit,
    metadata.chainId,
    proof.quorumType,
    proof.quorumHash,
    BigInt(metadata.height),
    proof.round,
    SignedMsgType.PRECOMMIT,
    proof.blockIdHash,
    stateIdHash
  )

  const { signature } = proof

  const BLS = await loadBls()

  const pubKey = BLS.G1Element.fromBytes(Buffer.from(quorumPublicKey, 'hex'))

  const signatureElement = BLS.G2Element.fromBytes(signature)

  return BLS.BasicSchemeMPL.verify(pubKey, Uint8Array.from(signDigest), signatureElement)
}

async function main () {
  initSync({ module: fs.readFileSync('./pkg/wasm/wasm_drive_verify_bg.wasm') })

  const identifier = '8VKxmxaJpBetf372woNKu1znvGFg7iauBM1EynT6GF2h'

  const { proof, metadata } = await getIdentityBalanceProof(identifier)

  const rootHash = await getRootHashForIdentityBalance(proof.grovedbProof, identifier)
  const { quorumPublicKey } = await getQuorumPublicKey(proof.quorumType, Buffer.from(proof.quorumHash).toString('hex'))

  const verify = await verifyTenderdashProof(proof, metadata, rootHash, quorumPublicKey)

  console.log(verify)
}

main().catch(console.error)
