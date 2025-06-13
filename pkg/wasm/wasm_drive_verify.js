import { default as default1 } from '../identifier/Identifier.js'
import { set } from 'lodash-es'

let wasm

let WASM_VECTOR_LEN = 0

let cachedUint8ArrayMemory0 = null

function getUint8ArrayMemory0 () {
  if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer)
  }
  return cachedUint8ArrayMemory0
}

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } })

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
  ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view)
  }
  : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg)
    view.set(buf)
    return {
      read: arg.length,
      written: buf.length
    }
  })

function passStringToWasm0 (arg, malloc, realloc) {
  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg)
    const ptr = malloc(buf.length, 1) >>> 0
    getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf)
    WASM_VECTOR_LEN = buf.length
    return ptr
  }

  let len = arg.length
  let ptr = malloc(len, 1) >>> 0

  const mem = getUint8ArrayMemory0()

  let offset = 0

  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset)
    if (code > 0x7F) break
    mem[ptr + offset] = code
  }

  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset)
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0
    const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len)
    const ret = encodeString(arg, view)

    offset += ret.written
    ptr = realloc(ptr, len, offset, 1) >>> 0
  }

  WASM_VECTOR_LEN = offset
  return ptr
}

let cachedDataViewMemory0 = null

function getDataViewMemory0 () {
  if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
    cachedDataViewMemory0 = new DataView(wasm.memory.buffer)
  }
  return cachedDataViewMemory0
}

function addToExternrefTable0 (obj) {
  const idx = wasm.__externref_table_alloc()
  wasm.__wbindgen_export_4.set(idx, obj)
  return idx
}

function handleError (f, args) {
  try {
    return f.apply(this, args)
  } catch (e) {
    const idx = addToExternrefTable0(e)
    wasm.__wbindgen_exn_store(idx)
  }
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } })

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode() };

function getStringFromWasm0 (ptr, len) {
  ptr = ptr >>> 0
  return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len))
}

function getArrayU8FromWasm0 (ptr, len) {
  ptr = ptr >>> 0
  return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len)
}

function isLikeNone (x) {
  return x === undefined || x === null
}

function passArray8ToWasm0 (arg, malloc) {
  const ptr = malloc(arg.length * 1, 1) >>> 0
  getUint8ArrayMemory0().set(arg, ptr / 1)
  WASM_VECTOR_LEN = arg.length
  return ptr
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(state => {
    wasm.__wbindgen_export_6.get(state.dtor)(state.a, state.b)
  })

function makeMutClosure (arg0, arg1, dtor, f) {
  const state = { a: arg0, b: arg1, cnt: 1, dtor }
  const real = (...args) => {
    // First up with a closure we increment the internal reference
    // count. This ensures that the Rust closure environment won't
    // be deallocated while we're invoking it.
    state.cnt++
    const a = state.a
    state.a = 0
    try {
      return f(a, state.b, ...args)
    } finally {
      if (--state.cnt === 0) {
        wasm.__wbindgen_export_6.get(state.dtor)(a, state.b)
        CLOSURE_DTORS.unregister(state)
      } else {
        state.a = a
      }
    }
  }
  real.original = state
  CLOSURE_DTORS.register(real, state, state)
  return real
}

function debugString (val) {
  // primitive types
  const type = typeof val
  if (type == 'number' || type == 'boolean' || val == null) {
    return `${val}`
  }
  if (type == 'string') {
    return `"${val}"`
  }
  if (type == 'symbol') {
    const description = val.description
    if (description == null) {
      return 'Symbol'
    } else {
      return `Symbol(${description})`
    }
  }
  if (type == 'function') {
    const name = val.name
    if (typeof name === 'string' && name.length > 0) {
      return `Function(${name})`
    } else {
      return 'Function'
    }
  }
  // objects
  if (Array.isArray(val)) {
    const length = val.length
    let debug = '['
    if (length > 0) {
      debug += debugString(val[0])
    }
    for (let i = 1; i < length; i++) {
      debug += ', ' + debugString(val[i])
    }
    debug += ']'
    return debug
  }
  // Test for built-in
  const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val))
  let className
  if (builtInMatches && builtInMatches.length > 1) {
    className = builtInMatches[1]
  } else {
    // Failed to match the standard '[object ClassName]'
    return toString.call(val)
  }
  if (className == 'Object') {
    // we're a user defined class or Object
    // JSON.stringify avoids problems with cycles, and is generally much
    // easier than looping through ownProperties of `val`.
    try {
      return 'Object(' + JSON.stringify(val) + ')'
    } catch (_) {
      return 'Object'
    }
  }
  // errors
  if (val instanceof Error) {
    return `${val.name}: ${val.message}\n${val.stack}`
  }
  // TODO we could test for more things here, like `Set`s and `Map`s.
  return className
}

function takeFromExternrefTable0 (idx) {
  const value = wasm.__wbindgen_export_4.get(idx)
  wasm.__externref_table_dealloc(idx)
  return value
}
/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} contract_id
 * @param {number} group_contract_position
 * @param {number | null | undefined} action_status
 * @param {Uint8Array} action_id
 * @param {Uint8Array} action_signer_id
 * @param {boolean} is_proof_subset
 * @param {number} platform_version_number
 * @returns {VerifyActionSignersTotalPowerResult}
 */
export function verifyActionSignersTotalPower (proof, contract_id, group_contract_position, action_status, action_id, action_signer_id, is_proof_subset, platform_version_number) {
  const ret = wasm.verifyActionSignersTotalPower(proof, contract_id, group_contract_position, isLikeNone(action_status) ? 0xFFFFFF : action_status, action_id, action_signer_id, is_proof_subset, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyActionSignersTotalPowerResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {any} token_ids
 * @param {Uint8Array} identity_id
 * @param {boolean} verify_subset_of_proof
 * @param {number} platform_version_number
 * @returns {VerifyTokenBalancesForIdentityIdResult}
 */
export function verifyTokenBalancesForIdentityIdVec (proof, token_ids, identity_id, verify_subset_of_proof, platform_version_number) {
  const ret = wasm.verifyTokenBalancesForIdentityIdVec(proof, token_ids, identity_id, verify_subset_of_proof, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyTokenBalancesForIdentityIdResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {any} token_ids
 * @param {Uint8Array} identity_id
 * @param {boolean} verify_subset_of_proof
 * @param {number} platform_version_number
 * @returns {VerifyTokenBalancesForIdentityIdResult}
 */
export function verifyTokenBalancesForIdentityIdMap (proof, token_ids, identity_id, verify_subset_of_proof, platform_version_number) {
  const ret = wasm.verifyTokenBalancesForIdentityIdMap(proof, token_ids, identity_id, verify_subset_of_proof, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyTokenBalancesForIdentityIdResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {any} token_ids
 * @param {boolean} verify_subset_of_proof
 * @param {number} platform_version_number
 * @returns {VerifyTokenDirectSellingPricesResult}
 */
export function verifyTokenDirectSellingPricesVec (proof, token_ids, verify_subset_of_proof, platform_version_number) {
  const ret = wasm.verifyTokenDirectSellingPricesVec(proof, token_ids, verify_subset_of_proof, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyTokenDirectSellingPricesResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {any} token_ids
 * @param {boolean} verify_subset_of_proof
 * @param {number} platform_version_number
 * @returns {VerifyTokenDirectSellingPricesResult}
 */
export function verifyTokenDirectSellingPricesMap (proof, token_ids, verify_subset_of_proof, platform_version_number) {
  const ret = wasm.verifyTokenDirectSellingPricesMap(proof, token_ids, verify_subset_of_proof, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyTokenDirectSellingPricesResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {any} token_ids
 * @param {Uint8Array} identity_id
 * @param {boolean} verify_subset_of_proof
 * @param {number} platform_version_number
 * @returns {VerifyTokenInfosForIdentityIdResult}
 */
export function verifyTokenInfosForIdentityIdVec (proof, token_ids, identity_id, verify_subset_of_proof, platform_version_number) {
  const ret = wasm.verifyTokenInfosForIdentityIdVec(proof, token_ids, identity_id, verify_subset_of_proof, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyTokenInfosForIdentityIdResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {any} token_ids
 * @param {Uint8Array} identity_id
 * @param {boolean} verify_subset_of_proof
 * @param {number} platform_version_number
 * @returns {VerifyTokenInfosForIdentityIdResult}
 */
export function verifyTokenInfosForIdentityIdMap (proof, token_ids, identity_id, verify_subset_of_proof, platform_version_number) {
  const ret = wasm.verifyTokenInfosForIdentityIdMap(proof, token_ids, identity_id, verify_subset_of_proof, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyTokenInfosForIdentityIdResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} token_id
 * @param {boolean} is_proof_subset
 * @param {any} identity_ids
 * @param {number} platform_version_number
 * @returns {VerifyTokenInfosForIdentityIdsResult}
 */
export function verifyTokenInfosForIdentityIdsVec (proof, token_id, is_proof_subset, identity_ids, platform_version_number) {
  const ret = wasm.verifyTokenInfosForIdentityIdsVec(proof, token_id, is_proof_subset, identity_ids, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyTokenInfosForIdentityIdsResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} token_id
 * @param {boolean} is_proof_subset
 * @param {any} identity_ids
 * @param {number} platform_version_number
 * @returns {VerifyTokenInfosForIdentityIdsResult}
 */
export function verifyTokenInfosForIdentityIdsMap (proof, token_id, is_proof_subset, identity_ids, platform_version_number) {
  const ret = wasm.verifyTokenInfosForIdentityIdsMap(proof, token_id, is_proof_subset, identity_ids, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyTokenInfosForIdentityIdsResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {any} token_ids
 * @param {boolean} verify_subset_of_proof
 * @param {number} platform_version_number
 * @returns {VerifyTokenStatusesResult}
 */
export function verifyTokenStatusesVec (proof, token_ids, verify_subset_of_proof, platform_version_number) {
  const ret = wasm.verifyTokenStatusesVec(proof, token_ids, verify_subset_of_proof, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyTokenStatusesResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {any} token_ids
 * @param {boolean} verify_subset_of_proof
 * @param {number} platform_version_number
 * @returns {VerifyTokenStatusesResult}
 */
export function verifyTokenStatusesMap (proof, token_ids, verify_subset_of_proof, platform_version_number) {
  const ret = wasm.verifyTokenStatusesMap(proof, token_ids, verify_subset_of_proof, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyTokenStatusesResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} token_id
 * @param {boolean} verify_subset_of_proof
 * @param {number} platform_version_number
 * @returns {VerifyTokenStatusResult}
 */
export function verifyTokenStatus (proof, token_id, verify_subset_of_proof, platform_version_number) {
  const ret = wasm.verifyTokenStatus(proof, token_id, verify_subset_of_proof, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyTokenStatusResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Array<any>} identity_ids
 * @param {Uint8Array} contract_id
 * @param {string | null | undefined} document_type_name
 * @param {Array<any>} purposes
 * @param {boolean} is_proof_subset
 * @param {number} platform_version_number
 * @returns {VerifyIdentitiesContractKeysResult}
 */
export function verifyIdentitiesContractKeys (proof, identity_ids, contract_id, document_type_name, purposes, is_proof_subset, platform_version_number) {
  const ptr0 = isLikeNone(document_type_name) ? 0 : passStringToWasm0(document_type_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
  const len0 = WASM_VECTOR_LEN
  const ret = wasm.verifyIdentitiesContractKeys(proof, identity_ids, contract_id, ptr0, len0, purposes, is_proof_subset, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyIdentitiesContractKeysResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} identity_id
 * @param {Uint8Array} contract_id
 * @param {boolean} verify_subset_of_proof
 * @param {number} platform_version_number
 * @returns {VerifyIdentityContractNonceResult}
 */
export function verifyIdentityContractNonce (proof, identity_id, contract_id, verify_subset_of_proof, platform_version_number) {
  const ret = wasm.verifyIdentityContractNonce(proof, identity_id, contract_id, verify_subset_of_proof, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyIdentityContractNonceResult.__wrap(ret[0])
}

/**
 * @param {any} state_transition_js
 * @param {bigint} block_height
 * @param {bigint} block_time_ms
 * @param {number} block_core_height
 * @param {Uint8Array} proof
 * @param {any} known_contracts_js
 * @param {number} platform_version_number
 * @returns {VerifyStateTransitionWasExecutedWithProofResult}
 */
export function verifyStateTransitionWasExecutedWithProof (state_transition_js, block_height, block_time_ms, block_core_height, proof, known_contracts_js, platform_version_number) {
  const ret = wasm.verifyStateTransitionWasExecutedWithProof(state_transition_js, block_height, block_time_ms, block_core_height, proof, known_contracts_js, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyStateTransitionWasExecutedWithProofResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} token_id
 * @param {Uint8Array} identity_id
 * @param {boolean} verify_subset_of_proof
 * @param {number} platform_version_number
 * @returns {VerifyTokenInfoForIdentityIdResult}
 */
export function verifyTokenInfoForIdentityId (proof, token_id, identity_id, verify_subset_of_proof, platform_version_number) {
  const ret = wasm.verifyTokenInfoForIdentityId(proof, token_id, identity_id, verify_subset_of_proof, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyTokenInfoForIdentityIdResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {any} contract_js
 * @param {string} document_type_name
 * @param {any} where_clauses
 * @param {any} order_by
 * @param {number | null | undefined} limit
 * @param {number | null | undefined} offset
 * @param {Uint8Array | null | undefined} start_at
 * @param {boolean} start_at_included
 * @param {bigint | null | undefined} block_time_ms
 * @param {number} platform_version_number
 * @returns {VerifyDocumentProofResult}
 */
export function verifyDocumentProof (proof, contract_js, document_type_name, where_clauses, order_by, limit, offset, start_at, start_at_included, block_time_ms, platform_version_number) {
  const ptr0 = passStringToWasm0(document_type_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
  const len0 = WASM_VECTOR_LEN
  const ret = wasm.verifyDocumentProof(proof, contract_js, ptr0, len0, where_clauses, order_by, isLikeNone(limit) ? 0xFFFFFF : limit, isLikeNone(offset) ? 0xFFFFFF : offset, isLikeNone(start_at) ? 0 : addToExternrefTable0(start_at), start_at_included, !isLikeNone(block_time_ms), isLikeNone(block_time_ms) ? BigInt(0) : block_time_ms, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyDocumentProofResult.__wrap(ret[0])
}

/**
 * @param {any} token_transition_js
 * @param {any} contract_js
 * @param {Uint8Array} owner_id
 * @param {number} platform_version_number
 * @returns {TokenTransitionPathQueryResult}
 */
export function tokenTransitionIntoPathQuery (token_transition_js, contract_js, owner_id, platform_version_number) {
  const ret = wasm.tokenTransitionIntoPathQuery(token_transition_js, contract_js, owner_id, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return TokenTransitionPathQueryResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} token_id
 * @param {Uint8Array} identity_id
 * @returns {TokenTransitionPathQueryResult}
 */
export function tokenBalanceForIdentityIdQuery (token_id, identity_id) {
  const ret = wasm.tokenBalanceForIdentityIdQuery(token_id, identity_id)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return TokenTransitionPathQueryResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} token_id
 * @param {any} identity_ids_js
 * @returns {TokenTransitionPathQueryResult}
 */
export function tokenBalancesForIdentityIdsQuery (token_id, identity_ids_js) {
  const ret = wasm.tokenBalancesForIdentityIdsQuery(token_id, identity_ids_js)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return TokenTransitionPathQueryResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} token_id
 * @param {Uint8Array} identity_id
 * @returns {TokenTransitionPathQueryResult}
 */
export function tokenInfoForIdentityIdQuery (token_id, identity_id) {
  const ret = wasm.tokenInfoForIdentityIdQuery(token_id, identity_id)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return TokenTransitionPathQueryResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} token_id
 * @returns {TokenTransitionPathQueryResult}
 */
export function tokenDirectPurchasePriceQuery (token_id) {
  const ret = wasm.tokenDirectPurchasePriceQuery(token_id)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return TokenTransitionPathQueryResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} contract_id
 * @param {number} group_contract_position
 * @param {Uint8Array} action_id
 * @param {Uint8Array} identity_id
 * @returns {TokenTransitionPathQueryResult}
 */
export function groupActiveAndClosedActionSingleSignerQuery (contract_id, group_contract_position, action_id, identity_id) {
  const ret = wasm.groupActiveAndClosedActionSingleSignerQuery(contract_id, group_contract_position, action_id, identity_id)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return TokenTransitionPathQueryResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} token_id
 * @param {Uint8Array} identity_id
 * @param {any} distribution_type_js
 * @param {boolean} verify_subset_of_proof
 * @param {number} platform_version_number
 * @returns {VerifyTokenPerpetualDistributionLastPaidTimeResult}
 */
export function verifyTokenPerpetualDistributionLastPaidTime (proof, token_id, identity_id, distribution_type_js, verify_subset_of_proof, platform_version_number) {
  const ret = wasm.verifyTokenPerpetualDistributionLastPaidTime(proof, token_id, identity_id, distribution_type_js, verify_subset_of_proof, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyTokenPerpetualDistributionLastPaidTimeResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} contract_cbor
 * @param {string} document_type_name
 * @param {string} index_name
 * @param {Uint8Array} contested_document_resource_vote_poll_bytes
 * @param {string} result_type
 * @param {boolean} allow_include_locked_and_abstaining_vote_tally
 * @param {number} platform_version_number
 * @returns {VerifyVotePollVoteStateProofResult}
 */
export function verifyVotePollVoteStateProof (proof, contract_cbor, document_type_name, index_name, contested_document_resource_vote_poll_bytes, result_type, allow_include_locked_and_abstaining_vote_tally, platform_version_number) {
  const ptr0 = passStringToWasm0(document_type_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
  const len0 = WASM_VECTOR_LEN
  const ptr1 = passStringToWasm0(index_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
  const len1 = WASM_VECTOR_LEN
  const ptr2 = passStringToWasm0(result_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
  const len2 = WASM_VECTOR_LEN
  const ret = wasm.verifyVotePollVoteStateProof(proof, contract_cbor, ptr0, len0, ptr1, len1, contested_document_resource_vote_poll_bytes, ptr2, len2, allow_include_locked_and_abstaining_vote_tally, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyVotePollVoteStateProofResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} contract_cbor
 * @param {string} document_type_name
 * @param {string} index_name
 * @param {Uint8Array} contestant_id
 * @param {Uint8Array} contested_document_resource_vote_poll_bytes
 * @param {Uint8Array | null | undefined} start_at
 * @param {number | null | undefined} limit
 * @param {boolean} order_ascending
 * @param {number} platform_version_number
 * @returns {VerifyVotePollVotesProofResult}
 */
export function verifyVotePollVotesProof (proof, contract_cbor, document_type_name, index_name, contestant_id, contested_document_resource_vote_poll_bytes, start_at, limit, order_ascending, platform_version_number) {
  const ptr0 = passStringToWasm0(document_type_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
  const len0 = WASM_VECTOR_LEN
  const ptr1 = passStringToWasm0(index_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
  const len1 = WASM_VECTOR_LEN
  const ret = wasm.verifyVotePollVotesProof(proof, contract_cbor, ptr0, len0, ptr1, len1, contestant_id, contested_document_resource_vote_poll_bytes, isLikeNone(start_at) ? 0 : addToExternrefTable0(start_at), isLikeNone(limit) ? 0xFFFFFF : limit, order_ascending, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyVotePollVotesProofResult.__wrap(ret[0])
}

/**
 * Verify action signers and return as an array of [signer_id, power] pairs
 * @param {Uint8Array} proof
 * @param {Uint8Array} contract_id
 * @param {number} group_contract_position
 * @param {number} action_status
 * @param {Uint8Array} action_id
 * @param {boolean} is_proof_subset
 * @param {number} platform_version_number
 * @returns {VerifyActionSignersResult}
 */
export function verifyActionSignersVec (proof, contract_id, group_contract_position, action_status, action_id, is_proof_subset, platform_version_number) {
  const ret = wasm.verifyActionSignersVec(proof, contract_id, group_contract_position, action_status, action_id, is_proof_subset, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyActionSignersResult.__wrap(ret[0])
}

/**
 * Verify action signers and return as a map with signer_id as key
 * @param {Uint8Array} proof
 * @param {Uint8Array} contract_id
 * @param {number} group_contract_position
 * @param {number} action_status
 * @param {Uint8Array} action_id
 * @param {boolean} is_proof_subset
 * @param {number} platform_version_number
 * @returns {VerifyActionSignersResult}
 */
export function verifyActionSignersMap (proof, contract_id, group_contract_position, action_status, action_id, is_proof_subset, platform_version_number) {
  const ret = wasm.verifyActionSignersMap(proof, contract_id, group_contract_position, action_status, action_id, is_proof_subset, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyActionSignersResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {number} platform_version_number
 * @returns {VerifyUpgradeStateResult}
 */
export function verifyUpgradeState (proof, platform_version_number) {
  const ret = wasm.verifyUpgradeState(proof, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyUpgradeStateResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} token_id
 * @param {Uint8Array} identity_id
 * @param {boolean} verify_subset_of_proof
 * @param {number} platform_version_number
 * @returns {VerifyTokenBalanceForIdentityIdResult}
 */
export function verifyTokenBalanceForIdentityId (proof, token_id, identity_id, verify_subset_of_proof, platform_version_number) {
  const ret = wasm.verifyTokenBalanceForIdentityId(proof, token_id, identity_id, verify_subset_of_proof, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyTokenBalanceForIdentityIdResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {boolean | null | undefined} contract_known_keeps_history
 * @param {boolean} is_proof_subset
 * @param {boolean} in_multiple_contract_proof_form
 * @param {Uint8Array} contract_id
 * @param {number} platform_version_number
 * @returns {VerifyContractResult}
 */
export function verifyContract (proof, contract_known_keeps_history, is_proof_subset, in_multiple_contract_proof_form, contract_id, platform_version_number) {
  const ret = wasm.verifyContract(proof, isLikeNone(contract_known_keeps_history) ? 0xFFFFFF : contract_known_keeps_history ? 1 : 0, is_proof_subset, in_multiple_contract_proof_form, contract_id, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyContractResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} contract_id
 * @param {bigint} start_at_date
 * @param {number | null | undefined} limit
 * @param {number | null | undefined} offset
 * @param {number} platform_version_number
 * @returns {VerifyContractHistoryResult}
 */
export function verifyContractHistory (proof, contract_id, start_at_date, limit, offset, platform_version_number) {
  const ret = wasm.verifyContractHistory(proof, contract_id, start_at_date, isLikeNone(limit) ? 0xFFFFFF : limit, isLikeNone(offset) ? 0xFFFFFF : offset, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyContractHistoryResult.__wrap(ret[0])
}

/**
 * Verify action infos in contract and return as an array of [action_id, action] pairs
 * @param {Uint8Array} proof
 * @param {Uint8Array} contract_id
 * @param {number} group_contract_position
 * @param {number} action_status
 * @param {Uint8Array | null | undefined} start_action_id
 * @param {boolean | null | undefined} start_at_included
 * @param {number | null | undefined} limit
 * @param {boolean} is_proof_subset
 * @param {number} platform_version_number
 * @returns {VerifyActionInfosInContractResult}
 */
export function verifyActionInfosInContractVec (proof, contract_id, group_contract_position, action_status, start_action_id, start_at_included, limit, is_proof_subset, platform_version_number) {
  const ret = wasm.verifyActionInfosInContractVec(proof, contract_id, group_contract_position, action_status, isLikeNone(start_action_id) ? 0 : addToExternrefTable0(start_action_id), isLikeNone(start_at_included) ? 0xFFFFFF : start_at_included ? 1 : 0, isLikeNone(limit) ? 0xFFFFFF : limit, is_proof_subset, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyActionInfosInContractResult.__wrap(ret[0])
}

/**
 * Verify action infos in contract and return as a map with action_id as key
 * @param {Uint8Array} proof
 * @param {Uint8Array} contract_id
 * @param {number} group_contract_position
 * @param {number} action_status
 * @param {Uint8Array | null | undefined} start_action_id
 * @param {boolean | null | undefined} start_at_included
 * @param {number | null | undefined} limit
 * @param {boolean} is_proof_subset
 * @param {number} platform_version_number
 * @returns {VerifyActionInfosInContractResult}
 */
export function verifyActionInfosInContractMap (proof, contract_id, group_contract_position, action_status, start_action_id, start_at_included, limit, is_proof_subset, platform_version_number) {
  const ret = wasm.verifyActionInfosInContractMap(proof, contract_id, group_contract_position, action_status, isLikeNone(start_action_id) ? 0 : addToExternrefTable0(start_action_id), isLikeNone(start_at_included) ? 0xFFFFFF : start_at_included ? 1 : 0, isLikeNone(limit) ? 0xFFFFFF : limit, is_proof_subset, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyActionInfosInContractResult.__wrap(ret[0])
}

/**
 * Verify group infos in contract and return as an array of [position, group] pairs
 * @param {Uint8Array} proof
 * @param {Uint8Array} contract_id
 * @param {number | null | undefined} start_group_contract_position
 * @param {boolean | null | undefined} start_at_included
 * @param {number | null | undefined} limit
 * @param {boolean} is_proof_subset
 * @param {number} platform_version_number
 * @returns {VerifyGroupInfosInContractResult}
 */
export function verifyGroupInfosInContractVec (proof, contract_id, start_group_contract_position, start_at_included, limit, is_proof_subset, platform_version_number) {
  const ret = wasm.verifyGroupInfosInContractVec(proof, contract_id, isLikeNone(start_group_contract_position) ? 0xFFFFFF : start_group_contract_position, isLikeNone(start_at_included) ? 0xFFFFFF : start_at_included ? 1 : 0, isLikeNone(limit) ? 0xFFFFFF : limit, is_proof_subset, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyGroupInfosInContractResult.__wrap(ret[0])
}

/**
 * Verify group infos in contract and return as a map with position as key
 * @param {Uint8Array} proof
 * @param {Uint8Array} contract_id
 * @param {number | null | undefined} start_group_contract_position
 * @param {boolean | null | undefined} start_at_included
 * @param {number | null | undefined} limit
 * @param {boolean} is_proof_subset
 * @param {number} platform_version_number
 * @returns {VerifyGroupInfosInContractResult}
 */
export function verifyGroupInfosInContractMap (proof, contract_id, start_group_contract_position, start_at_included, limit, is_proof_subset, platform_version_number) {
  const ret = wasm.verifyGroupInfosInContractMap(proof, contract_id, isLikeNone(start_group_contract_position) ? 0xFFFFFF : start_group_contract_position, isLikeNone(start_at_included) ? 0xFFFFFF : start_at_included ? 1 : 0, isLikeNone(limit) ? 0xFFFFFF : limit, is_proof_subset, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyGroupInfosInContractResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {boolean} is_proof_subset
 * @param {any} identity_ids
 * @param {number} platform_version_number
 * @returns {VerifyIdentityBalancesForIdentityIdsResult}
 */
export function verifyIdentityBalancesForIdentityIdsVec (proof, is_proof_subset, identity_ids, platform_version_number) {
  const ret = wasm.verifyIdentityBalancesForIdentityIdsVec(proof, is_proof_subset, identity_ids, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyIdentityBalancesForIdentityIdsResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {boolean} is_proof_subset
 * @param {any} identity_ids
 * @param {number} platform_version_number
 * @returns {VerifyIdentityBalancesForIdentityIdsResult}
 */
export function verifyIdentityBalancesForIdentityIdsMap (proof, is_proof_subset, identity_ids, platform_version_number) {
  const ret = wasm.verifyIdentityBalancesForIdentityIdsMap(proof, is_proof_subset, identity_ids, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyIdentityBalancesForIdentityIdsResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} identity_id
 * @param {Array<any> | null | undefined} specific_key_ids
 * @param {boolean} with_revision
 * @param {boolean} with_balance
 * @param {boolean} is_proof_subset
 * @param {number | null | undefined} limit
 * @param {number | null | undefined} offset
 * @param {number} platform_version_number
 * @returns {VerifyIdentityKeysByIdentityIdResult}
 */
export function verifyIdentityKeysByIdentityId (proof, identity_id, specific_key_ids, with_revision, with_balance, is_proof_subset, limit, offset, platform_version_number) {
  const ret = wasm.verifyIdentityKeysByIdentityId(proof, identity_id, isLikeNone(specific_key_ids) ? 0 : addToExternrefTable0(specific_key_ids), with_revision, with_balance, is_proof_subset, isLikeNone(limit) ? 0xFFFFFF : limit, isLikeNone(offset) ? 0xFFFFFF : offset, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyIdentityKeysByIdentityIdResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array | null | undefined} start_protx_hash
 * @param {number} count
 * @param {number} platform_version_number
 * @returns {VerifyUpgradeVoteStatusResult}
 */
export function verifyUpgradeVoteStatus (proof, start_protx_hash, count, platform_version_number) {
  const ret = wasm.verifyUpgradeVoteStatus(proof, isLikeNone(start_protx_hash) ? 0 : addToExternrefTable0(start_protx_hash), count, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyUpgradeVoteStatusResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} token_id
 * @param {boolean} is_proof_subset
 * @param {any} identity_ids
 * @param {number} platform_version_number
 * @returns {VerifyTokenBalancesForIdentityIdsResult}
 */
export function verifyTokenBalancesForIdentityIdsVec (proof, token_id, is_proof_subset, identity_ids, platform_version_number) {
  const ret = wasm.verifyTokenBalancesForIdentityIdsVec(proof, token_id, is_proof_subset, identity_ids, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyTokenBalancesForIdentityIdsResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} token_id
 * @param {boolean} is_proof_subset
 * @param {any} identity_ids
 * @param {number} platform_version_number
 * @returns {VerifyTokenBalancesForIdentityIdsResult}
 */
export function verifyTokenBalancesForIdentityIdsMap (proof, token_id, is_proof_subset, identity_ids, platform_version_number) {
  const ret = wasm.verifyTokenBalancesForIdentityIdsMap(proof, token_id, is_proof_subset, identity_ids, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyTokenBalancesForIdentityIdsResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} token_id
 * @param {bigint | null | undefined} start_at_timestamp
 * @param {Uint8Array | null | undefined} start_at_identity_id
 * @param {number | null | undefined} limit
 * @param {boolean} verify_subset_of_proof
 * @param {number} platform_version_number
 * @returns {VerifyTokenPreProgrammedDistributionsResult}
 */
export function verifyTokenPreProgrammedDistributionsVec (proof, token_id, start_at_timestamp, start_at_identity_id, limit, verify_subset_of_proof, platform_version_number) {
  const ret = wasm.verifyTokenPreProgrammedDistributionsVec(proof, token_id, !isLikeNone(start_at_timestamp), isLikeNone(start_at_timestamp) ? BigInt(0) : start_at_timestamp, isLikeNone(start_at_identity_id) ? 0 : addToExternrefTable0(start_at_identity_id), isLikeNone(limit) ? 0xFFFFFF : limit, verify_subset_of_proof, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyTokenPreProgrammedDistributionsResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} token_id
 * @param {bigint | null | undefined} start_at_timestamp
 * @param {Uint8Array | null | undefined} start_at_identity_id
 * @param {number | null | undefined} limit
 * @param {boolean} verify_subset_of_proof
 * @param {number} platform_version_number
 * @returns {VerifyTokenPreProgrammedDistributionsResult}
 */
export function verifyTokenPreProgrammedDistributionsMap (proof, token_id, start_at_timestamp, start_at_identity_id, limit, verify_subset_of_proof, platform_version_number) {
  const ret = wasm.verifyTokenPreProgrammedDistributionsMap(proof, token_id, !isLikeNone(start_at_timestamp), isLikeNone(start_at_timestamp) ? BigInt(0) : start_at_timestamp, isLikeNone(start_at_identity_id) ? 0 : addToExternrefTable0(start_at_identity_id), isLikeNone(limit) ? 0xFFFFFF : limit, verify_subset_of_proof, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyTokenPreProgrammedDistributionsResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} token_id
 * @param {boolean} verify_subset_of_proof
 * @param {number} platform_version_number
 * @returns {VerifyTokenContractInfoResult}
 */
export function verifyTokenContractInfo (proof, token_id, verify_subset_of_proof, platform_version_number) {
  const ret = wasm.verifyTokenContractInfo(proof, token_id, verify_subset_of_proof, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyTokenContractInfoResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} specialized_balance_id
 * @param {boolean} verify_subset_of_proof
 * @param {number} platform_version_number
 * @returns {VerifySpecializedBalanceResult}
 */
export function verifySpecializedBalance (proof, specialized_balance_id, verify_subset_of_proof, platform_version_number) {
  const ret = wasm.verifySpecializedBalance(proof, specialized_balance_id, verify_subset_of_proof, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifySpecializedBalanceResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {any} public_key_hashes
 * @param {number} platform_version_number
 * @returns {VerifyFullIdentitiesByPublicKeyHashesResult}
 */
export function verifyFullIdentitiesByPublicKeyHashesVec (proof, public_key_hashes, platform_version_number) {
  const ret = wasm.verifyFullIdentitiesByPublicKeyHashesVec(proof, public_key_hashes, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyFullIdentitiesByPublicKeyHashesResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {any} public_key_hashes
 * @param {number} platform_version_number
 * @returns {VerifyFullIdentitiesByPublicKeyHashesResult}
 */
export function verifyFullIdentitiesByPublicKeyHashesMap (proof, public_key_hashes, platform_version_number) {
  const ret = wasm.verifyFullIdentitiesByPublicKeyHashesMap(proof, public_key_hashes, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyFullIdentitiesByPublicKeyHashesResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {boolean} is_proof_subset
 * @param {any} public_key_hashes
 * @param {number} platform_version_number
 * @returns {VerifyIdentityIdsByUniquePublicKeyHashesResult}
 */
export function verifyIdentityIdsByUniquePublicKeyHashesVec (proof, is_proof_subset, public_key_hashes, platform_version_number) {
  const ret = wasm.verifyIdentityIdsByUniquePublicKeyHashesVec(proof, is_proof_subset, public_key_hashes, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyIdentityIdsByUniquePublicKeyHashesResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {boolean} is_proof_subset
 * @param {any} public_key_hashes
 * @param {number} platform_version_number
 * @returns {VerifyIdentityIdsByUniquePublicKeyHashesResult}
 */
export function verifyIdentityIdsByUniquePublicKeyHashesMap (proof, is_proof_subset, public_key_hashes, platform_version_number) {
  const ret = wasm.verifyIdentityIdsByUniquePublicKeyHashesMap(proof, is_proof_subset, public_key_hashes, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyIdentityIdsByUniquePublicKeyHashesResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {boolean} is_proof_subset
 * @param {Uint8Array} identity_id
 * @param {number} platform_version_number
 * @returns {VerifyFullIdentityByIdentityIdResult}
 */
export function verifyFullIdentityByIdentityId (proof, is_proof_subset, identity_id, platform_version_number) {
  const ret = wasm.verifyFullIdentityByIdentityId(proof, is_proof_subset, identity_id, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyFullIdentityByIdentityIdResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} identity_id
 * @param {boolean} verify_subset_of_proof
 * @param {number} platform_version_number
 * @returns {VerifyIdentityNonceResult}
 */
export function verifyIdentityNonce (proof, identity_id, verify_subset_of_proof, platform_version_number) {
  const ret = wasm.verifyIdentityNonce(proof, identity_id, verify_subset_of_proof, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyIdentityNonceResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {number} epoch_index
 * @param {number | null | undefined} limit
 * @param {Uint8Array | null | undefined} start_at_proposer_id
 * @param {boolean | null | undefined} start_at_included
 * @param {number} platform_version_number
 * @returns {VerifyEpochProposersResult}
 */
export function verifyEpochProposersByRangeVec (proof, epoch_index, limit, start_at_proposer_id, start_at_included, platform_version_number) {
  const ret = wasm.verifyEpochProposersByRangeVec(proof, epoch_index, isLikeNone(limit) ? 0xFFFFFF : limit, isLikeNone(start_at_proposer_id) ? 0 : addToExternrefTable0(start_at_proposer_id), isLikeNone(start_at_included) ? 0xFFFFFF : start_at_included ? 1 : 0, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyEpochProposersResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {number} epoch_index
 * @param {number | null | undefined} limit
 * @param {Uint8Array | null | undefined} start_at_proposer_id
 * @param {boolean | null | undefined} start_at_included
 * @param {number} platform_version_number
 * @returns {VerifyEpochProposersResult}
 */
export function verifyEpochProposersByRangeMap (proof, epoch_index, limit, start_at_proposer_id, start_at_included, platform_version_number) {
  const ret = wasm.verifyEpochProposersByRangeMap(proof, epoch_index, isLikeNone(limit) ? 0xFFFFFF : limit, isLikeNone(start_at_proposer_id) ? 0 : addToExternrefTable0(start_at_proposer_id), isLikeNone(start_at_included) ? 0xFFFFFF : start_at_included ? 1 : 0, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyEpochProposersResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {number} epoch_index
 * @param {any} proposer_ids
 * @param {number} platform_version_number
 * @returns {VerifyEpochProposersResult}
 */
export function verifyEpochProposersByIdsVec (proof, epoch_index, proposer_ids, platform_version_number) {
  const ret = wasm.verifyEpochProposersByIdsVec(proof, epoch_index, proposer_ids, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyEpochProposersResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {number} epoch_index
 * @param {any} proposer_ids
 * @param {number} platform_version_number
 * @returns {VerifyEpochProposersResult}
 */
export function verifyEpochProposersByIdsMap (proof, epoch_index, proposer_ids, platform_version_number) {
  const ret = wasm.verifyEpochProposersByIdsMap(proof, epoch_index, proposer_ids, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyEpochProposersResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} identity_id
 * @param {boolean} verify_subset_of_proof
 * @param {number} platform_version_number
 * @returns {VerifyIdentityBalanceForIdentityIdResult}
 */
export function verifyIdentityBalanceForIdentityId (proof, identity_id, verify_subset_of_proof, platform_version_number) {
  const ret = wasm.verifyIdentityBalanceForIdentityId(proof, identity_id, verify_subset_of_proof, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyIdentityBalanceForIdentityIdResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {boolean} is_proof_subset
 * @param {Uint8Array} public_key_hash
 * @param {number} platform_version_number
 * @returns {VerifyIdentityIdByUniquePublicKeyHashResult}
 */
export function verifyIdentityIdByUniquePublicKeyHash (proof, is_proof_subset, public_key_hash, platform_version_number) {
  const ret = wasm.verifyIdentityIdByUniquePublicKeyHash(proof, is_proof_subset, public_key_hash, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyIdentityIdByUniquePublicKeyHashResult.__wrap(ret[0])
}

function _assertClass (instance, klass) {
  if (!(instance instanceof klass)) {
    throw new Error(`expected instance of ${klass.name}`)
  }
}
/**
 * Verify a single document proof and keep it serialized
 * @param {SingleDocumentDriveQueryWasm} query
 * @param {boolean} is_subset
 * @param {Uint8Array} proof
 * @param {number} platform_version_number
 * @returns {SingleDocumentProofResult}
 */
export function verifySingleDocumentProofKeepSerialized (query, is_subset, proof, platform_version_number) {
  _assertClass(query, SingleDocumentDriveQueryWasm)
  const ptr0 = passArray8ToWasm0(proof, wasm.__wbindgen_malloc)
  const len0 = WASM_VECTOR_LEN
  const ret = wasm.verifySingleDocumentProofKeepSerialized(query.__wbg_ptr, is_subset, ptr0, len0, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return SingleDocumentProofResult.__wrap(ret[0])
}

/**
 * Create a SingleDocumentDriveQuery for a non-contested document
 * @param {Uint8Array} contract_id
 * @param {string} document_type_name
 * @param {boolean} document_type_keeps_history
 * @param {Uint8Array} document_id
 * @param {number | null} [block_time_ms]
 * @returns {SingleDocumentDriveQueryWasm}
 */
export function createSingleDocumentQuery (contract_id, document_type_name, document_type_keeps_history, document_id, block_time_ms) {
  const ptr0 = passArray8ToWasm0(contract_id, wasm.__wbindgen_malloc)
  const len0 = WASM_VECTOR_LEN
  const ptr1 = passStringToWasm0(document_type_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
  const len1 = WASM_VECTOR_LEN
  const ptr2 = passArray8ToWasm0(document_id, wasm.__wbindgen_malloc)
  const len2 = WASM_VECTOR_LEN
  const ret = wasm.createSingleDocumentQuery(ptr0, len0, ptr1, len1, document_type_keeps_history, ptr2, len2, !isLikeNone(block_time_ms), isLikeNone(block_time_ms) ? 0 : block_time_ms)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return SingleDocumentDriveQueryWasm.__wrap(ret[0])
}

/**
 * Create a SingleDocumentDriveQuery for a maybe contested document
 * @param {Uint8Array} contract_id
 * @param {string} document_type_name
 * @param {boolean} document_type_keeps_history
 * @param {Uint8Array} document_id
 * @param {number | null} [block_time_ms]
 * @returns {SingleDocumentDriveQueryWasm}
 */
export function createSingleDocumentQueryMaybeContested (contract_id, document_type_name, document_type_keeps_history, document_id, block_time_ms) {
  const ptr0 = passArray8ToWasm0(contract_id, wasm.__wbindgen_malloc)
  const len0 = WASM_VECTOR_LEN
  const ptr1 = passStringToWasm0(document_type_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
  const len1 = WASM_VECTOR_LEN
  const ptr2 = passArray8ToWasm0(document_id, wasm.__wbindgen_malloc)
  const len2 = WASM_VECTOR_LEN
  const ret = wasm.createSingleDocumentQueryMaybeContested(ptr0, len0, ptr1, len1, document_type_keeps_history, ptr2, len2, !isLikeNone(block_time_ms), isLikeNone(block_time_ms) ? 0 : block_time_ms)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return SingleDocumentDriveQueryWasm.__wrap(ret[0])
}

/**
 * Create a SingleDocumentDriveQuery for a contested document
 * @param {Uint8Array} contract_id
 * @param {string} document_type_name
 * @param {boolean} document_type_keeps_history
 * @param {Uint8Array} document_id
 * @param {number | null} [block_time_ms]
 * @returns {SingleDocumentDriveQueryWasm}
 */
export function createSingleDocumentQueryContested (contract_id, document_type_name, document_type_keeps_history, document_id, block_time_ms) {
  const ptr0 = passArray8ToWasm0(contract_id, wasm.__wbindgen_malloc)
  const len0 = WASM_VECTOR_LEN
  const ptr1 = passStringToWasm0(document_type_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
  const len1 = WASM_VECTOR_LEN
  const ptr2 = passArray8ToWasm0(document_id, wasm.__wbindgen_malloc)
  const len2 = WASM_VECTOR_LEN
  const ret = wasm.createSingleDocumentQueryContested(ptr0, len0, ptr1, len1, document_type_keeps_history, ptr2, len2, !isLikeNone(block_time_ms), isLikeNone(block_time_ms) ? 0 : block_time_ms)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return SingleDocumentDriveQueryWasm.__wrap(ret[0])
}

export function main () {
  wasm.main()
}

/**
 * @param {Uint8Array} proof
 * @param {any} contract_js
 * @param {string} document_type_name
 * @param {any} where_clauses
 * @param {any} order_by
 * @param {number | null | undefined} limit
 * @param {number | null | undefined} offset
 * @param {Uint8Array | null | undefined} start_at
 * @param {boolean} start_at_included
 * @param {bigint | null | undefined} block_time_ms
 * @param {number} platform_version_number
 * @returns {VerifyDocumentProofKeepSerializedResult}
 */
export function verifyDocumentProofKeepSerialized (proof, contract_js, document_type_name, where_clauses, order_by, limit, offset, start_at, start_at_included, block_time_ms, platform_version_number) {
  const ptr0 = passStringToWasm0(document_type_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
  const len0 = WASM_VECTOR_LEN
  const ret = wasm.verifyDocumentProofKeepSerialized(proof, contract_js, ptr0, len0, where_clauses, order_by, isLikeNone(limit) ? 0xFFFFFF : limit, isLikeNone(offset) ? 0xFFFFFF : offset, isLikeNone(start_at) ? 0 : addToExternrefTable0(start_at), start_at_included, !isLikeNone(block_time_ms), isLikeNone(block_time_ms) ? BigInt(0) : block_time_ms, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyDocumentProofKeepSerializedResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} identity_id
 * @param {boolean} verify_subset_of_proof
 * @param {number} platform_version_number
 * @returns {VerifyIdentityBalanceAndRevisionForIdentityIdResult}
 */
export function verifyIdentityBalanceAndRevisionForIdentityId (proof, identity_id, verify_subset_of_proof, platform_version_number) {
  const ret = wasm.verifyIdentityBalanceAndRevisionForIdentityId(proof, identity_id, verify_subset_of_proof, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyIdentityBalanceAndRevisionForIdentityIdResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {boolean} is_proof_subset
 * @param {Uint8Array} public_key_hash
 * @param {Uint8Array | null | undefined} after
 * @param {number} platform_version_number
 * @returns {VerifyIdentityIdByNonUniquePublicKeyHashResult}
 */
export function verifyIdentityIdByNonUniquePublicKeyHash (proof, is_proof_subset, public_key_hash, after, platform_version_number) {
  const ret = wasm.verifyIdentityIdByNonUniquePublicKeyHash(proof, is_proof_subset, public_key_hash, isLikeNone(after) ? 0 : addToExternrefTable0(after), platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyIdentityIdByNonUniquePublicKeyHashResult.__wrap(ret[0])
}

/**
 * Verifies elements at a specific path with given keys
 *
 * **Note**: This function is currently not fully implemented due to limitations in the
 * WASM environment. The Element type from grovedb is not exposed through the verify
 * feature, making it impossible to properly serialize and return element data.
 *
 * For document verification, please use the document-specific verification functions
 * such as `verify_proof_keep_serialized` which are designed to work within these
 * limitations.
 *
 * # Alternative Approaches:
 *
 * 1. For document queries: Use `DriveDocumentQuery.verify_proof_keep_serialized()`
 * 2. For identity queries: Use the identity-specific verification functions
 * 3. For contract queries: Use `verify_contract()`
 *
 * This limitation exists because:
 * - The Element enum from grovedb contains references to internal tree structures
 * - These structures cannot be safely exposed across the WASM boundary
 * - The verify feature intentionally excludes server-side types for security
 * @param {Uint8Array} _proof
 * @param {Array<any>} _path
 * @param {Array<any>} _keys
 * @param {number} _platform_version_number
 * @returns {VerifyElementsResult}
 */
export function verifyElements (_proof, _path, _keys, _platform_version_number) {
  const ret = wasm.verifyElements(_proof, _path, _keys, _platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyElementsResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {number} current_epoch
 * @param {number | null | undefined} start_epoch
 * @param {number} count
 * @param {boolean} ascending
 * @param {number} platform_version_number
 * @returns {VerifyEpochInfosResult}
 */
export function verifyEpochInfos (proof, current_epoch, start_epoch, count, ascending, platform_version_number) {
  const ret = wasm.verifyEpochInfos(proof, current_epoch, isLikeNone(start_epoch) ? 0xFFFFFF : start_epoch, count, ascending, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyEpochInfosResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} token_id
 * @param {boolean} verify_subset_of_proof
 * @param {number} platform_version_number
 * @returns {VerifyTokenTotalSupplyAndAggregatedIdentityBalanceResult}
 */
export function verifyTokenTotalSupplyAndAggregatedIdentityBalance (proof, token_id, verify_subset_of_proof, platform_version_number) {
  const ret = wasm.verifyTokenTotalSupplyAndAggregatedIdentityBalance(proof, token_id, verify_subset_of_proof, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyTokenTotalSupplyAndAggregatedIdentityBalanceResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} query_cbor
 * @param {any} contract_lookup
 * @param {number} platform_version_number
 * @returns {VerifyIdentityVotesGivenProofResult}
 */
export function verifyIdentityVotesGivenProofVec (proof, query_cbor, contract_lookup, platform_version_number) {
  const ret = wasm.verifyIdentityVotesGivenProofVec(proof, query_cbor, contract_lookup, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyIdentityVotesGivenProofResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} query_cbor
 * @param {any} contract_lookup
 * @param {number} platform_version_number
 * @returns {VerifyIdentityVotesGivenProofResult}
 */
export function verifyIdentityVotesGivenProofMap (proof, query_cbor, contract_lookup, platform_version_number) {
  const ret = wasm.verifyIdentityVotesGivenProofMap(proof, query_cbor, contract_lookup, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyIdentityVotesGivenProofResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} masternode_pro_tx_hash
 * @param {Uint8Array} vote_cbor
 * @param {Uint8Array} data_contract_cbor
 * @param {boolean} verify_subset_of_proof
 * @param {number} platform_version_number
 * @returns {VerifyMasternodeVoteResult}
 */
export function verifyMasternodeVote (proof, masternode_pro_tx_hash, vote_cbor, data_contract_cbor, verify_subset_of_proof, platform_version_number) {
  const ret = wasm.verifyMasternodeVote(proof, masternode_pro_tx_hash, vote_cbor, data_contract_cbor, verify_subset_of_proof, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyMasternodeVoteResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {any} contract_js
 * @param {string} document_type_name
 * @param {any} where_clauses
 * @param {any} order_by
 * @param {number | null | undefined} limit
 * @param {number | null | undefined} offset
 * @param {Uint8Array | null | undefined} start_at
 * @param {boolean} start_at_included
 * @param {bigint | null | undefined} block_time_ms
 * @param {boolean} is_proof_subset
 * @param {Uint8Array} document_id
 * @param {number} platform_version_number
 * @returns {VerifyStartAtDocumentInProofResult}
 */
export function verifyStartAtDocumentInProof (proof, contract_js, document_type_name, where_clauses, order_by, limit, offset, start_at, start_at_included, block_time_ms, is_proof_subset, document_id, platform_version_number) {
  const ptr0 = passStringToWasm0(document_type_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
  const len0 = WASM_VECTOR_LEN
  const ret = wasm.verifyStartAtDocumentInProof(proof, contract_js, ptr0, len0, where_clauses, order_by, isLikeNone(limit) ? 0xFFFFFF : limit, isLikeNone(offset) ? 0xFFFFFF : offset, isLikeNone(start_at) ? 0 : addToExternrefTable0(start_at), start_at_included, !isLikeNone(block_time_ms), isLikeNone(block_time_ms) ? BigInt(0) : block_time_ms, is_proof_subset, document_id, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyStartAtDocumentInProofResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} identity_id
 * @param {boolean} verify_subset_of_proof
 * @param {number} platform_version_number
 * @returns {VerifyIdentityRevisionForIdentityIdResult}
 */
export function verifyIdentityRevisionForIdentityId (proof, identity_id, verify_subset_of_proof, platform_version_number) {
  const ret = wasm.verifyIdentityRevisionForIdentityId(proof, identity_id, verify_subset_of_proof, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyIdentityRevisionForIdentityIdResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} token_id
 * @param {boolean} verify_subset_of_proof
 * @param {number} platform_version_number
 * @returns {VerifyTokenDirectSellingPriceResult}
 */
export function verifyTokenDirectSellingPrice (proof, token_id, verify_subset_of_proof, platform_version_number) {
  const ret = wasm.verifyTokenDirectSellingPrice(proof, token_id, verify_subset_of_proof, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyTokenDirectSellingPriceResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} contract_cbor
 * @param {string} document_type_name
 * @param {string} index_name
 * @param {Uint8Array | null | undefined} start_at_value
 * @param {Array<any> | null | undefined} start_index_values
 * @param {Array<any> | null | undefined} end_index_values
 * @param {number | null | undefined} limit
 * @param {boolean} order_ascending
 * @param {number} platform_version_number
 * @returns {VerifyContestsProofResult}
 */
export function verifyContestsProof (proof, contract_cbor, document_type_name, index_name, start_at_value, start_index_values, end_index_values, limit, order_ascending, platform_version_number) {
  const ptr0 = passStringToWasm0(document_type_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
  const len0 = WASM_VECTOR_LEN
  const ptr1 = passStringToWasm0(index_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
  const len1 = WASM_VECTOR_LEN
  const ret = wasm.verifyContestsProof(proof, contract_cbor, ptr0, len0, ptr1, len1, isLikeNone(start_at_value) ? 0 : addToExternrefTable0(start_at_value), isLikeNone(start_index_values) ? 0 : addToExternrefTable0(start_index_values), isLikeNone(end_index_values) ? 0 : addToExternrefTable0(end_index_values), isLikeNone(limit) ? 0xFFFFFF : limit, order_ascending, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyContestsProofResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} contract_id
 * @param {number} group_contract_position
 * @param {boolean} is_proof_subset
 * @param {number} platform_version_number
 * @returns {VerifyGroupInfoResult}
 */
export function verifyGroupInfo (proof, contract_id, group_contract_position, is_proof_subset, platform_version_number) {
  const ret = wasm.verifyGroupInfo(proof, contract_id, group_contract_position, is_proof_subset, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyGroupInfoResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array | null | undefined} identity_proof
 * @param {Uint8Array} identity_id_public_key_hash_proof
 * @param {Uint8Array} public_key_hash
 * @param {Uint8Array | null | undefined} after
 * @param {number} platform_version_number
 * @returns {VerifyFullIdentityByNonUniquePublicKeyHashResult}
 */
export function verifyFullIdentityByNonUniquePublicKeyHash (identity_proof, identity_id_public_key_hash_proof, public_key_hash, after, platform_version_number) {
  const ret = wasm.verifyFullIdentityByNonUniquePublicKeyHash(isLikeNone(identity_proof) ? 0 : addToExternrefTable0(identity_proof), identity_id_public_key_hash_proof, public_key_hash, isLikeNone(after) ? 0 : addToExternrefTable0(after), platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyFullIdentityByNonUniquePublicKeyHashResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} public_key_hash
 * @param {number} platform_version_number
 * @returns {VerifyFullIdentityByUniquePublicKeyHashResult}
 */
export function verifyFullIdentityByUniquePublicKeyHash (proof, public_key_hash, platform_version_number) {
  const ret = wasm.verifyFullIdentityByUniquePublicKeyHash(proof, public_key_hash, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyFullIdentityByUniquePublicKeyHashResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {number} core_subsidy_halving_interval
 * @param {number} activation_core_height
 * @param {number} current_core_height
 * @param {number} platform_version_number
 * @returns {VerifyTotalCreditsInSystemResult}
 */
export function verifyTotalCreditsInSystem (proof, core_subsidy_halving_interval, activation_core_height, current_core_height, platform_version_number) {
  const ret = wasm.verifyTotalCreditsInSystem(proof, core_subsidy_halving_interval, activation_core_height, current_core_height, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyTotalCreditsInSystemResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} query_cbor
 * @param {number} platform_version_number
 * @returns {VerifyVotePollsEndDateQueryResult}
 */
export function verifyVotePollsEndDateQueryVec (proof, query_cbor, platform_version_number) {
  const ret = wasm.verifyVotePollsEndDateQueryVec(proof, query_cbor, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyVotePollsEndDateQueryResult.__wrap(ret[0])
}

/**
 * @param {Uint8Array} proof
 * @param {Uint8Array} query_cbor
 * @param {number} platform_version_number
 * @returns {VerifyVotePollsEndDateQueryResult}
 */
export function verifyVotePollsEndDateQueryMap (proof, query_cbor, platform_version_number) {
  const ret = wasm.verifyVotePollsEndDateQueryMap(proof, query_cbor, platform_version_number)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return VerifyVotePollsEndDateQueryResult.__wrap(ret[0])
}

function getArrayJsValueFromWasm0 (ptr, len) {
  ptr = ptr >>> 0
  const mem = getDataViewMemory0()
  const result = []
  for (let i = ptr; i < ptr + 4 * len; i += 4) {
    result.push(wasm.__wbindgen_export_4.get(mem.getUint32(i, true)))
  }
  wasm.__externref_drop_slice(ptr, len)
  return result
}
/**
 * @param {any} raw_parameters
 * @returns {any}
 */
export function createAssetLockProofInstance (raw_parameters) {
  const ret = wasm.createAssetLockProofInstance(raw_parameters)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return takeFromExternrefTable0(ret[0])
}

function passArrayJsValueToWasm0 (array, malloc) {
  const ptr = malloc(array.length * 4, 4) >>> 0
  for (let i = 0; i < array.length; i++) {
    const add = addToExternrefTable0(array[i])
    getDataViewMemory0().setUint32(ptr + 4 * i, add, true)
  }
  WASM_VECTOR_LEN = array.length
  return ptr
}

let cachedUint32ArrayMemory0 = null

function getUint32ArrayMemory0 () {
  if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
    cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer)
  }
  return cachedUint32ArrayMemory0
}

function passArray32ToWasm0 (arg, malloc) {
  const ptr = malloc(arg.length * 4, 4) >>> 0
  getUint32ArrayMemory0().set(arg, ptr / 4)
  WASM_VECTOR_LEN = arg.length
  return ptr
}
/**
 * @returns {number}
 */
export function getLatestProtocolVersion () {
  const ret = wasm.getLatestProtocolVersion()
  return ret >>> 0
}

/**
 * @param {Uint8Array} bytes
 * @returns {any}
 */
export function deserializeConsensusError (bytes) {
  const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc)
  const len0 = WASM_VECTOR_LEN
  const ret = wasm.deserializeConsensusError(ptr0, len0)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return takeFromExternrefTable0(ret[0])
}

/**
 * @param {any} contract_id
 * @param {any} owner_id
 * @param {string} document_type
 * @param {Uint8Array} entropy
 * @returns {any}
 */
export function generateDocumentId (contract_id, owner_id, document_type, entropy) {
  const ptr0 = passStringToWasm0(document_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
  const len0 = WASM_VECTOR_LEN
  const ptr1 = passArray8ToWasm0(entropy, wasm.__wbindgen_malloc)
  const len1 = WASM_VECTOR_LEN
  const ret = wasm.generateDocumentId(contract_id, owner_id, ptr0, len0, ptr1, len1)
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1])
  }
  return takeFromExternrefTable0(ret[0])
}

function __wbg_adapter_62 (arg0, arg1, arg2) {
  wasm.closure1861_externref_shim(arg0, arg1, arg2)
}

function __wbg_adapter_2343 (arg0, arg1, arg2, arg3) {
  wasm.closure5920_externref_shim(arg0, arg1, arg2, arg3)
}

/**
 * @enum {0 | 1 | 2 | 3 | 4 | 5 | 6}
 */
export const KeyPurpose = Object.freeze({
  /**
     * at least one authentication key must be registered for all security levels
     */
  AUTHENTICATION: 0,
  0: 'AUTHENTICATION',
  /**
     * this key cannot be used for signing documents
     */
  ENCRYPTION: 1,
  1: 'ENCRYPTION',
  /**
     * this key cannot be used for signing documents
     */
  DECRYPTION: 2,
  2: 'DECRYPTION',
  /**
     * this key cannot be used for signing documents
     */
  TRANSFER: 3,
  3: 'TRANSFER',
  /**
     * this key cannot be used for signing documents
     */
  SYSTEM: 4,
  4: 'SYSTEM',
  /**
     * this key cannot be used for signing documents
     */
  VOTING: 5,
  5: 'VOTING',
  /**
     * this key is only for masternode owners
     */
  OWNER: 6,
  6: 'OWNER'
})
/**
 * @enum {0 | 1 | 2 | 3}
 */
export const KeySecurityLevel = Object.freeze({
  MASTER: 0,
  0: 'MASTER',
  CRITICAL: 1,
  1: 'CRITICAL',
  HIGH: 2,
  2: 'HIGH',
  MEDIUM: 3,
  3: 'MEDIUM'
})
/**
 * @enum {0 | 1 | 2 | 3 | 4}
 */
export const KeyType = Object.freeze({
  ECDSA_SECP256K1: 0,
  0: 'ECDSA_SECP256K1',
  BLS12_381: 1,
  1: 'BLS12_381',
  ECDSA_HASH160: 2,
  2: 'ECDSA_HASH160',
  BIP13_SCRIPT_HASH: 3,
  3: 'BIP13_SCRIPT_HASH',
  EDDSA_25519_HASH160: 4,
  4: 'EDDSA_25519_HASH160'
})
/**
 * @enum {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}
 */
export const StateTransitionTypes = Object.freeze({
  DataContractCreate: 0,
  0: 'DataContractCreate',
  DocumentsBatch: 1,
  1: 'DocumentsBatch',
  IdentityCreate: 2,
  2: 'IdentityCreate',
  IdentityTopUp: 3,
  3: 'IdentityTopUp',
  DataContractUpdate: 4,
  4: 'DataContractUpdate',
  IdentityUpdate: 5,
  5: 'IdentityUpdate',
  IdentityCreditWithdrawal: 6,
  6: 'IdentityCreditWithdrawal',
  IdentityCreditTransfer: 7,
  7: 'IdentityCreditTransfer',
  MasternodeVote: 8,
  8: 'MasternodeVote'
})
/**
 * @enum {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}
 */
export const TokenTransitionType = Object.freeze({
  Burn: 0,
  0: 'Burn',
  Mint: 1,
  1: 'Mint',
  Transfer: 2,
  2: 'Transfer',
  Freeze: 3,
  3: 'Freeze',
  Unfreeze: 4,
  4: 'Unfreeze',
  DestroyFrozenFunds: 5,
  5: 'DestroyFrozenFunds',
  Claim: 6,
  6: 'Claim',
  EmergencyAction: 7,
  7: 'EmergencyAction',
  ConfigUpdate: 8,
  8: 'ConfigUpdate',
  DirectPurchase: 9,
  9: 'DirectPurchase',
  SetPriceForDirectPurchase: 10,
  10: 'SetPriceForDirectPurchase'
})

const AssetLockOutputNotFoundErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_assetlockoutputnotfounderror_free(ptr >>> 0, 1))

export class AssetLockOutputNotFoundError {
  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    AssetLockOutputNotFoundErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_assetlockoutputnotfounderror_free(ptr, 0)
  }
}

const AssetLockProofFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_assetlockproof_free(ptr >>> 0, 1))

export class AssetLockProof {
  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    AssetLockProofFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_assetlockproof_free(ptr, 0)
  }

  /**
     * @param {any} raw_asset_lock_proof
     */
  constructor (raw_asset_lock_proof) {
    const ret = wasm.assetlockproof_new(raw_asset_lock_proof)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    this.__wbg_ptr = ret[0] >>> 0
    AssetLockProofFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {any}
     */
  createIdentifier () {
    const ret = wasm.assetlockproof_createIdentifier(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  toObject () {
    const ret = wasm.assetlockproof_toObject(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const AssetLockTransactionIsNotFoundErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_assetlocktransactionisnotfounderror_free(ptr >>> 0, 1))

export class AssetLockTransactionIsNotFoundError {
  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    AssetLockTransactionIsNotFoundErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_assetlocktransactionisnotfounderror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getTransactionId () {
    const ret = wasm.assetlocktransactionisnotfounderror_getTransactionId(this.__wbg_ptr)
    return ret
  }
}

const BalanceIsNotEnoughErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_balanceisnotenougherror_free(ptr >>> 0, 1))

export class BalanceIsNotEnoughError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(BalanceIsNotEnoughError.prototype)
    obj.__wbg_ptr = ptr
    BalanceIsNotEnoughErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    BalanceIsNotEnoughErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_balanceisnotenougherror_free(ptr, 0)
  }

  /**
     * @param {bigint} balance
     * @param {bigint} fee
     */
  constructor (balance, fee) {
    const ret = wasm.balanceisnotenougherror_new(balance, fee)
    this.__wbg_ptr = ret >>> 0
    BalanceIsNotEnoughErrorFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {bigint}
     */
  getBalance () {
    const ret = wasm.balanceisnotenougherror_getBalance(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @returns {bigint}
     */
  getFee () {
    const ret = wasm.balanceisnotenougherror_getFee(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.balanceisnotenougherror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.balanceisnotenougherror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.balanceisnotenougherror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const BasicBLSErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_basicblserror_free(ptr >>> 0, 1))

export class BasicBLSError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(BasicBLSError.prototype)
    obj.__wbg_ptr = ptr
    BasicBLSErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    BasicBLSErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_basicblserror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.basicblserror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.basicblserror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const BasicECDSAErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_basicecdsaerror_free(ptr >>> 0, 1))

export class BasicECDSAError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(BasicECDSAError.prototype)
    obj.__wbg_ptr = ptr
    BasicECDSAErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    BasicECDSAErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_basicecdsaerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.basicecdsaerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.basicecdsaerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const BatchTransitionFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_batchtransition_free(ptr >>> 0, 1))

export class BatchTransition {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(BatchTransition.prototype)
    obj.__wbg_ptr = ptr
    BatchTransitionFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    BatchTransitionFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_batchtransition_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getType () {
    const ret = wasm.batchtransition_getType(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getOwnerId () {
    const ret = wasm.batchtransition_getOwnerId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getUserFeeIncrease () {
    const ret = wasm.batchtransition_getUserFeeIncrease(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {number} user_fee_increase
     */
  setUserFeeIncrease (user_fee_increase) {
    wasm.batchtransition_setUserFeeIncrease(this.__wbg_ptr, user_fee_increase)
  }

  /**
     * @returns {Array<any>}
     */
  getTransitions () {
    const ret = wasm.batchtransition_getTransitions(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {Array<any>} js_transitions
     */
  setTransitions (js_transitions) {
    const ret = wasm.batchtransition_setTransitions(this.__wbg_ptr, js_transitions)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @param {bigint} nonce
     */
  setIdentityContractNonce (nonce) {
    wasm.batchtransition_setIdentityContractNonce(this.__wbg_ptr, nonce)
  }

  /**
     * @returns {Array<any>}
     */
  getModifiedDataIds () {
    const ret = wasm.batchtransition_getModifiedDataIds(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getSignaturePublicKeyId () {
    const ret = wasm.batchtransition_getSignaturePublicKeyId(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @param {IdentityPublicKey} identity_public_key
     * @param {Uint8Array} private_key
     * @param {any} bls
     */
  sign (identity_public_key, private_key, bls) {
    _assertClass(identity_public_key, IdentityPublicKey)
    const ptr0 = passArray8ToWasm0(private_key, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.batchtransition_sign(this.__wbg_ptr, identity_public_key.__wbg_ptr, ptr0, len0, bls)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @param {IdentityPublicKey} identity_public_key
     * @param {any} bls
     * @returns {boolean}
     */
  verifySignature (identity_public_key, bls) {
    _assertClass(identity_public_key, IdentityPublicKey)
    const ret = wasm.batchtransition_verifySignature(this.__wbg_ptr, identity_public_key.__wbg_ptr, bls)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return ret[0] !== 0
  }

  /**
     * @param {number} key_id
     */
  setSignaturePublicKeyId (key_id) {
    wasm.batchtransition_setSignaturePublicKeyId(this.__wbg_ptr, key_id)
  }

  /**
     * @param {number} purpose
     * @returns {Array<any>}
     */
  getKeySecurityLevelRequirement (purpose) {
    const ret = wasm.batchtransition_getKeySecurityLevelRequirement(this.__wbg_ptr, purpose)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {Uint8Array}
     */
  getSignature () {
    const ret = wasm.batchtransition_getSignature(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @param {Uint8Array} signature
     */
  setSignature (signature) {
    const ptr0 = passArray8ToWasm0(signature, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    wasm.batchtransition_setSignature(this.__wbg_ptr, ptr0, len0)
  }

  /**
     * @returns {boolean}
     */
  isDocumentStateTransition () {
    const ret = wasm.batchtransition_getType(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isDataContractStateTransition () {
    const ret = wasm.batchtransition_isDataContractStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isIdentityStateTransition () {
    const ret = wasm.batchtransition_isDataContractStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isVotingStateTransition () {
    const ret = wasm.batchtransition_isDataContractStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {any}
     */
  toBuffer () {
    const ret = wasm.batchtransition_toBuffer(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const BatchedTransitionFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_batchedtransition_free(ptr >>> 0, 1))

export class BatchedTransition {
  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    BatchedTransitionFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_batchedtransition_free(ptr, 0)
  }
}

const ChainAssetLockProofFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_chainassetlockproof_free(ptr >>> 0, 1))

export class ChainAssetLockProof {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(ChainAssetLockProof.prototype)
    obj.__wbg_ptr = ptr
    ChainAssetLockProofFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    ChainAssetLockProofFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_chainassetlockproof_free(ptr, 0)
  }

  /**
     * @param {any} raw_parameters
     */
  constructor (raw_parameters) {
    const ret = wasm.chainassetlockproof_new(raw_parameters)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    this.__wbg_ptr = ret[0] >>> 0
    ChainAssetLockProofFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {number}
     */
  getType () {
    const ret = wasm.chainassetlockproof_getType(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCoreChainLockedHeight () {
    const ret = wasm.chainassetlockproof_getCoreChainLockedHeight(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @param {number} value
     */
  setCoreChainLockedHeight (value) {
    wasm.chainassetlockproof_setCoreChainLockedHeight(this.__wbg_ptr, value)
  }

  /**
     * @returns {any}
     */
  getOutPoint () {
    const ret = wasm.chainassetlockproof_getOutPoint(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @param {Uint8Array} out_point
     */
  setOutPoint (out_point) {
    const ptr0 = passArray8ToWasm0(out_point, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.chainassetlockproof_setOutPoint(this.__wbg_ptr, ptr0, len0)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @returns {any}
     */
  toJSON () {
    const ret = wasm.chainassetlockproof_toJSON(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  toObject () {
    const ret = wasm.chainassetlockproof_toObject(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  createIdentifier () {
    const ret = wasm.chainassetlockproof_createIdentifier(this.__wbg_ptr)
    return ret
  }
}

const ChoosingTokenMintRecipientNotAllowedErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_choosingtokenmintrecipientnotallowederror_free(ptr >>> 0, 1))

export class ChoosingTokenMintRecipientNotAllowedError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(ChoosingTokenMintRecipientNotAllowedError.prototype)
    obj.__wbg_ptr = ptr
    ChoosingTokenMintRecipientNotAllowedErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    ChoosingTokenMintRecipientNotAllowedErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_choosingtokenmintrecipientnotallowederror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.choosingtokenmintrecipientnotallowederror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.choosingtokenmintrecipientnotallowederror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.choosingtokenmintrecipientnotallowederror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const ContestedDocumentsTemporarilyNotAllowedErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_contesteddocumentstemporarilynotallowederror_free(ptr >>> 0, 1))

export class ContestedDocumentsTemporarilyNotAllowedError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(ContestedDocumentsTemporarilyNotAllowedError.prototype)
    obj.__wbg_ptr = ptr
    ContestedDocumentsTemporarilyNotAllowedErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    ContestedDocumentsTemporarilyNotAllowedErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_contesteddocumentstemporarilynotallowederror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.contesteddocumentstemporarilynotallowederror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.contesteddocumentstemporarilynotallowederror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.contesteddocumentstemporarilynotallowederror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const ContestedUniqueIndexOnMutableDocumentTypeErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_contesteduniqueindexonmutabledocumenttypeerror_free(ptr >>> 0, 1))

export class ContestedUniqueIndexOnMutableDocumentTypeError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(ContestedUniqueIndexOnMutableDocumentTypeError.prototype)
    obj.__wbg_ptr = ptr
    ContestedUniqueIndexOnMutableDocumentTypeErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    ContestedUniqueIndexOnMutableDocumentTypeErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_contesteduniqueindexonmutabledocumenttypeerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.contesteduniqueindexonmutabledocumenttypeerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.contesteduniqueindexonmutabledocumenttypeerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.contesteduniqueindexonmutabledocumenttypeerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const ContestedUniqueIndexWithUniqueIndexErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_contesteduniqueindexwithuniqueindexerror_free(ptr >>> 0, 1))

export class ContestedUniqueIndexWithUniqueIndexError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(ContestedUniqueIndexWithUniqueIndexError.prototype)
    obj.__wbg_ptr = ptr
    ContestedUniqueIndexWithUniqueIndexErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    ContestedUniqueIndexWithUniqueIndexErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_contesteduniqueindexwithuniqueindexerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.contesteduniqueindexwithuniqueindexerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.contesteduniqueindexwithuniqueindexerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.contesteduniqueindexwithuniqueindexerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const ContractHasNoTokensErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_contracthasnotokenserror_free(ptr >>> 0, 1))

export class ContractHasNoTokensError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(ContractHasNoTokensError.prototype)
    obj.__wbg_ptr = ptr
    ContractHasNoTokensErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    ContractHasNoTokensErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_contracthasnotokenserror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.contracthasnotokenserror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.contracthasnotokenserror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.contracthasnotokenserror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const DashPlatformProtocolFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_dashplatformprotocol_free(ptr >>> 0, 1))

export class DashPlatformProtocol {
  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DashPlatformProtocolFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_dashplatformprotocol_free(ptr, 0)
  }

  /**
     * @param {any} entropy_generator
     * @param {number | null} [maybe_protocol_version]
     */
  constructor (entropy_generator, maybe_protocol_version) {
    const ret = wasm.dashplatformprotocol_new(entropy_generator, isLikeNone(maybe_protocol_version) ? 0x100000001 : (maybe_protocol_version) >>> 0)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    this.__wbg_ptr = ret[0] >>> 0
    DashPlatformProtocolFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {DataContractFacade}
     */
  get dataContract () {
    const ret = wasm.dashplatformprotocol_data_contract(this.__wbg_ptr)
    return DataContractFacade.__wrap(ret)
  }

  /**
     * @returns {DocumentFacade}
     */
  get document () {
    const ret = wasm.dashplatformprotocol_document(this.__wbg_ptr)
    return DocumentFacade.__wrap(ret)
  }

  /**
     * @returns {IdentityFacade}
     */
  get identity () {
    const ret = wasm.dashplatformprotocol_identity(this.__wbg_ptr)
    return IdentityFacade.__wrap(ret)
  }

  /**
     * @returns {StateTransitionFactory}
     */
  get stateTransition () {
    const ret = wasm.dashplatformprotocol_state_transition(this.__wbg_ptr)
    return StateTransitionFactory.__wrap(ret)
  }

  /**
     * @returns {number}
     */
  get protocolVersion () {
    const ret = wasm.dashplatformprotocol_protocol_version(this.__wbg_ptr)
    return ret >>> 0
  }
}

const DataContractFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datacontract_free(ptr >>> 0, 1))

export class DataContract {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DataContract.prototype)
    obj.__wbg_ptr = ptr
    DataContractFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataContractFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datacontract_free(ptr, 0)
  }

  /**
     * @param {any} raw_parameters
     * @param {object | null} [options]
     */
  constructor (raw_parameters, options) {
    const ret = wasm.datacontract_new(raw_parameters, isLikeNone(options) ? 0 : addToExternrefTable0(options))
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    this.__wbg_ptr = ret[0] >>> 0
    DataContractFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {any}
     */
  getId () {
    const ret = wasm.datacontract_getId(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {any} id
     */
  setId (id) {
    const ret = wasm.datacontract_setId(this.__wbg_ptr, id)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @returns {any}
     */
  getOwnerId () {
    const ret = wasm.datacontract_getOwnerId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getVersion () {
    const ret = wasm.datacontract_getVersion(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @param {number} v
     */
  setVersion (v) {
    wasm.datacontract_setVersion(this.__wbg_ptr, v)
  }

  incrementVersion () {
    wasm.datacontract_incrementVersion(this.__wbg_ptr)
  }

  /**
     * @param {string} doc_type
     * @returns {any}
     */
  getBinaryProperties (doc_type) {
    const ptr0 = passStringToWasm0(doc_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.datacontract_getBinaryProperties(this.__wbg_ptr, ptr0, len0)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @param {any} schemas
     * @param {object | null} [options]
     */
  setDocumentSchemas (schemas, options) {
    const ret = wasm.datacontract_setDocumentSchemas(this.__wbg_ptr, schemas, isLikeNone(options) ? 0 : addToExternrefTable0(options))
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @param {string} name
     * @param {any} schema
     * @param {object | null} [options]
     */
  setDocumentSchema (name, schema, options) {
    const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.datacontract_setDocumentSchema(this.__wbg_ptr, ptr0, len0, schema, isLikeNone(options) ? 0 : addToExternrefTable0(options))
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @param {string} name
     * @returns {any}
     */
  getDocumentSchema (name) {
    const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.datacontract_getDocumentSchema(this.__wbg_ptr, ptr0, len0)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  getDocumentSchemas () {
    const ret = wasm.datacontract_getDocumentSchemas(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getSchemaDefs () {
    const ret = wasm.datacontract_getSchemaDefs(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {object | null} [defs]
     * @param {object | null} [options]
     */
  setSchemaDefs (defs, options) {
    const ret = wasm.datacontract_setSchemaDefs(this.__wbg_ptr, isLikeNone(defs) ? 0 : addToExternrefTable0(defs), isLikeNone(options) ? 0 : addToExternrefTable0(options))
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @param {string} doc_type
     * @returns {boolean}
     */
  hasDocumentType (doc_type) {
    const ptr0 = passStringToWasm0(doc_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.datacontract_hasDocumentType(this.__wbg_ptr, ptr0, len0)
    return ret !== 0
  }

  /**
     * @param {bigint} nonce
     */
  setIdentityNonce (nonce) {
    const ret = wasm.datacontract_setIdentityNonce(this.__wbg_ptr, nonce)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @returns {bigint}
     */
  getIdentityNonce () {
    const ret = wasm.datacontract_getIdentityNonce(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @returns {any}
     */
  toObject () {
    const ret = wasm.datacontract_toObject(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  getConfig () {
    const ret = wasm.datacontract_getConfig(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @param {any} config
     */
  setConfig (config) {
    const ret = wasm.datacontract_setConfig(this.__wbg_ptr, config)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @returns {any}
     */
  toJSON () {
    const ret = wasm.datacontract_toJSON(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  toBuffer () {
    const ret = wasm.datacontract_toBuffer(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {Uint8Array}
     */
  hash () {
    const ret = wasm.datacontract_hash(this.__wbg_ptr)
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2])
    }
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {DataContract}
     */
  clone () {
    const ret = wasm.datacontract_clone(this.__wbg_ptr)
    return DataContract.__wrap(ret)
  }

  /**
     * @param {number} token_contract_position
     * @returns {TokenConfiguration}
     */
  getTokenConfiguration (token_contract_position) {
    const ret = wasm.datacontract_getTokenConfiguration(this.__wbg_ptr, token_contract_position)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return TokenConfiguration.__wrap(ret[0])
  }
}

const DataContractAlreadyPresentErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datacontractalreadypresenterror_free(ptr >>> 0, 1))

export class DataContractAlreadyPresentError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DataContractAlreadyPresentError.prototype)
    obj.__wbg_ptr = ptr
    DataContractAlreadyPresentErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataContractAlreadyPresentErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datacontractalreadypresenterror_free(ptr, 0)
  }

  /**
     * @param {any} data_contract_id
     */
  constructor (data_contract_id) {
    const ret = wasm.datacontractalreadypresenterror_new(data_contract_id)
    this.__wbg_ptr = ret >>> 0
    DataContractAlreadyPresentErrorFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {any}
     */
  getDataContractId () {
    const ret = wasm.datacontractalreadypresenterror_getDataContractId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.datacontractalreadypresenterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datacontractalreadypresenterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.datacontractalreadypresenterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const DataContractBoundsNotPresentErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datacontractboundsnotpresenterror_free(ptr >>> 0, 1))

export class DataContractBoundsNotPresentError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DataContractBoundsNotPresentError.prototype)
    obj.__wbg_ptr = ptr
    DataContractBoundsNotPresentErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataContractBoundsNotPresentErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datacontractboundsnotpresenterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.datacontractboundsnotpresenterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datacontractboundsnotpresenterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.datacontractboundsnotpresenterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const DataContractConfigUpdateErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datacontractconfigupdateerror_free(ptr >>> 0, 1))

export class DataContractConfigUpdateError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DataContractConfigUpdateError.prototype)
    obj.__wbg_ptr = ptr
    DataContractConfigUpdateErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataContractConfigUpdateErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datacontractconfigupdateerror_free(ptr, 0)
  }

  /**
     * @param {any} data_contract_id
     * @param {string} message
     */
  constructor (data_contract_id, message) {
    const ptr0 = passStringToWasm0(message, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.datacontractconfigupdateerror_new(data_contract_id, ptr0, len0)
    this.__wbg_ptr = ret >>> 0
    DataContractConfigUpdateErrorFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {any}
     */
  getDataContractId () {
    const ret = wasm.datacontractconfigupdateerror_getDataContractId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.datacontractconfigupdateerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datacontractconfigupdateerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DataContractCreateTransitionFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datacontractcreatetransition_free(ptr >>> 0, 1))

export class DataContractCreateTransition {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DataContractCreateTransition.prototype)
    obj.__wbg_ptr = ptr
    DataContractCreateTransitionFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataContractCreateTransitionFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datacontractcreatetransition_free(ptr, 0)
  }

  /**
     * @param {any} value
     */
  constructor (value) {
    const ret = wasm.datacontractcreatetransition_new(value)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    this.__wbg_ptr = ret[0] >>> 0
    DataContractCreateTransitionFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @param {number | null} [protocol_version]
     * @returns {DataContract}
     */
  getDataContract (protocol_version) {
    const ret = wasm.datacontractcreatetransition_getDataContract(this.__wbg_ptr, isLikeNone(protocol_version) ? 0x100000001 : (protocol_version) >>> 0)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return DataContract.__wrap(ret[0])
  }

  /**
     * @returns {bigint}
     */
  getIdentityNonce () {
    const ret = wasm.datacontractcreatetransition_getIdentityNonce(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @returns {any}
     */
  getOwnerId () {
    const ret = wasm.datacontractcreatetransition_getOwnerId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getType () {
    const ret = wasm.batchtransition_isDataContractStateTransition(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @param {number} user_fee_increase
     */
  setUserFeeIncrease (user_fee_increase) {
    wasm.datacontractcreatetransition_setUserFeeIncrease(this.__wbg_ptr, user_fee_increase)
  }

  /**
     * @returns {number}
     */
  getUserFeeIncrease () {
    const ret = wasm.datacontractcreatetransition_getUserFeeIncrease(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getSignature () {
    const ret = wasm.datacontractcreatetransition_getSignature(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getSignaturePublicKeyId () {
    const ret = wasm.datacontractcreatetransition_getSignaturePublicKeyId(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {any}
     */
  toBuffer () {
    const ret = wasm.datacontractcreatetransition_toBuffer(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @param {Uint8Array} buffer
     * @returns {DataContractCreateTransition}
     */
  static fromBuffer (buffer) {
    const ptr0 = passArray8ToWasm0(buffer, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.datacontractcreatetransition_fromBuffer(ptr0, len0)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return DataContractCreateTransition.__wrap(ret[0])
  }

  /**
     * @returns {any[]}
     */
  getModifiedDataIds () {
    const ret = wasm.datacontractcreatetransition_getModifiedDataIds(this.__wbg_ptr)
    const v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
    return v1
  }

  /**
     * @returns {boolean}
     */
  isDataContractStateTransition () {
    const ret = wasm.batchtransition_getType(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isDocumentStateTransition () {
    const ret = wasm.batchtransition_isDataContractStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isIdentityStateTransition () {
    const ret = wasm.batchtransition_isDataContractStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isVotingStateTransition () {
    const ret = wasm.batchtransition_isDataContractStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @param {boolean | null} [skip_signature]
     * @returns {any}
     */
  toObject (skip_signature) {
    const ret = wasm.datacontractcreatetransition_toObject(this.__wbg_ptr, isLikeNone(skip_signature) ? 0xFFFFFF : skip_signature ? 1 : 0)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @param {IdentityPublicKey} identity_public_key
     * @param {Uint8Array} private_key
     * @param {any} bls
     */
  sign (identity_public_key, private_key, bls) {
    _assertClass(identity_public_key, IdentityPublicKey)
    const ptr0 = passArray8ToWasm0(private_key, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.datacontractcreatetransition_sign(this.__wbg_ptr, identity_public_key.__wbg_ptr, ptr0, len0, bls)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @param {IdentityPublicKey} identity_public_key
     * @param {any} bls
     * @returns {boolean}
     */
  verifySignature (identity_public_key, bls) {
    _assertClass(identity_public_key, IdentityPublicKey)
    const ret = wasm.datacontractcreatetransition_verifySignature(this.__wbg_ptr, identity_public_key.__wbg_ptr, bls)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return ret[0] !== 0
  }
}

const DataContractEmptySchemaErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datacontractemptyschemaerror_free(ptr >>> 0, 1))

export class DataContractEmptySchemaError {
  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataContractEmptySchemaErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datacontractemptyschemaerror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getDataContractId () {
    const ret = wasm.datacontractemptyschemaerror_getDataContractId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.datacontractemptyschemaerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datacontractemptyschemaerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DataContractErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datacontracterror_free(ptr >>> 0, 1))

export class DataContractError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DataContractError.prototype)
    obj.__wbg_ptr = ptr
    DataContractErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataContractErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datacontracterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.datacontracterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datacontracterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DataContractFacadeFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datacontractfacade_free(ptr >>> 0, 1))

export class DataContractFacade {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DataContractFacade.prototype)
    obj.__wbg_ptr = ptr
    DataContractFacadeFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataContractFacadeFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datacontractfacade_free(ptr, 0)
  }

  /**
     * Create Data Contract
     * @param {Uint8Array} owner_id
     * @param {bigint} identity_nonce
     * @param {any} documents
     * @param {object | null} [definitions]
     * @returns {DataContract}
     */
  create (owner_id, identity_nonce, documents, definitions) {
    const ptr0 = passArray8ToWasm0(owner_id, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.datacontractfacade_create(this.__wbg_ptr, ptr0, len0, identity_nonce, documents, isLikeNone(definitions) ? 0 : addToExternrefTable0(definitions))
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return DataContract.__wrap(ret[0])
  }

  /**
     * Create Data Contract from plain object
     * @param {any} js_raw_data_contract
     * @param {object | null} [options]
     * @returns {Promise<DataContract>}
     */
  createFromObject (js_raw_data_contract, options) {
    const ret = wasm.datacontractfacade_createFromObject(this.__wbg_ptr, js_raw_data_contract, isLikeNone(options) ? 0 : addToExternrefTable0(options))
    return ret
  }

  /**
     * Create Data Contract from buffer
     * @param {Uint8Array} buffer
     * @param {object | null} [options]
     * @returns {Promise<DataContract>}
     */
  createFromBuffer (buffer, options) {
    const ptr0 = passArray8ToWasm0(buffer, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.datacontractfacade_createFromBuffer(this.__wbg_ptr, ptr0, len0, isLikeNone(options) ? 0 : addToExternrefTable0(options))
    return ret
  }

  /**
     * Create Data Contract Create State Transition
     * @param {DataContract} data_contract
     * @returns {DataContractCreateTransition}
     */
  createDataContractCreateTransition (data_contract) {
    _assertClass(data_contract, DataContract)
    const ret = wasm.datacontractfacade_createDataContractCreateTransition(this.__wbg_ptr, data_contract.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return DataContractCreateTransition.__wrap(ret[0])
  }

  /**
     * Create Data Contract Update State Transition
     * @param {DataContract} data_contract
     * @param {bigint} identity_contract_nonce
     * @returns {DataContractUpdateTransition}
     */
  createDataContractUpdateTransition (data_contract, identity_contract_nonce) {
    _assertClass(data_contract, DataContract)
    const ret = wasm.datacontractfacade_createDataContractUpdateTransition(this.__wbg_ptr, data_contract.__wbg_ptr, identity_contract_nonce)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return DataContractUpdateTransition.__wrap(ret[0])
  }
}

const DataContractFactoryFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datacontractfactory_free(ptr >>> 0, 1))

export class DataContractFactory {
  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataContractFactoryFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datacontractfactory_free(ptr, 0)
  }

  /**
     * @param {number} protocol_version
     */
  constructor (protocol_version) {
    const ret = wasm.datacontractfactory_new(protocol_version)
    this.__wbg_ptr = ret >>> 0
    DataContractFactoryFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @param {Uint8Array} owner_id
     * @param {bigint} identity_nonce
     * @param {any} documents
     * @param {any} config
     * @returns {DataContract}
     */
  create (owner_id, identity_nonce, documents, config) {
    const ptr0 = passArray8ToWasm0(owner_id, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.datacontractfactory_create(this.__wbg_ptr, ptr0, len0, identity_nonce, documents, config)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return DataContract.__wrap(ret[0])
  }

  /**
     * @param {Uint8Array} buffer
     * @param {boolean | null} [skip_validation]
     * @returns {Promise<DataContract>}
     */
  createFromBuffer (buffer, skip_validation) {
    const ptr0 = passArray8ToWasm0(buffer, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.datacontractfactory_createFromBuffer(this.__wbg_ptr, ptr0, len0, isLikeNone(skip_validation) ? 0xFFFFFF : skip_validation ? 1 : 0)
    return ret
  }

  /**
     * @param {DataContract} data_contract
     * @returns {Promise<DataContractCreateTransition>}
     */
  createDataContractCreateTransition (data_contract) {
    _assertClass(data_contract, DataContract)
    const ret = wasm.datacontractfactory_createDataContractCreateTransition(this.__wbg_ptr, data_contract.__wbg_ptr)
    return ret
  }
}

const DataContractGenericErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datacontractgenericerror_free(ptr >>> 0, 1))

export class DataContractGenericError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DataContractGenericError.prototype)
    obj.__wbg_ptr = ptr
    DataContractGenericErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataContractGenericErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datacontractgenericerror_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getMessage () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datacontractgenericerror_getMessage(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DataContractHaveNewUniqueIndexErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datacontracthavenewuniqueindexerror_free(ptr >>> 0, 1))

export class DataContractHaveNewUniqueIndexError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DataContractHaveNewUniqueIndexError.prototype)
    obj.__wbg_ptr = ptr
    DataContractHaveNewUniqueIndexErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataContractHaveNewUniqueIndexErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datacontracthavenewuniqueindexerror_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getDocumentType () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datacontracthavenewuniqueindexerror_getDocumentType(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  getIndexName () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datacontracthavenewuniqueindexerror_getIndexName(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.datacontracthavenewuniqueindexerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datacontracthavenewuniqueindexerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DataContractImmutablePropertiesUpdateErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datacontractimmutablepropertiesupdateerror_free(ptr >>> 0, 1))

export class DataContractImmutablePropertiesUpdateError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DataContractImmutablePropertiesUpdateError.prototype)
    obj.__wbg_ptr = ptr
    DataContractImmutablePropertiesUpdateErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataContractImmutablePropertiesUpdateErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datacontractimmutablepropertiesupdateerror_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getOperation () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datacontractimmutablepropertiesupdateerror_getOperation(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  getFieldPath () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datacontractimmutablepropertiesupdateerror_getFieldPath(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.datacontractimmutablepropertiesupdateerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datacontractimmutablepropertiesupdateerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DataContractInvalidIndexDefinitionUpdateErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datacontractinvalidindexdefinitionupdateerror_free(ptr >>> 0, 1))

export class DataContractInvalidIndexDefinitionUpdateError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DataContractInvalidIndexDefinitionUpdateError.prototype)
    obj.__wbg_ptr = ptr
    DataContractInvalidIndexDefinitionUpdateErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataContractInvalidIndexDefinitionUpdateErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datacontractinvalidindexdefinitionupdateerror_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getDocumentType () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datacontractinvalidindexdefinitionupdateerror_getDocumentType(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  getIndexName () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datacontractinvalidindexdefinitionupdateerror_getIndexName(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.datacontractinvalidindexdefinitionupdateerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datacontractinvalidindexdefinitionupdateerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DataContractIsReadonlyErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datacontractisreadonlyerror_free(ptr >>> 0, 1))

export class DataContractIsReadonlyError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DataContractIsReadonlyError.prototype)
    obj.__wbg_ptr = ptr
    DataContractIsReadonlyErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataContractIsReadonlyErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datacontractisreadonlyerror_free(ptr, 0)
  }

  /**
     * @param {any} data_contract_id
     */
  constructor (data_contract_id) {
    const ret = wasm.datacontractisreadonlyerror_new(data_contract_id)
    this.__wbg_ptr = ret >>> 0
    DataContractIsReadonlyErrorFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {any}
     */
  getDataContractId () {
    const ret = wasm.datacontractisreadonlyerror_getDataContractId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.datacontractisreadonlyerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datacontractisreadonlyerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DataContractMaxDepthErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datacontractmaxdeptherror_free(ptr >>> 0, 1))

export class DataContractMaxDepthError {
  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataContractMaxDepthErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datacontractmaxdeptherror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getMaxDepth () {
    const ret = wasm.datacontractmaxdeptherror_getMaxDepth(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.datacontractmaxdeptherror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datacontractmaxdeptherror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DataContractMaxDepthExceedErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datacontractmaxdepthexceederror_free(ptr >>> 0, 1))

export class DataContractMaxDepthExceedError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DataContractMaxDepthExceedError.prototype)
    obj.__wbg_ptr = ptr
    DataContractMaxDepthExceedErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataContractMaxDepthExceedErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datacontractmaxdepthexceederror_free(ptr, 0)
  }
}

const DataContractNotFoundErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datacontractnotfounderror_free(ptr >>> 0, 1))

export class DataContractNotFoundError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DataContractNotFoundError.prototype)
    obj.__wbg_ptr = ptr
    DataContractNotFoundErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataContractNotFoundErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datacontractnotfounderror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.datacontractnotfounderror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datacontractnotfounderror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.datacontractnotfounderror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const DataContractNotPresentErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datacontractnotpresenterror_free(ptr >>> 0, 1))

export class DataContractNotPresentError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DataContractNotPresentError.prototype)
    obj.__wbg_ptr = ptr
    DataContractNotPresentErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataContractNotPresentErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datacontractnotpresenterror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getDataContractId () {
    const ret = wasm.datacontractnotpresenterror_getDataContractId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.datacontractnotpresenterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datacontractnotpresenterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DataContractNotPresentNotConsensusErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datacontractnotpresentnotconsensuserror_free(ptr >>> 0, 1))

export class DataContractNotPresentNotConsensusError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DataContractNotPresentNotConsensusError.prototype)
    obj.__wbg_ptr = ptr
    DataContractNotPresentNotConsensusErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataContractNotPresentNotConsensusErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datacontractnotpresentnotconsensuserror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getDataContractId () {
    const ret = wasm.datacontractnotpresentnotconsensuserror_getDataContractId(this.__wbg_ptr)
    return ret
  }
}

const DataContractTokenConfigurationUpdateErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datacontracttokenconfigurationupdateerror_free(ptr >>> 0, 1))

export class DataContractTokenConfigurationUpdateError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DataContractTokenConfigurationUpdateError.prototype)
    obj.__wbg_ptr = ptr
    DataContractTokenConfigurationUpdateErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataContractTokenConfigurationUpdateErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datacontracttokenconfigurationupdateerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.datacontracttokenconfigurationupdateerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datacontracttokenconfigurationupdateerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.datacontracttokenconfigurationupdateerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const DataContractUniqueIndicesChangedErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datacontractuniqueindiceschangederror_free(ptr >>> 0, 1))

export class DataContractUniqueIndicesChangedError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DataContractUniqueIndicesChangedError.prototype)
    obj.__wbg_ptr = ptr
    DataContractUniqueIndicesChangedErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataContractUniqueIndicesChangedErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datacontractuniqueindiceschangederror_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getDocumentType () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datacontractuniqueindiceschangederror_getDocumentType(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  getIndexName () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datacontractuniqueindiceschangederror_getIndexName(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.datacontractuniqueindiceschangederror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datacontractuniqueindiceschangederror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DataContractUpdateActionNotAllowedErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datacontractupdateactionnotallowederror_free(ptr >>> 0, 1))

export class DataContractUpdateActionNotAllowedError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DataContractUpdateActionNotAllowedError.prototype)
    obj.__wbg_ptr = ptr
    DataContractUpdateActionNotAllowedErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataContractUpdateActionNotAllowedErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datacontractupdateactionnotallowederror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.datacontractupdateactionnotallowederror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datacontractupdateactionnotallowederror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.datacontractupdateactionnotallowederror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const DataContractUpdatePermissionErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datacontractupdatepermissionerror_free(ptr >>> 0, 1))

export class DataContractUpdatePermissionError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DataContractUpdatePermissionError.prototype)
    obj.__wbg_ptr = ptr
    DataContractUpdatePermissionErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataContractUpdatePermissionErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datacontractupdatepermissionerror_free(ptr, 0)
  }

  /**
     * @param {any} data_contract_id
     * @param {any} identity_id
     */
  constructor (data_contract_id, identity_id) {
    const ret = wasm.datacontractupdatepermissionerror_new(data_contract_id, identity_id)
    this.__wbg_ptr = ret >>> 0
    DataContractUpdatePermissionErrorFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {any}
     */
  getDataContractId () {
    const ret = wasm.datacontractupdatepermissionerror_getDataContractId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getIdentityId () {
    const ret = wasm.datacontractupdatepermissionerror_getIdentityId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.datacontractupdatepermissionerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datacontractupdatepermissionerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DataContractUpdateTransitionFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datacontractupdatetransition_free(ptr >>> 0, 1))

export class DataContractUpdateTransition {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DataContractUpdateTransition.prototype)
    obj.__wbg_ptr = ptr
    DataContractUpdateTransitionFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataContractUpdateTransitionFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datacontractupdatetransition_free(ptr, 0)
  }

  /**
     * @param {any} raw_parameters
     */
  constructor (raw_parameters) {
    const ret = wasm.datacontractupdatetransition_new(raw_parameters)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    this.__wbg_ptr = ret[0] >>> 0
    DataContractUpdateTransitionFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @param {number | null} [protocol_version]
     * @returns {DataContract}
     */
  getDataContract (protocol_version) {
    const ret = wasm.datacontractupdatetransition_getDataContract(this.__wbg_ptr, isLikeNone(protocol_version) ? 0x100000001 : (protocol_version) >>> 0)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return DataContract.__wrap(ret[0])
  }

  /**
     * @returns {any}
     */
  getOwnerId () {
    const ret = wasm.datacontractupdatetransition_getOwnerId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {bigint}
     */
  getIdentityContractNonce () {
    const ret = wasm.datacontractupdatetransition_getIdentityContractNonce(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @returns {number}
     */
  getType () {
    const ret = wasm.datacontractupdatetransition_getType(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {number}
     */
  getUserFeeIncrease () {
    const ret = wasm.datacontractupdatetransition_getUserFeeIncrease(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {number} user_fee_increase
     */
  setUserFeeIncrease (user_fee_increase) {
    wasm.datacontractupdatetransition_setUserFeeIncrease(this.__wbg_ptr, user_fee_increase)
  }

  /**
     * @returns {any}
     */
  getSignature () {
    const ret = wasm.datacontractupdatetransition_getSignature(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getSignaturePublicKeyId () {
    const ret = wasm.datacontractupdatetransition_getSignaturePublicKeyId(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {any}
     */
  toBuffer () {
    const ret = wasm.datacontractupdatetransition_toBuffer(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @param {Uint8Array} buffer
     * @returns {DataContractUpdateTransition}
     */
  static fromBuffer (buffer) {
    const ptr0 = passArray8ToWasm0(buffer, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.datacontractupdatetransition_fromBuffer(ptr0, len0)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return DataContractUpdateTransition.__wrap(ret[0])
  }

  /**
     * @returns {any[]}
     */
  getModifiedDataIds () {
    const ret = wasm.datacontractupdatetransition_getModifiedDataIds(this.__wbg_ptr)
    const v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
    return v1
  }

  /**
     * @returns {boolean}
     */
  isDataContractStateTransition () {
    const ret = wasm.datacontractupdatetransition_isDataContractStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isDocumentStateTransition () {
    const ret = wasm.datacontractupdatetransition_isDocumentStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isIdentityStateTransition () {
    const ret = wasm.datacontractupdatetransition_isDocumentStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isVotingStateTransition () {
    const ret = wasm.datacontractupdatetransition_isDocumentStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @param {boolean | null} [skip_signature]
     * @returns {any}
     */
  toObject (skip_signature) {
    const ret = wasm.datacontractupdatetransition_toObject(this.__wbg_ptr, isLikeNone(skip_signature) ? 0xFFFFFF : skip_signature ? 1 : 0)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @param {IdentityPublicKey} identity_public_key
     * @param {Uint8Array} private_key
     * @param {any} bls
     */
  sign (identity_public_key, private_key, bls) {
    _assertClass(identity_public_key, IdentityPublicKey)
    const ptr0 = passArray8ToWasm0(private_key, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.datacontractupdatetransition_sign(this.__wbg_ptr, identity_public_key.__wbg_ptr, ptr0, len0, bls)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @param {IdentityPublicKey} identity_public_key
     * @param {any} bls
     * @returns {boolean}
     */
  verifySignature (identity_public_key, bls) {
    _assertClass(identity_public_key, IdentityPublicKey)
    const ret = wasm.datacontractupdatetransition_verifySignature(this.__wbg_ptr, identity_public_key.__wbg_ptr, bls)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return ret[0] !== 0
  }
}

const DataTriggerActionConditionErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datatriggeractionconditionerror_free(ptr >>> 0, 1))

export class DataTriggerActionConditionError {
  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataTriggerActionConditionErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datatriggeractionconditionerror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getDataContractId () {
    const ret = wasm.datatriggeractionconditionerror_getDataContractId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getDocumentTransitionId () {
    const ret = wasm.datatriggeractionconditionerror_getDocumentTransitionId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {string}
     */
  getMessage () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datatriggeractionconditionerror_getMessage(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any | undefined}
     */
  getOwnerId () {
    const ret = wasm.datatriggeractionconditionerror_getOwnerId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.datatriggeractionconditionerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }
}

const DataTriggerActionExecutionErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datatriggeractionexecutionerror_free(ptr >>> 0, 1))

export class DataTriggerActionExecutionError {
  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataTriggerActionExecutionErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datatriggeractionexecutionerror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getDataContractId () {
    const ret = wasm.datatriggeractionexecutionerror_getDataContractId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getExecutionError () {
    const ret = wasm.datatriggeractionexecutionerror_getExecutionError(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getDocumentTransitionId () {
    const ret = wasm.datatriggeractionexecutionerror_getDocumentTransitionId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {string}
     */
  getMessage () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datatriggeractionexecutionerror_getMessage(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any | undefined}
     */
  getOwnerId () {
    const ret = wasm.datatriggeractionexecutionerror_getOwnerId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.datatriggeractionexecutionerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }
}

const DataTriggerActionInvalidResultErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datatriggeractioninvalidresulterror_free(ptr >>> 0, 1))

export class DataTriggerActionInvalidResultError {
  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataTriggerActionInvalidResultErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datatriggeractioninvalidresulterror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getDataContractId () {
    const ret = wasm.datatriggeractioninvalidresulterror_getDataContractId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getDocumentTransitionId () {
    const ret = wasm.datatriggeractioninvalidresulterror_getDocumentTransitionId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any | undefined}
     */
  getOwnerId () {
    const ret = wasm.datatriggeractioninvalidresulterror_getOwnerId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.datatriggeractioninvalidresulterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }
}

const DataTriggerConditionErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datatriggerconditionerror_free(ptr >>> 0, 1))

export class DataTriggerConditionError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DataTriggerConditionError.prototype)
    obj.__wbg_ptr = ptr
    DataTriggerConditionErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataTriggerConditionErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datatriggerconditionerror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getDataContractId () {
    const ret = wasm.datatriggerconditionerror_getDataContractId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getDocumentId () {
    const ret = wasm.datatriggerconditionerror_getDocumentId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {string}
     */
  getMessage () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datatriggerconditionerror_getMessage(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.datatriggerconditionerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datatriggerconditionerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.datatriggerconditionerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const DataTriggerExecutionErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datatriggerexecutionerror_free(ptr >>> 0, 1))

export class DataTriggerExecutionError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DataTriggerExecutionError.prototype)
    obj.__wbg_ptr = ptr
    DataTriggerExecutionErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataTriggerExecutionErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datatriggerexecutionerror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getDataContractId () {
    const ret = wasm.datatriggerexecutionerror_getDataContractId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getDocumentId () {
    const ret = wasm.datatriggerexecutionerror_getDocumentId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {string}
     */
  getMessage () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datatriggerexecutionerror_getMessage(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.datatriggerexecutionerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datatriggerexecutionerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.datatriggerexecutionerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const DataTriggerInvalidResultErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_datatriggerinvalidresulterror_free(ptr >>> 0, 1))

export class DataTriggerInvalidResultError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DataTriggerInvalidResultError.prototype)
    obj.__wbg_ptr = ptr
    DataTriggerInvalidResultErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DataTriggerInvalidResultErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_datatriggerinvalidresulterror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getDataContractId () {
    const ret = wasm.datatriggerinvalidresulterror_getDataContractId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getDocumentId () {
    const ret = wasm.datatriggerinvalidresulterror_getDocumentId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.datatriggerinvalidresulterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.datatriggerinvalidresulterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.datatriggerinvalidresulterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const DecimalsOverLimitErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_decimalsoverlimiterror_free(ptr >>> 0, 1))

export class DecimalsOverLimitError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DecimalsOverLimitError.prototype)
    obj.__wbg_ptr = ptr
    DecimalsOverLimitErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DecimalsOverLimitErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_decimalsoverlimiterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.decimalsoverlimiterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.decimalsoverlimiterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.decimalsoverlimiterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const DestinationIdentityForTokenMintingNotSetErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_destinationidentityfortokenmintingnotseterror_free(ptr >>> 0, 1))

export class DestinationIdentityForTokenMintingNotSetError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DestinationIdentityForTokenMintingNotSetError.prototype)
    obj.__wbg_ptr = ptr
    DestinationIdentityForTokenMintingNotSetErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DestinationIdentityForTokenMintingNotSetErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_destinationidentityfortokenmintingnotseterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.destinationidentityfortokenmintingnotseterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.destinationidentityfortokenmintingnotseterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.destinationidentityfortokenmintingnotseterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const DisablingKeyIdAlsoBeingAddedInSameTransitionErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_disablingkeyidalsobeingaddedinsametransitionerror_free(ptr >>> 0, 1))

export class DisablingKeyIdAlsoBeingAddedInSameTransitionError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DisablingKeyIdAlsoBeingAddedInSameTransitionError.prototype)
    obj.__wbg_ptr = ptr
    DisablingKeyIdAlsoBeingAddedInSameTransitionErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DisablingKeyIdAlsoBeingAddedInSameTransitionErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_disablingkeyidalsobeingaddedinsametransitionerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.disablingkeyidalsobeingaddedinsametransitionerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.disablingkeyidalsobeingaddedinsametransitionerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.disablingkeyidalsobeingaddedinsametransitionerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const DocumentFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_document_free(ptr >>> 0, 1))

export class Document {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(Document.prototype)
    obj.__wbg_ptr = ptr
    DocumentFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DocumentFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_document_free(ptr, 0)
  }

  /**
     * @param {any} js_raw_document
     * @param {DataContract} js_data_contract
     * @param {any} js_document_type_name
     */
  constructor (js_raw_document, js_data_contract, js_document_type_name) {
    _assertClass(js_data_contract, DataContract)
    const ret = wasm.document_new(js_raw_document, js_data_contract.__wbg_ptr, js_document_type_name)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    this.__wbg_ptr = ret[0] >>> 0
    DocumentFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {any}
     */
  getId () {
    const ret = wasm.document_getId(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {any} js_id
     */
  setId (js_id) {
    wasm.document_setId(this.__wbg_ptr, js_id)
  }

  /**
     * @param {any} owner_id
     */
  setOwnerId (owner_id) {
    wasm.document_setOwnerId(this.__wbg_ptr, owner_id)
  }

  /**
     * @returns {any}
     */
  getOwnerId () {
    const ret = wasm.document_getOwnerId(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {bigint | null} [revision]
     */
  setRevision (revision) {
    wasm.document_setRevision(this.__wbg_ptr, !isLikeNone(revision), isLikeNone(revision) ? BigInt(0) : revision)
  }

  /**
     * @returns {bigint | undefined}
     */
  getRevision () {
    const ret = wasm.document_getRevision(this.__wbg_ptr)
    return ret[0] === 0 ? undefined : BigInt.asUintN(64, ret[1])
  }

  /**
     * @param {any} d
     */
  setData (d) {
    const ret = wasm.document_setData(this.__wbg_ptr, d)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @returns {any}
     */
  getData () {
    const ret = wasm.document_getData(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @param {string} path
     * @param {any} js_value_to_set
     */
  set (path, js_value_to_set) {
    const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.document_set(this.__wbg_ptr, ptr0, len0, js_value_to_set)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @param {string} path
     * @returns {any}
     */
  get (path) {
    const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.document_get(this.__wbg_ptr, ptr0, len0)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @param {Date | null} [created_at]
     */
  setCreatedAt (created_at) {
    wasm.document_setCreatedAt(this.__wbg_ptr, isLikeNone(created_at) ? 0 : addToExternrefTable0(created_at))
  }

  /**
     * @param {Date | null} [updated_at]
     */
  setUpdatedAt (updated_at) {
    wasm.document_setUpdatedAt(this.__wbg_ptr, isLikeNone(updated_at) ? 0 : addToExternrefTable0(updated_at))
  }

  /**
     * @returns {Date | undefined}
     */
  getCreatedAt () {
    const ret = wasm.document_getCreatedAt(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {Date | undefined}
     */
  getUpdatedAt () {
    const ret = wasm.document_getUpdatedAt(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {DataContract} data_contract
     * @param {string} document_type_name
     * @returns {any}
     */
  hash (data_contract, document_type_name) {
    _assertClass(data_contract, DataContract)
    const ptr0 = data_contract.__destroy_into_raw()
    const ptr1 = passStringToWasm0(document_type_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len1 = WASM_VECTOR_LEN
    const ret = wasm.document_hash(this.__wbg_ptr, ptr0, ptr1, len1)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {Document}
     */
  clone () {
    const ret = wasm.document_clone(this.__wbg_ptr)
    return Document.__wrap(ret)
  }
}

const DocumentAlreadyExistsErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_documentalreadyexistserror_free(ptr >>> 0, 1))

export class DocumentAlreadyExistsError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DocumentAlreadyExistsError.prototype)
    obj.__wbg_ptr = ptr
    DocumentAlreadyExistsErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DocumentAlreadyExistsErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_documentalreadyexistserror_free(ptr, 0)
  }
}

const DocumentAlreadyPresentErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_documentalreadypresenterror_free(ptr >>> 0, 1))

export class DocumentAlreadyPresentError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DocumentAlreadyPresentError.prototype)
    obj.__wbg_ptr = ptr
    DocumentAlreadyPresentErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DocumentAlreadyPresentErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_documentalreadypresenterror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getDocumentId () {
    const ret = wasm.documentalreadypresenterror_getDocumentId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.documentalreadypresenterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.documentalreadypresenterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DocumentContestCurrentlyLockedErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_documentcontestcurrentlylockederror_free(ptr >>> 0, 1))

export class DocumentContestCurrentlyLockedError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DocumentContestCurrentlyLockedError.prototype)
    obj.__wbg_ptr = ptr
    DocumentContestCurrentlyLockedErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DocumentContestCurrentlyLockedErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_documentcontestcurrentlylockederror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.documentcontestcurrentlylockederror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.documentcontestcurrentlylockederror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.documentcontestcurrentlylockederror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const DocumentContestDocumentWithSameIdAlreadyPresentErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_documentcontestdocumentwithsameidalreadypresenterror_free(ptr >>> 0, 1))

export class DocumentContestDocumentWithSameIdAlreadyPresentError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DocumentContestDocumentWithSameIdAlreadyPresentError.prototype)
    obj.__wbg_ptr = ptr
    DocumentContestDocumentWithSameIdAlreadyPresentErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DocumentContestDocumentWithSameIdAlreadyPresentErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_documentcontestdocumentwithsameidalreadypresenterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.documentcontestdocumentwithsameidalreadypresenterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.documentcontestdocumentwithsameidalreadypresenterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.documentcontestdocumentwithsameidalreadypresenterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const DocumentContestIdentityAlreadyContestantErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_documentcontestidentityalreadycontestanterror_free(ptr >>> 0, 1))

export class DocumentContestIdentityAlreadyContestantError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DocumentContestIdentityAlreadyContestantError.prototype)
    obj.__wbg_ptr = ptr
    DocumentContestIdentityAlreadyContestantErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DocumentContestIdentityAlreadyContestantErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_documentcontestidentityalreadycontestanterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.documentcontestidentityalreadycontestanterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.documentcontestidentityalreadycontestanterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.documentcontestidentityalreadycontestanterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const DocumentContestNotJoinableErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_documentcontestnotjoinableerror_free(ptr >>> 0, 1))

export class DocumentContestNotJoinableError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DocumentContestNotJoinableError.prototype)
    obj.__wbg_ptr = ptr
    DocumentContestNotJoinableErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DocumentContestNotJoinableErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_documentcontestnotjoinableerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.documentcontestnotjoinableerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.documentcontestnotjoinableerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.documentcontestnotjoinableerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const DocumentContestNotPaidForErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_documentcontestnotpaidforerror_free(ptr >>> 0, 1))

export class DocumentContestNotPaidForError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DocumentContestNotPaidForError.prototype)
    obj.__wbg_ptr = ptr
    DocumentContestNotPaidForErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DocumentContestNotPaidForErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_documentcontestnotpaidforerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.documentcontestnotpaidforerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.documentcontestnotpaidforerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.documentcontestnotpaidforerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const DocumentCreateTransitionFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_documentcreatetransition_free(ptr >>> 0, 1))

export class DocumentCreateTransition {
  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DocumentCreateTransitionFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_documentcreatetransition_free(ptr, 0)
  }

  /**
     * @returns {bigint}
     */
  getRevision () {
    const ret = wasm.documentcreatetransition_getRevision(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @returns {bigint}
     */
  static get INITIAL_REVISION () {
    const ret = wasm.documentcreatetransition_INITIAL_REVISION()
    return BigInt.asUintN(64, ret)
  }

  /**
     * @returns {Uint8Array}
     */
  getEntropy () {
    const ret = wasm.documentcreatetransition_getEntropy(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {bigint}
     */
  getIdentityContractNonce () {
    const ret = wasm.documentcreatetransition_getIdentityContractNonce(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @param {bigint} identity_contract_nonce
     */
  setIdentityContractNonce (identity_contract_nonce) {
    wasm.documentcreatetransition_setIdentityContractNonce(this.__wbg_ptr, identity_contract_nonce)
  }

  /**
     * @returns {any}
     */
  getPrefundedVotingBalance () {
    const ret = wasm.documentcreatetransition_getPrefundedVotingBalance(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const DocumentCreationNotAllowedErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_documentcreationnotallowederror_free(ptr >>> 0, 1))

export class DocumentCreationNotAllowedError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DocumentCreationNotAllowedError.prototype)
    obj.__wbg_ptr = ptr
    DocumentCreationNotAllowedErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DocumentCreationNotAllowedErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_documentcreationnotallowederror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.documentcreationnotallowederror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.documentcreationnotallowederror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.documentcreationnotallowederror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const DocumentFacadeFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_documentfacade_free(ptr >>> 0, 1))

export class DocumentFacade {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DocumentFacade.prototype)
    obj.__wbg_ptr = ptr
    DocumentFacadeFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DocumentFacadeFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_documentfacade_free(ptr, 0)
  }

  /**
     * @param {DocumentFactory} document_factory
     */
  constructor (document_factory) {
    _assertClass(document_factory, DocumentFactory)
    const ptr0 = document_factory.__destroy_into_raw()
    const ret = wasm.documentfacade_new(ptr0)
    this.__wbg_ptr = ret >>> 0
    DocumentFacadeFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @param {DataContract} data_contract
     * @param {any} js_owner_id
     * @param {string} document_type
     * @param {any} data
     * @returns {ExtendedDocument}
     */
  create (data_contract, js_owner_id, document_type, data) {
    _assertClass(data_contract, DataContract)
    const ptr0 = passStringToWasm0(document_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.documentfacade_create(this.__wbg_ptr, data_contract.__wbg_ptr, js_owner_id, ptr0, len0, data)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return ExtendedDocument.__wrap(ret[0])
  }

  /**
     * @param {Uint8Array} buffer
     * @param {string} document_type
     * @param {DataContract} data_contract
     * @returns {ExtendedDocument}
     */
  createExtendedDocumentFromDocumentBuffer (buffer, document_type, data_contract) {
    const ptr0 = passArray8ToWasm0(buffer, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ptr1 = passStringToWasm0(document_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len1 = WASM_VECTOR_LEN
    _assertClass(data_contract, DataContract)
    const ret = wasm.documentfacade_createExtendedDocumentFromDocumentBuffer(this.__wbg_ptr, ptr0, len0, ptr1, len1, data_contract.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return ExtendedDocument.__wrap(ret[0])
  }

  /**
     * Creates Documents State Transition
     * @param {any} documents
     * @param {object} nonce_counter_value
     * @returns {BatchTransition}
     */
  createStateTransition (documents, nonce_counter_value) {
    const ret = wasm.documentfacade_createStateTransition(this.__wbg_ptr, documents, nonce_counter_value)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return BatchTransition.__wrap(ret[0])
  }
}

const DocumentFactoryFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_documentfactory_free(ptr >>> 0, 1))

export class DocumentFactory {
  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DocumentFactoryFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_documentfactory_free(ptr, 0)
  }

  /**
     * @param {number} protocol_version
     * @param {any | null} [external_entropy_generator_arg]
     */
  constructor (protocol_version, external_entropy_generator_arg) {
    const ret = wasm.documentfactory_new(protocol_version, isLikeNone(external_entropy_generator_arg) ? 0 : addToExternrefTable0(external_entropy_generator_arg))
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    this.__wbg_ptr = ret[0] >>> 0
    DocumentFactoryFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @param {DataContract} data_contract
     * @param {any} js_owner_id
     * @param {string} document_type
     * @param {any} data
     * @returns {ExtendedDocument}
     */
  create (data_contract, js_owner_id, document_type, data) {
    _assertClass(data_contract, DataContract)
    const ptr0 = passStringToWasm0(document_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.documentfactory_create(this.__wbg_ptr, data_contract.__wbg_ptr, js_owner_id, ptr0, len0, data)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return ExtendedDocument.__wrap(ret[0])
  }

  /**
     * @param {any} documents
     * @param {object} nonce_counter_value
     * @returns {BatchTransition}
     */
  createStateTransition (documents, nonce_counter_value) {
    const ret = wasm.documentfactory_createStateTransition(this.__wbg_ptr, documents, nonce_counter_value)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return BatchTransition.__wrap(ret[0])
  }

  /**
     * @param {Uint8Array} buffer
     * @param {string} document_type
     * @param {DataContract} data_contract
     * @returns {ExtendedDocument}
     */
  createExtendedDocumentFromDocumentBuffer (buffer, document_type, data_contract) {
    const ptr0 = passArray8ToWasm0(buffer, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ptr1 = passStringToWasm0(document_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len1 = WASM_VECTOR_LEN
    _assertClass(data_contract, DataContract)
    const ret = wasm.documentfactory_createExtendedDocumentFromDocumentBuffer(this.__wbg_ptr, ptr0, len0, ptr1, len1, data_contract.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return ExtendedDocument.__wrap(ret[0])
  }
}

const DocumentFieldMaxSizeExceededErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_documentfieldmaxsizeexceedederror_free(ptr >>> 0, 1))

export class DocumentFieldMaxSizeExceededError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DocumentFieldMaxSizeExceededError.prototype)
    obj.__wbg_ptr = ptr
    DocumentFieldMaxSizeExceededErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DocumentFieldMaxSizeExceededErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_documentfieldmaxsizeexceedederror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.documentfieldmaxsizeexceedederror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.documentfieldmaxsizeexceedederror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.documentfieldmaxsizeexceedederror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const DocumentIncorrectPurchasePriceErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_documentincorrectpurchasepriceerror_free(ptr >>> 0, 1))

export class DocumentIncorrectPurchasePriceError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DocumentIncorrectPurchasePriceError.prototype)
    obj.__wbg_ptr = ptr
    DocumentIncorrectPurchasePriceErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DocumentIncorrectPurchasePriceErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_documentincorrectpurchasepriceerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.documentincorrectpurchasepriceerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.documentincorrectpurchasepriceerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.documentincorrectpurchasepriceerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const DocumentNoRevisionErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_documentnorevisionerror_free(ptr >>> 0, 1))

export class DocumentNoRevisionError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DocumentNoRevisionError.prototype)
    obj.__wbg_ptr = ptr
    DocumentNoRevisionErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DocumentNoRevisionErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_documentnorevisionerror_free(ptr, 0)
  }

  /**
     * @param {Document} document
     */
  constructor (document) {
    _assertClass(document, Document)
    const ptr0 = document.__destroy_into_raw()
    const ret = wasm.documentnorevisionerror_new(ptr0)
    this.__wbg_ptr = ret >>> 0
    DocumentNoRevisionErrorFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {Document}
     */
  getDocument () {
    const ret = wasm.documentnorevisionerror_getDocument(this.__wbg_ptr)
    return Document.__wrap(ret)
  }
}

const DocumentNotForSaleErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_documentnotforsaleerror_free(ptr >>> 0, 1))

export class DocumentNotForSaleError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DocumentNotForSaleError.prototype)
    obj.__wbg_ptr = ptr
    DocumentNotForSaleErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DocumentNotForSaleErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_documentnotforsaleerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.documentnotforsaleerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.documentnotforsaleerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.documentnotforsaleerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const DocumentNotFoundErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_documentnotfounderror_free(ptr >>> 0, 1))

export class DocumentNotFoundError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DocumentNotFoundError.prototype)
    obj.__wbg_ptr = ptr
    DocumentNotFoundErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DocumentNotFoundErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_documentnotfounderror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getDocumentId () {
    const ret = wasm.documentnotfounderror_getDocumentId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.documentnotfounderror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.documentnotfounderror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DocumentNotProvidedErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_documentnotprovidederror_free(ptr >>> 0, 1))

export class DocumentNotProvidedError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DocumentNotProvidedError.prototype)
    obj.__wbg_ptr = ptr
    DocumentNotProvidedErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DocumentNotProvidedErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_documentnotprovidederror_free(ptr, 0)
  }
}

const DocumentOwnerIdMismatchErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_documentowneridmismatcherror_free(ptr >>> 0, 1))

export class DocumentOwnerIdMismatchError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DocumentOwnerIdMismatchError.prototype)
    obj.__wbg_ptr = ptr
    DocumentOwnerIdMismatchErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DocumentOwnerIdMismatchErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_documentowneridmismatcherror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getDocumentId () {
    const ret = wasm.documentowneridmismatcherror_getDocumentId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getDocumentOwnerId () {
    const ret = wasm.documentowneridmismatcherror_getDocumentOwnerId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getExistingDocumentOwnerId () {
    const ret = wasm.documentowneridmismatcherror_getExistingDocumentOwnerId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.documentowneridmismatcherror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.documentowneridmismatcherror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DocumentTimestampWindowViolationErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_documenttimestampwindowviolationerror_free(ptr >>> 0, 1))

export class DocumentTimestampWindowViolationError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DocumentTimestampWindowViolationError.prototype)
    obj.__wbg_ptr = ptr
    DocumentTimestampWindowViolationErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DocumentTimestampWindowViolationErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_documenttimestampwindowviolationerror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getDocumentId () {
    const ret = wasm.documenttimestampwindowviolationerror_getDocumentId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {string}
     */
  getTimestampName () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.documenttimestampwindowviolationerror_getTimestampName(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {Date}
     */
  getTimestamp () {
    const ret = wasm.documenttimestampwindowviolationerror_getTimestamp(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {Date}
     */
  getTimeWindowStart () {
    const ret = wasm.documenttimestampwindowviolationerror_getTimeWindowStart(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {Date}
     */
  getTimeWindowEnd () {
    const ret = wasm.documenttimestampwindowviolationerror_getTimeWindowEnd(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.documenttimestampwindowviolationerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.documenttimestampwindowviolationerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DocumentTimestampsAreEqualErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_documenttimestampsareequalerror_free(ptr >>> 0, 1))

export class DocumentTimestampsAreEqualError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DocumentTimestampsAreEqualError.prototype)
    obj.__wbg_ptr = ptr
    DocumentTimestampsAreEqualErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DocumentTimestampsAreEqualErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_documenttimestampsareequalerror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getDocumentId () {
    const ret = wasm.documenttimestampsareequalerror_getDocumentId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.documenttimestampsareequalerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.documenttimestampsareequalerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DocumentTimestampsMismatchErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_documenttimestampsmismatcherror_free(ptr >>> 0, 1))

export class DocumentTimestampsMismatchError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DocumentTimestampsMismatchError.prototype)
    obj.__wbg_ptr = ptr
    DocumentTimestampsMismatchErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DocumentTimestampsMismatchErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_documenttimestampsmismatcherror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getDocumentId () {
    const ret = wasm.documenttimestampsmismatcherror_getDocumentId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.documenttimestampsmismatcherror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.documenttimestampsmismatcherror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DocumentTransitionFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_documenttransition_free(ptr >>> 0, 1))

export class DocumentTransition {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DocumentTransition.prototype)
    obj.__wbg_ptr = ptr
    DocumentTransitionFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DocumentTransitionFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_documenttransition_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getId () {
    const ret = wasm.documenttransition_getId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {string}
     */
  getType () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.documenttransition_getType(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  getData () {
    const ret = wasm.documenttransition_getData(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getAction () {
    const ret = wasm.documenttransition_getAction(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getDataContractId () {
    const ret = wasm.documenttransition_getDataContractId(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {any} js_data_contract_id
     */
  setDataContractId (js_data_contract_id) {
    const ret = wasm.documenttransition_setDataContractId(this.__wbg_ptr, js_data_contract_id)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @returns {any}
     */
  getIdentityContractNonce () {
    const ret = wasm.documenttransition_getIdentityContractNonce(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {bigint | undefined}
     */
  getRevision () {
    const ret = wasm.documenttransition_getRevision(this.__wbg_ptr)
    return ret[0] === 0 ? undefined : BigInt.asUintN(64, ret[1])
  }

  /**
     * @returns {Uint8Array | undefined}
     */
  getEntropy () {
    const ret = wasm.documenttransition_getEntropy(this.__wbg_ptr)
    let v1
    if (ret[0] !== 0) {
      v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    }
    return v1
  }

  /**
     * @returns {bigint | undefined}
     */
  get_price () {
    const ret = wasm.documenttransition_get_price(this.__wbg_ptr)
    return ret[0] === 0 ? undefined : BigInt.asUintN(64, ret[1])
  }

  /**
     * @returns {any | undefined}
     */
  getReceiverId () {
    const ret = wasm.documenttransition_getReceiverId(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {bigint} revision
     */
  setRevision (revision) {
    wasm.documenttransition_setRevision(this.__wbg_ptr, revision)
  }

  /**
     * @returns {boolean}
     */
  hasPrefundedBalance () {
    const ret = wasm.documenttransition_hasPrefundedBalance(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {any}
     */
  getPrefundedVotingBalance () {
    const ret = wasm.documenttransition_getPrefundedVotingBalance(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const DocumentTransitionsFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_documenttransitions_free(ptr >>> 0, 1))

export class DocumentTransitions {
  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DocumentTransitionsFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_documenttransitions_free(ptr, 0)
  }

  constructor () {
    const ret = wasm.documenttransitions_new()
    this.__wbg_ptr = ret >>> 0
    DocumentTransitionsFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @param {ExtendedDocument} transition
     */
  addTransitionCreate (transition) {
    _assertClass(transition, ExtendedDocument)
    const ptr0 = transition.__destroy_into_raw()
    wasm.documenttransitions_addTransitionCreate(this.__wbg_ptr, ptr0)
  }

  /**
     * @param {ExtendedDocument} transition
     */
  addTransitionReplace (transition) {
    _assertClass(transition, ExtendedDocument)
    const ptr0 = transition.__destroy_into_raw()
    wasm.documenttransitions_addTransitionReplace(this.__wbg_ptr, ptr0)
  }

  /**
     * @param {ExtendedDocument} transition
     */
  addTransitionDelete (transition) {
    _assertClass(transition, ExtendedDocument)
    const ptr0 = transition.__destroy_into_raw()
    wasm.documenttransitions_addTransitionDelete(this.__wbg_ptr, ptr0)
  }
}

const DocumentTransitionsAreAbsentErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_documenttransitionsareabsenterror_free(ptr >>> 0, 1))

export class DocumentTransitionsAreAbsentError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DocumentTransitionsAreAbsentError.prototype)
    obj.__wbg_ptr = ptr
    DocumentTransitionsAreAbsentErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DocumentTransitionsAreAbsentErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_documenttransitionsareabsenterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.documenttransitionsareabsenterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.documenttransitionsareabsenterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DocumentTypeUpdateErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_documenttypeupdateerror_free(ptr >>> 0, 1))

export class DocumentTypeUpdateError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DocumentTypeUpdateError.prototype)
    obj.__wbg_ptr = ptr
    DocumentTypeUpdateErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DocumentTypeUpdateErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_documenttypeupdateerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.documenttypeupdateerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.documenttypeupdateerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.documenttypeupdateerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const DuplicateDocumentTransitionsWithIdsErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_duplicatedocumenttransitionswithidserror_free(ptr >>> 0, 1))

export class DuplicateDocumentTransitionsWithIdsError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DuplicateDocumentTransitionsWithIdsError.prototype)
    obj.__wbg_ptr = ptr
    DuplicateDocumentTransitionsWithIdsErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DuplicateDocumentTransitionsWithIdsErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_duplicatedocumenttransitionswithidserror_free(ptr, 0)
  }

  /**
     * @returns {Array<any>}
     */
  getDocumentTransitionReferences () {
    const ret = wasm.duplicatedocumenttransitionswithidserror_getDocumentTransitionReferences(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.duplicatedocumenttransitionswithidserror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.duplicatedocumenttransitionswithidserror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DuplicateDocumentTransitionsWithIndicesErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_duplicatedocumenttransitionswithindiceserror_free(ptr >>> 0, 1))

export class DuplicateDocumentTransitionsWithIndicesError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DuplicateDocumentTransitionsWithIndicesError.prototype)
    obj.__wbg_ptr = ptr
    DuplicateDocumentTransitionsWithIndicesErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DuplicateDocumentTransitionsWithIndicesErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_duplicatedocumenttransitionswithindiceserror_free(ptr, 0)
  }

  /**
     * @returns {Array<any>}
     */
  getDocumentTransitionReferences () {
    const ret = wasm.duplicatedocumenttransitionswithindiceserror_getDocumentTransitionReferences(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.duplicatedocumenttransitionswithindiceserror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.duplicatedocumenttransitionswithindiceserror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DuplicateIndexErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_duplicateindexerror_free(ptr >>> 0, 1))

export class DuplicateIndexError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DuplicateIndexError.prototype)
    obj.__wbg_ptr = ptr
    DuplicateIndexErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DuplicateIndexErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_duplicateindexerror_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getDocumentType () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.duplicateindexerror_getDocumentType(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  getIndexName () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.duplicateindexerror_getIndexName(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.duplicateindexerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.duplicateindexerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DuplicateIndexNameErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_duplicateindexnameerror_free(ptr >>> 0, 1))

export class DuplicateIndexNameError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DuplicateIndexNameError.prototype)
    obj.__wbg_ptr = ptr
    DuplicateIndexNameErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DuplicateIndexNameErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_duplicateindexnameerror_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getDocumentType () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.duplicateindexnameerror_getDocumentType(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  getDuplicateIndexName () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.duplicateindexnameerror_getDuplicateIndexName(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.duplicateindexnameerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.duplicateindexnameerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DuplicateKeywordsErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_duplicatekeywordserror_free(ptr >>> 0, 1))

export class DuplicateKeywordsError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DuplicateKeywordsError.prototype)
    obj.__wbg_ptr = ptr
    DuplicateKeywordsErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DuplicateKeywordsErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_duplicatekeywordserror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.duplicatekeywordserror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.duplicatekeywordserror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.duplicatekeywordserror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const DuplicateUniqueIndexErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_duplicateuniqueindexerror_free(ptr >>> 0, 1))

export class DuplicateUniqueIndexError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DuplicateUniqueIndexError.prototype)
    obj.__wbg_ptr = ptr
    DuplicateUniqueIndexErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DuplicateUniqueIndexErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_duplicateuniqueindexerror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getDocumentId () {
    const ret = wasm.duplicateuniqueindexerror_getDocumentId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {Array<any>}
     */
  getDuplicatingProperties () {
    const ret = wasm.duplicateuniqueindexerror_getDuplicatingProperties(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.duplicateuniqueindexerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.duplicateuniqueindexerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DuplicatedIdentityPublicKeyErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_duplicatedidentitypublickeyerror_free(ptr >>> 0, 1))

export class DuplicatedIdentityPublicKeyError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DuplicatedIdentityPublicKeyError.prototype)
    obj.__wbg_ptr = ptr
    DuplicatedIdentityPublicKeyErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DuplicatedIdentityPublicKeyErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_duplicatedidentitypublickeyerror_free(ptr, 0)
  }

  /**
     * @returns {Array<any>}
     */
  getDuplicatedPublicKeysIds () {
    const ret = wasm.duplicatedidentitypublickeyerror_getDuplicatedPublicKeysIds(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.duplicatedidentitypublickeyerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.duplicatedidentitypublickeyerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DuplicatedIdentityPublicKeyIdErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_duplicatedidentitypublickeyiderror_free(ptr >>> 0, 1))

export class DuplicatedIdentityPublicKeyIdError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DuplicatedIdentityPublicKeyIdError.prototype)
    obj.__wbg_ptr = ptr
    DuplicatedIdentityPublicKeyIdErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DuplicatedIdentityPublicKeyIdErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_duplicatedidentitypublickeyiderror_free(ptr, 0)
  }

  /**
     * @returns {Array<any>}
     */
  getDuplicatedIds () {
    const ret = wasm.duplicatedidentitypublickeyiderror_getDuplicatedIds(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.duplicatedidentitypublickeyiderror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.duplicatedidentitypublickeyiderror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DuplicatedIdentityPublicKeyIdStateErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_duplicatedidentitypublickeyidstateerror_free(ptr >>> 0, 1))

export class DuplicatedIdentityPublicKeyIdStateError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DuplicatedIdentityPublicKeyIdStateError.prototype)
    obj.__wbg_ptr = ptr
    DuplicatedIdentityPublicKeyIdStateErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DuplicatedIdentityPublicKeyIdStateErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_duplicatedidentitypublickeyidstateerror_free(ptr, 0)
  }

  /**
     * @returns {Array<any>}
     */
  getDuplicatedIds () {
    const ret = wasm.duplicatedidentitypublickeyidstateerror_getDuplicatedIds(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.duplicatedidentitypublickeyidstateerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.duplicatedidentitypublickeyidstateerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const DuplicatedIdentityPublicKeyStateErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_duplicatedidentitypublickeystateerror_free(ptr >>> 0, 1))

export class DuplicatedIdentityPublicKeyStateError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(DuplicatedIdentityPublicKeyStateError.prototype)
    obj.__wbg_ptr = ptr
    DuplicatedIdentityPublicKeyStateErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    DuplicatedIdentityPublicKeyStateErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_duplicatedidentitypublickeystateerror_free(ptr, 0)
  }

  /**
     * @returns {Array<any>}
     */
  getDuplicatedPublicKeysIds () {
    const ret = wasm.duplicatedidentitypublickeystateerror_getDuplicatedPublicKeysIds(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.duplicatedidentitypublickeystateerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.duplicatedidentitypublickeystateerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const ExtendedDocumentFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_extendeddocument_free(ptr >>> 0, 1))

export class ExtendedDocument {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(ExtendedDocument.prototype)
    obj.__wbg_ptr = ptr
    ExtendedDocumentFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    ExtendedDocumentFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_extendeddocument_free(ptr, 0)
  }

  /**
     * @param {any} js_raw_document
     * @param {DataContract} js_data_contract
     */
  constructor (js_raw_document, js_data_contract) {
    _assertClass(js_data_contract, DataContract)
    const ret = wasm.extendeddocument_new(js_raw_document, js_data_contract.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    this.__wbg_ptr = ret[0] >>> 0
    ExtendedDocumentFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {number}
     */
  getFeatureVersion () {
    const ret = wasm.extendeddocument_getFeatureVersion(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getId () {
    const ret = wasm.extendeddocument_getId(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {any} js_id
     */
  setId (js_id) {
    wasm.extendeddocument_setId(this.__wbg_ptr, js_id)
  }

  /**
     * @returns {string}
     */
  getType () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.extendeddocument_getType(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @param {string} document_type_name
     */
  setType (document_type_name) {
    const ptr0 = passStringToWasm0(document_type_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len0 = WASM_VECTOR_LEN
    wasm.extendeddocument_setType(this.__wbg_ptr, ptr0, len0)
  }

  /**
     * @returns {any}
     */
  getDataContractId () {
    const ret = wasm.extendeddocument_getDataContractId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {DataContract}
     */
  getDataContract () {
    const ret = wasm.extendeddocument_getDataContract(this.__wbg_ptr)
    return DataContract.__wrap(ret)
  }

  /**
     * @param {any} js_data_contract_id
     */
  setDataContractId (js_data_contract_id) {
    const ret = wasm.extendeddocument_setDataContractId(this.__wbg_ptr, js_data_contract_id)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @returns {Document}
     */
  getDocument () {
    const ret = wasm.extendeddocument_getDocument(this.__wbg_ptr)
    return Document.__wrap(ret)
  }

  /**
     * @param {any} owner_id
     */
  setOwnerId (owner_id) {
    wasm.extendeddocument_setOwnerId(this.__wbg_ptr, owner_id)
  }

  /**
     * @returns {any}
     */
  getOwnerId () {
    const ret = wasm.extendeddocument_getOwnerId(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {bigint | null} [rev]
     */
  setRevision (rev) {
    wasm.extendeddocument_setRevision(this.__wbg_ptr, !isLikeNone(rev), isLikeNone(rev) ? BigInt(0) : rev)
  }

  /**
     * @returns {bigint | undefined}
     */
  getRevision () {
    const ret = wasm.extendeddocument_getRevision(this.__wbg_ptr)
    return ret[0] === 0 ? undefined : BigInt.asUintN(64, ret[1])
  }

  /**
     * @param {Uint8Array} e
     */
  setEntropy (e) {
    const ptr0 = passArray8ToWasm0(e, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.extendeddocument_setEntropy(this.__wbg_ptr, ptr0, len0)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @returns {any}
     */
  getEntropy () {
    const ret = wasm.extendeddocument_getEntropy(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {any} d
     */
  setData (d) {
    const ret = wasm.extendeddocument_setData(this.__wbg_ptr, d)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @returns {any}
     */
  getData () {
    const ret = wasm.extendeddocument_getData(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @param {string} path
     * @param {any} js_value_to_set
     */
  set (path, js_value_to_set) {
    const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.extendeddocument_set(this.__wbg_ptr, ptr0, len0, js_value_to_set)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @param {string} path
     * @returns {any}
     */
  get (path) {
    const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.extendeddocument_get(this.__wbg_ptr, ptr0, len0)
    return ret
  }

  /**
     * @param {Date | null} [ts]
     */
  setCreatedAt (ts) {
    wasm.extendeddocument_setCreatedAt(this.__wbg_ptr, isLikeNone(ts) ? 0 : addToExternrefTable0(ts))
  }

  /**
     * @param {Date | null} [ts]
     */
  setUpdatedAt (ts) {
    wasm.extendeddocument_setUpdatedAt(this.__wbg_ptr, isLikeNone(ts) ? 0 : addToExternrefTable0(ts))
  }

  /**
     * @returns {Date | undefined}
     */
  getCreatedAt () {
    const ret = wasm.extendeddocument_getCreatedAt(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {Date | undefined}
     */
  getUpdatedAt () {
    const ret = wasm.extendeddocument_getUpdatedAt(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {Metadata | undefined}
     */
  getMetadata () {
    const ret = wasm.extendeddocument_getMetadata(this.__wbg_ptr)
    return ret === 0 ? undefined : Metadata.__wrap(ret)
  }

  /**
     * @param {any} metadata
     */
  setMetadata (metadata) {
    const ret = wasm.extendeddocument_setMetadata(this.__wbg_ptr, metadata)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @param {any} options
     * @returns {any}
     */
  toObject (options) {
    const ret = wasm.extendeddocument_toObject(this.__wbg_ptr, options)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  toJSON () {
    const ret = wasm.extendeddocument_toJSON(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  toBuffer () {
    const ret = wasm.extendeddocument_toBuffer(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  hash () {
    const ret = wasm.extendeddocument_hash(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {ExtendedDocument}
     */
  clone () {
    const ret = wasm.extendeddocument_clone(this.__wbg_ptr)
    return ExtendedDocument.__wrap(ret)
  }

  /**
     * @param {number} platform_version
     * @returns {ValidationResult}
     */
  validate (platform_version) {
    const ret = wasm.extendeddocument_validate(this.__wbg_ptr, platform_version)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return ValidationResult.__wrap(ret[0])
  }
}

const GroupActionAlreadyCompletedErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_groupactionalreadycompletederror_free(ptr >>> 0, 1))

export class GroupActionAlreadyCompletedError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(GroupActionAlreadyCompletedError.prototype)
    obj.__wbg_ptr = ptr
    GroupActionAlreadyCompletedErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    GroupActionAlreadyCompletedErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_groupactionalreadycompletederror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.groupactionalreadycompletederror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.groupactionalreadycompletederror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.groupactionalreadycompletederror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const GroupActionAlreadySignedByIdentityErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_groupactionalreadysignedbyidentityerror_free(ptr >>> 0, 1))

export class GroupActionAlreadySignedByIdentityError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(GroupActionAlreadySignedByIdentityError.prototype)
    obj.__wbg_ptr = ptr
    GroupActionAlreadySignedByIdentityErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    GroupActionAlreadySignedByIdentityErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_groupactionalreadysignedbyidentityerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.groupactionalreadysignedbyidentityerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.groupactionalreadysignedbyidentityerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.groupactionalreadysignedbyidentityerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const GroupActionDoesNotExistErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_groupactiondoesnotexisterror_free(ptr >>> 0, 1))

export class GroupActionDoesNotExistError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(GroupActionDoesNotExistError.prototype)
    obj.__wbg_ptr = ptr
    GroupActionDoesNotExistErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    GroupActionDoesNotExistErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_groupactiondoesnotexisterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.groupactiondoesnotexisterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.groupactiondoesnotexisterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.groupactiondoesnotexisterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const GroupActionNotAllowedOnTransitionErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_groupactionnotallowedontransitionerror_free(ptr >>> 0, 1))

export class GroupActionNotAllowedOnTransitionError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(GroupActionNotAllowedOnTransitionError.prototype)
    obj.__wbg_ptr = ptr
    GroupActionNotAllowedOnTransitionErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    GroupActionNotAllowedOnTransitionErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_groupactionnotallowedontransitionerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.groupactionnotallowedontransitionerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.groupactionnotallowedontransitionerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.groupactionnotallowedontransitionerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const GroupExceedsMaxMembersErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_groupexceedsmaxmemberserror_free(ptr >>> 0, 1))

export class GroupExceedsMaxMembersError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(GroupExceedsMaxMembersError.prototype)
    obj.__wbg_ptr = ptr
    GroupExceedsMaxMembersErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    GroupExceedsMaxMembersErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_groupexceedsmaxmemberserror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.groupexceedsmaxmemberserror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.groupexceedsmaxmemberserror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.groupexceedsmaxmemberserror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const GroupHasTooFewMembersErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_grouphastoofewmemberserror_free(ptr >>> 0, 1))

export class GroupHasTooFewMembersError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(GroupHasTooFewMembersError.prototype)
    obj.__wbg_ptr = ptr
    GroupHasTooFewMembersErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    GroupHasTooFewMembersErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_grouphastoofewmemberserror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.grouphastoofewmemberserror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.grouphastoofewmemberserror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.grouphastoofewmemberserror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const GroupMemberHasPowerOfZeroErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_groupmemberhaspowerofzeroerror_free(ptr >>> 0, 1))

export class GroupMemberHasPowerOfZeroError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(GroupMemberHasPowerOfZeroError.prototype)
    obj.__wbg_ptr = ptr
    GroupMemberHasPowerOfZeroErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    GroupMemberHasPowerOfZeroErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_groupmemberhaspowerofzeroerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.groupmemberhaspowerofzeroerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.groupmemberhaspowerofzeroerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.groupmemberhaspowerofzeroerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const GroupMemberHasPowerOverLimitErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_groupmemberhaspoweroverlimiterror_free(ptr >>> 0, 1))

export class GroupMemberHasPowerOverLimitError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(GroupMemberHasPowerOverLimitError.prototype)
    obj.__wbg_ptr = ptr
    GroupMemberHasPowerOverLimitErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    GroupMemberHasPowerOverLimitErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_groupmemberhaspoweroverlimiterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.groupmemberhaspoweroverlimiterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.groupmemberhaspoweroverlimiterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.groupmemberhaspoweroverlimiterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const GroupNonUnilateralMemberPowerHasLessThanRequiredPowerErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_groupnonunilateralmemberpowerhaslessthanrequiredpowererror_free(ptr >>> 0, 1))

export class GroupNonUnilateralMemberPowerHasLessThanRequiredPowerError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(GroupNonUnilateralMemberPowerHasLessThanRequiredPowerError.prototype)
    obj.__wbg_ptr = ptr
    GroupNonUnilateralMemberPowerHasLessThanRequiredPowerErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    GroupNonUnilateralMemberPowerHasLessThanRequiredPowerErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_groupnonunilateralmemberpowerhaslessthanrequiredpowererror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.groupnonunilateralmemberpowerhaslessthanrequiredpowererror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.groupnonunilateralmemberpowerhaslessthanrequiredpowererror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.groupnonunilateralmemberpowerhaslessthanrequiredpowererror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const GroupPositionDoesNotExistErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_grouppositiondoesnotexisterror_free(ptr >>> 0, 1))

export class GroupPositionDoesNotExistError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(GroupPositionDoesNotExistError.prototype)
    obj.__wbg_ptr = ptr
    GroupPositionDoesNotExistErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    GroupPositionDoesNotExistErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_grouppositiondoesnotexisterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.grouppositiondoesnotexisterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.grouppositiondoesnotexisterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.grouppositiondoesnotexisterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const GroupRequiredPowerIsInvalidErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_grouprequiredpowerisinvaliderror_free(ptr >>> 0, 1))

export class GroupRequiredPowerIsInvalidError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(GroupRequiredPowerIsInvalidError.prototype)
    obj.__wbg_ptr = ptr
    GroupRequiredPowerIsInvalidErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    GroupRequiredPowerIsInvalidErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_grouprequiredpowerisinvaliderror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.grouprequiredpowerisinvaliderror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.grouprequiredpowerisinvaliderror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.grouprequiredpowerisinvaliderror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const GroupTotalPowerLessThanRequiredErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_grouptotalpowerlessthanrequirederror_free(ptr >>> 0, 1))

export class GroupTotalPowerLessThanRequiredError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(GroupTotalPowerLessThanRequiredError.prototype)
    obj.__wbg_ptr = ptr
    GroupTotalPowerLessThanRequiredErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    GroupTotalPowerLessThanRequiredErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_grouptotalpowerlessthanrequirederror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.grouptotalpowerlessthanrequirederror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.grouptotalpowerlessthanrequirederror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.grouptotalpowerlessthanrequirederror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const IdentityFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identity_free(ptr >>> 0, 1))

export class Identity {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(Identity.prototype)
    obj.__wbg_ptr = ptr
    IdentityFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identity_free(ptr, 0)
  }

  /**
     * @param {number} platform_version
     */
  constructor (platform_version) {
    const ret = wasm.identity_new(platform_version)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    this.__wbg_ptr = ret[0] >>> 0
    IdentityFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {any}
     */
  getId () {
    const ret = wasm.identity_getId(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {any} id
     */
  setId (id) {
    wasm.identity_setId(this.__wbg_ptr, id)
  }

  /**
     * @param {Array<any>} public_keys
     * @returns {number}
     */
  setPublicKeys (public_keys) {
    const ret = wasm.identity_setPublicKeys(this.__wbg_ptr, public_keys)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return ret[0] >>> 0
  }

  /**
     * @returns {any[]}
     */
  getPublicKeys () {
    const ret = wasm.identity_getPublicKeys(this.__wbg_ptr)
    const v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
    return v1
  }

  /**
     * @param {number} key_id
     * @returns {IdentityPublicKey | undefined}
     */
  getPublicKeyById (key_id) {
    const ret = wasm.identity_getPublicKeyById(this.__wbg_ptr, key_id)
    return ret === 0 ? undefined : IdentityPublicKey.__wrap(ret)
  }

  /**
     * @returns {bigint}
     */
  get balance () {
    const ret = wasm.identity_balance(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @returns {bigint}
     */
  getBalance () {
    const ret = wasm.identity_balance(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @param {bigint} balance
     */
  setBalance (balance) {
    wasm.identity_setBalance(this.__wbg_ptr, balance)
  }

  /**
     * @param {bigint} amount
     * @returns {bigint}
     */
  increaseBalance (amount) {
    const ret = wasm.identity_increaseBalance(this.__wbg_ptr, amount)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @param {bigint} amount
     * @returns {bigint}
     */
  reduceBalance (amount) {
    const ret = wasm.identity_reduceBalance(this.__wbg_ptr, amount)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @param {bigint} revision
     */
  setRevision (revision) {
    wasm.identity_setRevision(this.__wbg_ptr, revision)
  }

  /**
     * @returns {bigint}
     */
  getRevision () {
    const ret = wasm.identity_getRevision(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @param {any} metadata
     */
  setMetadata (metadata) {
    const ret = wasm.identity_setMetadata(this.__wbg_ptr, metadata)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @returns {Metadata | undefined}
     */
  getMetadata () {
    const ret = wasm.identity_getMetadata(this.__wbg_ptr)
    return ret === 0 ? undefined : Metadata.__wrap(ret)
  }

  /**
     * @param {any} object
     * @returns {Identity}
     */
  static from (object) {
    const ret = wasm.identity_from(object)
    return Identity.__wrap(ret)
  }

  /**
     * @returns {any}
     */
  toJSON () {
    const ret = wasm.identity_toJSON(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  toObject () {
    const ret = wasm.identity_toObject(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  toBuffer () {
    const ret = wasm.identity_toBuffer(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {Uint8Array}
     */
  hash () {
    const ret = wasm.identity_hash(this.__wbg_ptr)
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2])
    }
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @param {IdentityPublicKey} public_key
     */
  addPublicKey (public_key) {
    _assertClass(public_key, IdentityPublicKey)
    const ptr0 = public_key.__destroy_into_raw()
    wasm.identity_addPublicKey(this.__wbg_ptr, ptr0)
  }

  /**
     * @param {Array<any>} public_keys
     */
  addPublicKeys (public_keys) {
    const ret = wasm.identity_addPublicKeys(this.__wbg_ptr, public_keys)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @returns {number}
     */
  getPublicKeyMaxId () {
    const ret = wasm.identity_getPublicKeyMaxId(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {Uint8Array} buffer
     * @returns {Identity}
     */
  static fromBuffer (buffer) {
    const ptr0 = passArray8ToWasm0(buffer, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.identity_fromBuffer(ptr0, len0)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return Identity.__wrap(ret[0])
  }
}

const IdentityAlreadyExistsErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identityalreadyexistserror_free(ptr >>> 0, 1))

export class IdentityAlreadyExistsError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityAlreadyExistsError.prototype)
    obj.__wbg_ptr = ptr
    IdentityAlreadyExistsErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityAlreadyExistsErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identityalreadyexistserror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getIdentityId () {
    const ret = wasm.identityalreadyexistserror_getIdentityId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.identityalreadyexistserror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.identityalreadyexistserror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const IdentityAssetLockProofLockedTransactionMismatchErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identityassetlockprooflockedtransactionmismatcherror_free(ptr >>> 0, 1))

export class IdentityAssetLockProofLockedTransactionMismatchError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityAssetLockProofLockedTransactionMismatchError.prototype)
    obj.__wbg_ptr = ptr
    IdentityAssetLockProofLockedTransactionMismatchErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityAssetLockProofLockedTransactionMismatchErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identityassetlockprooflockedtransactionmismatcherror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getInstantLockTransactionId () {
    const ret = wasm.identityassetlockprooflockedtransactionmismatcherror_getInstantLockTransactionId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getAssetLockTransactionId () {
    const ret = wasm.identityassetlockprooflockedtransactionmismatcherror_getAssetLockTransactionId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.identityassetlockprooflockedtransactionmismatcherror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.identityassetlockprooflockedtransactionmismatcherror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const IdentityAssetLockTransactionIsNotFoundErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identityassetlocktransactionisnotfounderror_free(ptr >>> 0, 1))

export class IdentityAssetLockTransactionIsNotFoundError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityAssetLockTransactionIsNotFoundError.prototype)
    obj.__wbg_ptr = ptr
    IdentityAssetLockTransactionIsNotFoundErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityAssetLockTransactionIsNotFoundErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identityassetlocktransactionisnotfounderror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getTransactionId () {
    const ret = wasm.identityassetlocktransactionisnotfounderror_getTransactionId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.identityassetlocktransactionisnotfounderror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.identityassetlocktransactionisnotfounderror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const IdentityAssetLockTransactionOutPointAlreadyExistsErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identityassetlocktransactionoutpointalreadyexistserror_free(ptr >>> 0, 1))

export class IdentityAssetLockTransactionOutPointAlreadyExistsError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityAssetLockTransactionOutPointAlreadyExistsError.prototype)
    obj.__wbg_ptr = ptr
    IdentityAssetLockTransactionOutPointAlreadyExistsErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityAssetLockTransactionOutPointAlreadyExistsErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identityassetlocktransactionoutpointalreadyexistserror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getOutputIndex () {
    const ret = wasm.identityassetlocktransactionoutpointalreadyexistserror_getOutputIndex(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {any}
     */
  getTransactionId () {
    const ret = wasm.identityassetlocktransactionoutpointalreadyexistserror_getTransactionId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.identityassetlocktransactionoutpointalreadyexistserror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.identityassetlocktransactionoutpointalreadyexistserror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const IdentityAssetLockTransactionOutPointNotEnoughBalanceErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identityassetlocktransactionoutpointnotenoughbalanceerror_free(ptr >>> 0, 1))

export class IdentityAssetLockTransactionOutPointNotEnoughBalanceError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityAssetLockTransactionOutPointNotEnoughBalanceError.prototype)
    obj.__wbg_ptr = ptr
    IdentityAssetLockTransactionOutPointNotEnoughBalanceErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityAssetLockTransactionOutPointNotEnoughBalanceErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identityassetlocktransactionoutpointnotenoughbalanceerror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getTransactionId () {
    const ret = wasm.identityassetlocktransactionoutpointnotenoughbalanceerror_getTransactionId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getOutputIndex () {
    const ret = wasm.identityassetlocktransactionoutpointnotenoughbalanceerror_getOutputIndex(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {bigint}
     */
  getInitialAssetLockCredits () {
    const ret = wasm.identityassetlocktransactionoutpointnotenoughbalanceerror_getInitialAssetLockCredits(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @returns {bigint}
     */
  getCreditsLeft () {
    const ret = wasm.identityassetlocktransactionoutpointnotenoughbalanceerror_getCreditsLeft(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @returns {bigint}
     */
  getCreditsRequired () {
    const ret = wasm.identityassetlocktransactionoutpointnotenoughbalanceerror_getCreditsRequired(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.identityassetlocktransactionoutpointnotenoughbalanceerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.identityassetlocktransactionoutpointnotenoughbalanceerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const IdentityAssetLockTransactionOutputNotFoundErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identityassetlocktransactionoutputnotfounderror_free(ptr >>> 0, 1))

export class IdentityAssetLockTransactionOutputNotFoundError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityAssetLockTransactionOutputNotFoundError.prototype)
    obj.__wbg_ptr = ptr
    IdentityAssetLockTransactionOutputNotFoundErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityAssetLockTransactionOutputNotFoundErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identityassetlocktransactionoutputnotfounderror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getOutputIndex () {
    const ret = wasm.chainassetlockproof_getCoreChainLockedHeight(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.identityassetlocktransactionoutputnotfounderror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.identityassetlocktransactionoutputnotfounderror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const IdentityAssetLockTransactionReplayErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identityassetlocktransactionreplayerror_free(ptr >>> 0, 1))

export class IdentityAssetLockTransactionReplayError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityAssetLockTransactionReplayError.prototype)
    obj.__wbg_ptr = ptr
    IdentityAssetLockTransactionReplayErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityAssetLockTransactionReplayErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identityassetlocktransactionreplayerror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getTransactionId () {
    const ret = wasm.identityassetlocktransactionreplayerror_getTransactionId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.identityassetlocktransactionreplayerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {any}
     */
  getStateTransitionId () {
    const ret = wasm.identityassetlocktransactionreplayerror_getStateTransitionId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getOutputIndex () {
    const ret = wasm.identityassetlocktransactionreplayerror_getOutputIndex(this.__wbg_ptr)
    return ret >>> 0
  }
}

const IdentityContractNonceOutOfBoundsErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identitycontractnonceoutofboundserror_free(ptr >>> 0, 1))

export class IdentityContractNonceOutOfBoundsError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityContractNonceOutOfBoundsError.prototype)
    obj.__wbg_ptr = ptr
    IdentityContractNonceOutOfBoundsErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityContractNonceOutOfBoundsErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identitycontractnonceoutofboundserror_free(ptr, 0)
  }

  /**
     * @returns {bigint}
     */
  getIdentityContractNonce () {
    const ret = wasm.identitycontractnonceoutofboundserror_getIdentityContractNonce(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.identitycontractnonceoutofboundserror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.identitycontractnonceoutofboundserror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const IdentityCreateTransitionFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identitycreatetransition_free(ptr >>> 0, 1))

export class IdentityCreateTransition {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityCreateTransition.prototype)
    obj.__wbg_ptr = ptr
    IdentityCreateTransitionFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityCreateTransitionFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identitycreatetransition_free(ptr, 0)
  }

  /**
     * @param {number} platform_version
     */
  constructor (platform_version) {
    const ret = wasm.identitycreatetransition_new(platform_version)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    this.__wbg_ptr = ret[0] >>> 0
    IdentityCreateTransitionFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @param {any} asset_lock_proof
     */
  setAssetLockProof (asset_lock_proof) {
    const ret = wasm.identitycreatetransition_setAssetLockProof(this.__wbg_ptr, asset_lock_proof)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @returns {any}
     */
  get assetLockProof () {
    const ret = wasm.identitycreatetransition_assetLockProof(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getAssetLockProof () {
    const ret = wasm.identitycreatetransition_getAssetLockProof(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {any[]} public_keys
     */
  setPublicKeys (public_keys) {
    const ptr0 = passArrayJsValueToWasm0(public_keys, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.identitycreatetransition_setPublicKeys(this.__wbg_ptr, ptr0, len0)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @param {any[]} public_keys
     */
  addPublicKeys (public_keys) {
    const ptr0 = passArrayJsValueToWasm0(public_keys, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.identitycreatetransition_addPublicKeys(this.__wbg_ptr, ptr0, len0)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @returns {any[]}
     */
  getPublicKeys () {
    const ret = wasm.identitycreatetransition_getPublicKeys(this.__wbg_ptr)
    const v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
    return v1
  }

  /**
     * @returns {any[]}
     */
  get publicKeys () {
    const ret = wasm.identitycreatetransition_publicKeys(this.__wbg_ptr)
    const v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
    return v1
  }

  /**
     * @returns {number}
     */
  getType () {
    const ret = wasm.identitycreatetransition_getType(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  get identityId () {
    const ret = wasm.identitycreatetransition_identityId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getIdentityId () {
    const ret = wasm.identitycreatetransition_getIdentityId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getOwnerId () {
    const ret = wasm.identitycreatetransition_getOwnerId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getUserFeeIncrease () {
    const ret = wasm.identitycreatetransition_getUserFeeIncrease(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {number} user_fee_increase
     */
  setUserFeeIncrease (user_fee_increase) {
    wasm.identitycreatetransition_setUserFeeIncrease(this.__wbg_ptr, user_fee_increase)
  }

  /**
     * @param {any} options
     * @returns {any}
     */
  toObject (options) {
    const ret = wasm.identitycreatetransition_toObject(this.__wbg_ptr, options)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  toBuffer () {
    const ret = wasm.identitycreatetransition_toBuffer(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  toJSON () {
    const ret = wasm.identitycreatetransition_toJSON(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any[]}
     */
  getModifiedDataIds () {
    const ret = wasm.identitycreatetransition_getModifiedDataIds(this.__wbg_ptr)
    const v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
    return v1
  }

  /**
     * @returns {boolean}
     */
  isDataContractStateTransition () {
    const ret = wasm.identitycreatetransition_isDataContractStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isDocumentStateTransition () {
    const ret = wasm.identitycreatetransition_isDataContractStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isIdentityStateTransition () {
    const ret = wasm.identitycreatetransition_isIdentityStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isVotingStateTransition () {
    const ret = wasm.identitycreatetransition_isDataContractStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @param {Uint8Array} private_key
     * @param {number} key_type
     * @param {any | null} [bls]
     */
  signByPrivateKey (private_key, key_type, bls) {
    const ptr0 = passArray8ToWasm0(private_key, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.identitycreatetransition_signByPrivateKey(this.__wbg_ptr, ptr0, len0, key_type, isLikeNone(bls) ? 0 : addToExternrefTable0(bls))
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @returns {any}
     */
  getSignature () {
    const ret = wasm.identitycreatetransition_getSignature(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {Uint8Array | null} [signature]
     */
  setSignature (signature) {
    const ptr0 = isLikeNone(signature) ? 0 : passArray8ToWasm0(signature, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    wasm.identitycreatetransition_setSignature(this.__wbg_ptr, ptr0, len0)
  }
}

const IdentityCreditTransferToSelfErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identitycredittransfertoselferror_free(ptr >>> 0, 1))

export class IdentityCreditTransferToSelfError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityCreditTransferToSelfError.prototype)
    obj.__wbg_ptr = ptr
    IdentityCreditTransferToSelfErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityCreditTransferToSelfErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identitycredittransfertoselferror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.identitycredittransfertoselferror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.identitycredittransfertoselferror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const IdentityCreditTransferTransitionFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identitycredittransfertransition_free(ptr >>> 0, 1))

export class IdentityCreditTransferTransition {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityCreditTransferTransition.prototype)
    obj.__wbg_ptr = ptr
    IdentityCreditTransferTransitionFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityCreditTransferTransitionFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identitycredittransfertransition_free(ptr, 0)
  }

  /**
     * @param {number} platform_version
     */
  constructor (platform_version) {
    const ret = wasm.identitycredittransfertransition_new(platform_version)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    this.__wbg_ptr = ret[0] >>> 0
    IdentityCreditTransferTransitionFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {number}
     */
  getType () {
    const ret = wasm.identitycredittransfertransition_getType(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  get identityId () {
    const ret = wasm.identitycredittransfertransition_identityId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  get recipientId () {
    const ret = wasm.identitycredittransfertransition_recipientId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {bigint}
     */
  get amount () {
    const ret = wasm.identitycredittransfertransition_amount(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @returns {any}
     */
  getIdentityId () {
    const ret = wasm.identitycredittransfertransition_getIdentityId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getRecipientId () {
    const ret = wasm.identitycredittransfertransition_getRecipientId(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {any} identity_id
     */
  setIdentityId (identity_id) {
    wasm.identitycredittransfertransition_setIdentityId(this.__wbg_ptr, identity_id)
  }

  /**
     * @param {any} recipient_id
     */
  setRecipientId (recipient_id) {
    wasm.identitycredittransfertransition_setRecipientId(this.__wbg_ptr, recipient_id)
  }

  /**
     * @returns {bigint}
     */
  getAmount () {
    const ret = wasm.identitycredittransfertransition_amount(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @param {bigint} amount
     */
  setAmount (amount) {
    wasm.identitycredittransfertransition_setAmount(this.__wbg_ptr, amount)
  }

  /**
     * @returns {number}
     */
  getUserFeeIncrease () {
    const ret = wasm.identitycredittransfertransition_getUserFeeIncrease(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {number} user_fee_increase
     */
  setUserFeeIncrease (user_fee_increase) {
    wasm.identitycredittransfertransition_setUserFeeIncrease(this.__wbg_ptr, user_fee_increase)
  }

  /**
     * @returns {bigint}
     */
  getNonce () {
    const ret = wasm.identitycredittransfertransition_getNonce(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @param {bigint} nonce
     */
  setNonce (nonce) {
    wasm.identitycredittransfertransition_setNonce(this.__wbg_ptr, nonce)
  }

  /**
     * @param {any} options
     * @returns {any}
     */
  toObject (options) {
    const ret = wasm.identitycredittransfertransition_toObject(this.__wbg_ptr, options)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  toBuffer () {
    const ret = wasm.identitycredittransfertransition_toBuffer(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  toJSON () {
    const ret = wasm.identitycredittransfertransition_toJSON(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any[]}
     */
  getModifiedDataIds () {
    const ret = wasm.identitycredittransfertransition_getModifiedDataIds(this.__wbg_ptr)
    const v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
    return v1
  }

  /**
     * @returns {boolean}
     */
  isDataContractStateTransition () {
    const ret = wasm.datacontractupdatetransition_isDocumentStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isDocumentStateTransition () {
    const ret = wasm.datacontractupdatetransition_isDocumentStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isIdentityStateTransition () {
    const ret = wasm.datacontractupdatetransition_isDataContractStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isVotingStateTransition () {
    const ret = wasm.datacontractupdatetransition_isDocumentStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @param {Uint8Array} private_key
     * @param {number} key_type
     * @param {any | null} [bls]
     */
  signByPrivateKey (private_key, key_type, bls) {
    const ptr0 = passArray8ToWasm0(private_key, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.identitycredittransfertransition_signByPrivateKey(this.__wbg_ptr, ptr0, len0, key_type, isLikeNone(bls) ? 0 : addToExternrefTable0(bls))
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @returns {any}
     */
  getSignature () {
    const ret = wasm.identitycredittransfertransition_getSignature(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {Uint8Array | null} [signature]
     */
  setSignature (signature) {
    const ptr0 = isLikeNone(signature) ? 0 : passArray8ToWasm0(signature, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    wasm.identitycredittransfertransition_setSignature(this.__wbg_ptr, ptr0, len0)
  }

  /**
     * @returns {number}
     */
  getSignaturePublicKeyId () {
    const ret = wasm.identitycredittransfertransition_getSignaturePublicKeyId(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @param {IdentityPublicKey} identity_public_key
     * @param {Uint8Array} private_key
     * @param {any} bls
     */
  sign (identity_public_key, private_key, bls) {
    _assertClass(identity_public_key, IdentityPublicKey)
    const ptr0 = passArray8ToWasm0(private_key, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.identitycredittransfertransition_sign(this.__wbg_ptr, identity_public_key.__wbg_ptr, ptr0, len0, bls)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }
}

const IdentityCreditWithdrawalTransitionFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identitycreditwithdrawaltransition_free(ptr >>> 0, 1))

export class IdentityCreditWithdrawalTransition {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityCreditWithdrawalTransition.prototype)
    obj.__wbg_ptr = ptr
    IdentityCreditWithdrawalTransitionFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityCreditWithdrawalTransitionFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identitycreditwithdrawaltransition_free(ptr, 0)
  }

  /**
     * @param {number} platform_version
     */
  constructor (platform_version) {
    const ret = wasm.identitycreditwithdrawaltransition_new(platform_version)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    this.__wbg_ptr = ret[0] >>> 0
    IdentityCreditWithdrawalTransitionFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {number}
     */
  getType () {
    const ret = wasm.identitycreditwithdrawaltransition_getType(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  get identityId () {
    const ret = wasm.identitycreditwithdrawaltransition_identityId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {bigint}
     */
  get amount () {
    const ret = wasm.identitycreditwithdrawaltransition_amount(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @returns {any}
     */
  getIdentityId () {
    const ret = wasm.identitycreditwithdrawaltransition_getIdentityId(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {any} identity_id
     */
  setIdentityId (identity_id) {
    wasm.identitycreditwithdrawaltransition_setIdentityId(this.__wbg_ptr, identity_id)
  }

  /**
     * @returns {bigint}
     */
  getAmount () {
    const ret = wasm.identitycreditwithdrawaltransition_amount(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @param {bigint} amount
     */
  setAmount (amount) {
    wasm.identitycreditwithdrawaltransition_setAmount(this.__wbg_ptr, amount)
  }

  /**
     * @returns {number}
     */
  getCoreFeePerByte () {
    const ret = wasm.identitycreditwithdrawaltransition_getCoreFeePerByte(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @param {number} core_fee_per_byte
     */
  setCoreFeePerByte (core_fee_per_byte) {
    wasm.identitycreditwithdrawaltransition_setCoreFeePerByte(this.__wbg_ptr, core_fee_per_byte)
  }

  /**
     * @returns {number}
     */
  getPooling () {
    const ret = wasm.identitycreditwithdrawaltransition_getPooling(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {number} pooling
     */
  setPooling (pooling) {
    const ret = wasm.identitycreditwithdrawaltransition_setPooling(this.__wbg_ptr, pooling)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @returns {any | undefined}
     */
  getOutputScript () {
    const ret = wasm.identitycreditwithdrawaltransition_getOutputScript(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {Uint8Array | null} [output_script]
     */
  setOutputScript (output_script) {
    const ptr0 = isLikeNone(output_script) ? 0 : passArray8ToWasm0(output_script, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    wasm.identitycreditwithdrawaltransition_setOutputScript(this.__wbg_ptr, ptr0, len0)
  }

  /**
     * @returns {bigint}
     */
  getNonce () {
    const ret = wasm.identitycreditwithdrawaltransition_getNonce(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @param {bigint} revision
     */
  setNonce (revision) {
    wasm.identitycreditwithdrawaltransition_setNonce(this.__wbg_ptr, revision)
  }

  /**
     * @returns {number}
     */
  getUserFeeIncrease () {
    const ret = wasm.identitycreditwithdrawaltransition_getUserFeeIncrease(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {number} user_fee_increase
     */
  setUserFeeIncrease (user_fee_increase) {
    wasm.identitycreditwithdrawaltransition_setUserFeeIncrease(this.__wbg_ptr, user_fee_increase)
  }

  /**
     * @param {any} options
     * @returns {any}
     */
  toObject (options) {
    const ret = wasm.identitycreditwithdrawaltransition_toObject(this.__wbg_ptr, options)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  toBuffer () {
    const ret = wasm.identitycreditwithdrawaltransition_toBuffer(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  toJSON () {
    const ret = wasm.identitycreditwithdrawaltransition_toJSON(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any[]}
     */
  getModifiedDataIds () {
    const ret = wasm.identitycreditwithdrawaltransition_getModifiedDataIds(this.__wbg_ptr)
    const v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
    return v1
  }

  /**
     * @returns {boolean}
     */
  isDataContractStateTransition () {
    const ret = wasm.datacontractupdatetransition_isDocumentStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isDocumentStateTransition () {
    const ret = wasm.datacontractupdatetransition_isDocumentStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isIdentityStateTransition () {
    const ret = wasm.datacontractupdatetransition_isDataContractStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isVotingStateTransition () {
    const ret = wasm.datacontractupdatetransition_isDocumentStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @param {Uint8Array} private_key
     * @param {number} key_type
     * @param {any | null} [bls]
     */
  signByPrivateKey (private_key, key_type, bls) {
    const ptr0 = passArray8ToWasm0(private_key, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.identitycreditwithdrawaltransition_signByPrivateKey(this.__wbg_ptr, ptr0, len0, key_type, isLikeNone(bls) ? 0 : addToExternrefTable0(bls))
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @returns {any}
     */
  getSignature () {
    const ret = wasm.identitycreditwithdrawaltransition_getSignature(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {Uint8Array | null} [signature]
     */
  setSignature (signature) {
    const ptr0 = isLikeNone(signature) ? 0 : passArray8ToWasm0(signature, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    wasm.identitycreditwithdrawaltransition_setSignature(this.__wbg_ptr, ptr0, len0)
  }

  /**
     * @returns {number}
     */
  getSignaturePublicKeyId () {
    const ret = wasm.datatriggeractioninvalidresulterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @param {IdentityPublicKey} identity_public_key
     * @param {Uint8Array} private_key
     * @param {any} bls
     */
  sign (identity_public_key, private_key, bls) {
    _assertClass(identity_public_key, IdentityPublicKey)
    const ptr0 = passArray8ToWasm0(private_key, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.identitycreditwithdrawaltransition_sign(this.__wbg_ptr, identity_public_key.__wbg_ptr, ptr0, len0, bls)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }
}

const IdentityDoesNotHaveEnoughTokenBalanceErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identitydoesnothaveenoughtokenbalanceerror_free(ptr >>> 0, 1))

export class IdentityDoesNotHaveEnoughTokenBalanceError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityDoesNotHaveEnoughTokenBalanceError.prototype)
    obj.__wbg_ptr = ptr
    IdentityDoesNotHaveEnoughTokenBalanceErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityDoesNotHaveEnoughTokenBalanceErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identitydoesnothaveenoughtokenbalanceerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.identitydoesnothaveenoughtokenbalanceerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.identitydoesnothaveenoughtokenbalanceerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.identitydoesnothaveenoughtokenbalanceerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const IdentityFacadeFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identityfacade_free(ptr >>> 0, 1))

export class IdentityFacade {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityFacade.prototype)
    obj.__wbg_ptr = ptr
    IdentityFacadeFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityFacadeFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identityfacade_free(ptr, 0)
  }

  /**
     * @param {any} id
     * @param {Array<any>} public_keys
     * @returns {Identity}
     */
  create (id, public_keys) {
    const ret = wasm.identityfacade_create(this.__wbg_ptr, id, public_keys)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return Identity.__wrap(ret[0])
  }

  /**
     * @param {Uint8Array} buffer
     * @param {object | null} [options]
     * @returns {Identity}
     */
  createFromBuffer (buffer, options) {
    const ptr0 = passArray8ToWasm0(buffer, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.identityfacade_createFromBuffer(this.__wbg_ptr, ptr0, len0, isLikeNone(options) ? 0 : addToExternrefTable0(options))
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return Identity.__wrap(ret[0])
  }

  /**
     * @param {Uint8Array} instant_lock
     * @param {Uint8Array} asset_lock_transaction
     * @param {number} output_index
     * @returns {InstantAssetLockProof}
     */
  createInstantAssetLockProof (instant_lock, asset_lock_transaction, output_index) {
    const ptr0 = passArray8ToWasm0(instant_lock, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ptr1 = passArray8ToWasm0(asset_lock_transaction, wasm.__wbindgen_malloc)
    const len1 = WASM_VECTOR_LEN
    const ret = wasm.identityfacade_createInstantAssetLockProof(this.__wbg_ptr, ptr0, len0, ptr1, len1, output_index)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return InstantAssetLockProof.__wrap(ret[0])
  }

  /**
     * @param {number} core_chain_locked_height
     * @param {Uint8Array} out_point
     * @returns {ChainAssetLockProof}
     */
  createChainAssetLockProof (core_chain_locked_height, out_point) {
    const ptr0 = passArray8ToWasm0(out_point, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.identityfacade_createChainAssetLockProof(this.__wbg_ptr, core_chain_locked_height, ptr0, len0)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return ChainAssetLockProof.__wrap(ret[0])
  }

  /**
     * @param {Identity} identity
     * @param {any} asset_lock_proof
     * @returns {IdentityCreateTransition}
     */
  createIdentityCreateTransition (identity, asset_lock_proof) {
    _assertClass(identity, Identity)
    const ret = wasm.identityfacade_createIdentityCreateTransition(this.__wbg_ptr, identity.__wbg_ptr, asset_lock_proof)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return IdentityCreateTransition.__wrap(ret[0])
  }

  /**
     * @param {any} identity_id
     * @param {any} asset_lock_proof
     * @returns {IdentityTopUpTransition}
     */
  createIdentityTopUpTransition (identity_id, asset_lock_proof) {
    const ret = wasm.identityfacade_createIdentityTopUpTransition(this.__wbg_ptr, identity_id, asset_lock_proof)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return IdentityTopUpTransition.__wrap(ret[0])
  }

  /**
     * @param {any} identity_id
     * @param {bigint} amount
     * @param {number} core_fee_per_byte
     * @param {number} pooling
     * @param {Uint8Array | null | undefined} output_script
     * @param {bigint} identity_nonce
     * @returns {IdentityCreditWithdrawalTransition}
     */
  createIdentityCreditWithdrawalTransition (identity_id, amount, core_fee_per_byte, pooling, output_script, identity_nonce) {
    const ptr0 = isLikeNone(output_script) ? 0 : passArray8ToWasm0(output_script, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.identityfacade_createIdentityCreditWithdrawalTransition(this.__wbg_ptr, identity_id, amount, core_fee_per_byte, pooling, ptr0, len0, identity_nonce)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return IdentityCreditWithdrawalTransition.__wrap(ret[0])
  }

  /**
     * @param {Identity} identity
     * @param {any} recipient_id
     * @param {bigint} amount
     * @param {bigint} identity_nonce
     * @returns {IdentityCreditTransferTransition}
     */
  createIdentityCreditTransferTransition (identity, recipient_id, amount, identity_nonce) {
    _assertClass(identity, Identity)
    const ret = wasm.identityfacade_createIdentityCreditTransferTransition(this.__wbg_ptr, identity.__wbg_ptr, recipient_id, amount, identity_nonce)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return IdentityCreditTransferTransition.__wrap(ret[0])
  }

  /**
     * @param {Identity} identity
     * @param {bigint} identity_nonce
     * @param {any} public_keys
     * @returns {IdentityUpdateTransition}
     */
  createIdentityUpdateTransition (identity, identity_nonce, public_keys) {
    _assertClass(identity, Identity)
    const ret = wasm.identityfacade_createIdentityUpdateTransition(this.__wbg_ptr, identity.__wbg_ptr, identity_nonce, public_keys)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return IdentityUpdateTransition.__wrap(ret[0])
  }
}

const IdentityFactoryFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identityfactory_free(ptr >>> 0, 1))

export class IdentityFactory {
  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityFactoryFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identityfactory_free(ptr, 0)
  }

  /**
     * @param {number} protocol_version
     */
  constructor (protocol_version) {
    const ret = wasm.identityfactory_new(protocol_version)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    this.__wbg_ptr = ret[0] >>> 0
    IdentityFactoryFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @param {any} id
     * @param {Array<any>} public_keys
     * @returns {Identity}
     */
  create (id, public_keys) {
    const ret = wasm.identityfactory_create(this.__wbg_ptr, id, public_keys)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return Identity.__wrap(ret[0])
  }

  /**
     * @param {Uint8Array} buffer
     * @param {any} options
     * @returns {Identity}
     */
  createFromBuffer (buffer, options) {
    const ptr0 = passArray8ToWasm0(buffer, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.identityfactory_createFromBuffer(this.__wbg_ptr, ptr0, len0, options)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return Identity.__wrap(ret[0])
  }

  /**
     * @param {Uint8Array} instant_lock
     * @param {Uint8Array} asset_lock_transaction
     * @param {number} output_index
     * @returns {InstantAssetLockProof}
     */
  createInstantAssetLockProof (instant_lock, asset_lock_transaction, output_index) {
    const ptr0 = passArray8ToWasm0(instant_lock, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ptr1 = passArray8ToWasm0(asset_lock_transaction, wasm.__wbindgen_malloc)
    const len1 = WASM_VECTOR_LEN
    const ret = wasm.identityfactory_createInstantAssetLockProof(this.__wbg_ptr, ptr0, len0, ptr1, len1, output_index)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return InstantAssetLockProof.__wrap(ret[0])
  }

  /**
     * @param {number} core_chain_locked_height
     * @param {Uint8Array} out_point
     * @returns {ChainAssetLockProof}
     */
  createChainAssetLockProof (core_chain_locked_height, out_point) {
    const ptr0 = passArray8ToWasm0(out_point, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.identityfactory_createChainAssetLockProof(this.__wbg_ptr, core_chain_locked_height, ptr0, len0)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return ChainAssetLockProof.__wrap(ret[0])
  }

  /**
     * @param {Identity} identity
     * @param {any} asset_lock_proof
     * @returns {IdentityCreateTransition}
     */
  createIdentityCreateTransition (identity, asset_lock_proof) {
    _assertClass(identity, Identity)
    const ret = wasm.identityfactory_createIdentityCreateTransition(this.__wbg_ptr, identity.__wbg_ptr, asset_lock_proof)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return IdentityCreateTransition.__wrap(ret[0])
  }

  /**
     * @param {any} identity_id
     * @param {any} asset_lock_proof
     * @returns {IdentityTopUpTransition}
     */
  createIdentityTopUpTransition (identity_id, asset_lock_proof) {
    const ret = wasm.identityfactory_createIdentityTopUpTransition(this.__wbg_ptr, identity_id, asset_lock_proof)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return IdentityTopUpTransition.__wrap(ret[0])
  }

  /**
     * @param {Identity} identity
     * @param {any} recipient_id
     * @param {bigint} amount
     * @param {bigint} identity_nonce
     * @returns {IdentityCreditTransferTransition}
     */
  createIdentityCreditTransferTransition (identity, recipient_id, amount, identity_nonce) {
    _assertClass(identity, Identity)
    const ret = wasm.identityfactory_createIdentityCreditTransferTransition(this.__wbg_ptr, identity.__wbg_ptr, recipient_id, amount, identity_nonce)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return IdentityCreditTransferTransition.__wrap(ret[0])
  }

  /**
     * @param {any} identity_id
     * @param {bigint} amount
     * @param {number} core_fee_per_byte
     * @param {number} pooling
     * @param {Uint8Array | null | undefined} output_script
     * @param {bigint} identity_nonce
     * @returns {IdentityCreditWithdrawalTransition}
     */
  createIdentityCreditWithdrawalTransition (identity_id, amount, core_fee_per_byte, pooling, output_script, identity_nonce) {
    const ptr0 = isLikeNone(output_script) ? 0 : passArray8ToWasm0(output_script, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.identityfactory_createIdentityCreditWithdrawalTransition(this.__wbg_ptr, identity_id, amount, core_fee_per_byte, pooling, ptr0, len0, identity_nonce)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return IdentityCreditWithdrawalTransition.__wrap(ret[0])
  }

  /**
     * @param {Identity} identity
     * @param {bigint} identity_nonce
     * @param {any} public_keys
     * @returns {IdentityUpdateTransition}
     */
  createIdentityUpdateTransition (identity, identity_nonce, public_keys) {
    _assertClass(identity, Identity)
    const ret = wasm.identityfactory_createIdentityUpdateTransition(this.__wbg_ptr, identity.__wbg_ptr, identity_nonce, public_keys)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return IdentityUpdateTransition.__wrap(ret[0])
  }
}

const IdentityHasNotAgreedToPayRequiredTokenAmountErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identityhasnotagreedtopayrequiredtokenamounterror_free(ptr >>> 0, 1))

export class IdentityHasNotAgreedToPayRequiredTokenAmountError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityHasNotAgreedToPayRequiredTokenAmountError.prototype)
    obj.__wbg_ptr = ptr
    IdentityHasNotAgreedToPayRequiredTokenAmountErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityHasNotAgreedToPayRequiredTokenAmountErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identityhasnotagreedtopayrequiredtokenamounterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.identityhasnotagreedtopayrequiredtokenamounterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.identityhasnotagreedtopayrequiredtokenamounterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.identityhasnotagreedtopayrequiredtokenamounterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const IdentityInTokenConfigurationNotFoundErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identityintokenconfigurationnotfounderror_free(ptr >>> 0, 1))

export class IdentityInTokenConfigurationNotFoundError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityInTokenConfigurationNotFoundError.prototype)
    obj.__wbg_ptr = ptr
    IdentityInTokenConfigurationNotFoundErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityInTokenConfigurationNotFoundErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identityintokenconfigurationnotfounderror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.identityintokenconfigurationnotfounderror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.identityintokenconfigurationnotfounderror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.identityintokenconfigurationnotfounderror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const IdentityInsufficientBalanceErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identityinsufficientbalanceerror_free(ptr >>> 0, 1))

export class IdentityInsufficientBalanceError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityInsufficientBalanceError.prototype)
    obj.__wbg_ptr = ptr
    IdentityInsufficientBalanceErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityInsufficientBalanceErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identityinsufficientbalanceerror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getIdentityId () {
    const ret = wasm.identityinsufficientbalanceerror_getIdentityId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {bigint}
     */
  getBalance () {
    const ret = wasm.identityinsufficientbalanceerror_getBalance(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.identityinsufficientbalanceerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.identityinsufficientbalanceerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const IdentityMemberOfGroupNotFoundErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identitymemberofgroupnotfounderror_free(ptr >>> 0, 1))

export class IdentityMemberOfGroupNotFoundError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityMemberOfGroupNotFoundError.prototype)
    obj.__wbg_ptr = ptr
    IdentityMemberOfGroupNotFoundErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityMemberOfGroupNotFoundErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identitymemberofgroupnotfounderror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.identitymemberofgroupnotfounderror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.identitymemberofgroupnotfounderror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.identitymemberofgroupnotfounderror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const IdentityNotFoundErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identitynotfounderror_free(ptr >>> 0, 1))

export class IdentityNotFoundError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityNotFoundError.prototype)
    obj.__wbg_ptr = ptr
    IdentityNotFoundErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityNotFoundErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identitynotfounderror_free(ptr, 0)
  }

  /**
     * @param {any} identity_id
     */
  constructor (identity_id) {
    const ret = wasm.identitynotfounderror_new(identity_id)
    this.__wbg_ptr = ret >>> 0
    IdentityNotFoundErrorFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {any}
     */
  getIdentityId () {
    const ret = wasm.identitynotfounderror_getIdentityId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.identitynotfounderror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.identitynotfounderror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.identitynotfounderror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const IdentityNotMemberOfGroupErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identitynotmemberofgrouperror_free(ptr >>> 0, 1))

export class IdentityNotMemberOfGroupError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityNotMemberOfGroupError.prototype)
    obj.__wbg_ptr = ptr
    IdentityNotMemberOfGroupErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityNotMemberOfGroupErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identitynotmemberofgrouperror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.identitynotmemberofgrouperror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.identitynotmemberofgrouperror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.identitynotmemberofgrouperror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const IdentityPublicKeyFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identitypublickey_free(ptr >>> 0, 1))

export class IdentityPublicKey {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityPublicKey.prototype)
    obj.__wbg_ptr = ptr
    IdentityPublicKeyFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityPublicKeyFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identitypublickey_free(ptr, 0)
  }

  /**
     * @param {number} platform_version
     */
  constructor (platform_version) {
    const ret = wasm.identitypublickey_new(platform_version)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    this.__wbg_ptr = ret[0] >>> 0
    IdentityPublicKeyFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {number}
     */
  getId () {
    const ret = wasm.identitypublickey_getId(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @param {number} id
     */
  setId (id) {
    wasm.identitypublickey_setId(this.__wbg_ptr, id)
  }

  /**
     * @returns {number}
     */
  getType () {
    const ret = wasm.identitypublickey_getType(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {number} key_type
     */
  setType (key_type) {
    const ret = wasm.identitypublickey_setType(this.__wbg_ptr, key_type)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @param {Uint8Array} data
     */
  setData (data) {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.identitypublickey_setData(this.__wbg_ptr, ptr0, len0)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @returns {any}
     */
  getData () {
    const ret = wasm.identitypublickey_getData(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {number} purpose
     */
  setPurpose (purpose) {
    const ret = wasm.identitypublickey_setPurpose(this.__wbg_ptr, purpose)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @returns {number}
     */
  getPurpose () {
    const ret = wasm.identitypublickey_getPurpose(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {number} security_level
     */
  setSecurityLevel (security_level) {
    const ret = wasm.identitypublickey_setSecurityLevel(this.__wbg_ptr, security_level)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @returns {number}
     */
  getSecurityLevel () {
    const ret = wasm.identitypublickey_getSecurityLevel(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {boolean} read_only
     */
  setReadOnly (read_only) {
    wasm.identitypublickey_setReadOnly(this.__wbg_ptr, read_only)
  }

  /**
     * @returns {boolean}
     */
  isReadOnly () {
    const ret = wasm.identitypublickey_isReadOnly(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @param {Date} timestamp
     */
  setDisabledAt (timestamp) {
    wasm.identitypublickey_setDisabledAt(this.__wbg_ptr, timestamp)
  }

  /**
     * @returns {Date | undefined}
     */
  getDisabledAt () {
    const ret = wasm.identitypublickey_getDisabledAt(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {Uint8Array}
     */
  hash () {
    const ret = wasm.identitypublickey_hash(this.__wbg_ptr)
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2])
    }
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {boolean}
     */
  isMaster () {
    const ret = wasm.identitypublickey_isMaster(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {any}
     */
  toJSON () {
    const ret = wasm.identitypublickey_toJSON(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  toObject () {
    const ret = wasm.identitypublickey_toObject(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  toBuffer () {
    const ret = wasm.identitypublickey_toBuffer(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @param {Uint8Array} buffer
     * @returns {IdentityPublicKey}
     */
  static fromBuffer (buffer) {
    const ptr0 = passArray8ToWasm0(buffer, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.identitypublickey_fromBuffer(ptr0, len0)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return IdentityPublicKey.__wrap(ret[0])
  }
}

const IdentityPublicKeyAlreadyExistsForUniqueContractBoundsErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identitypublickeyalreadyexistsforuniquecontractboundserror_free(ptr >>> 0, 1))

export class IdentityPublicKeyAlreadyExistsForUniqueContractBoundsError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityPublicKeyAlreadyExistsForUniqueContractBoundsError.prototype)
    obj.__wbg_ptr = ptr
    IdentityPublicKeyAlreadyExistsForUniqueContractBoundsErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityPublicKeyAlreadyExistsForUniqueContractBoundsErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identitypublickeyalreadyexistsforuniquecontractboundserror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.identitypublickeyalreadyexistsforuniquecontractboundserror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.identitypublickeyalreadyexistsforuniquecontractboundserror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.identitypublickeyalreadyexistsforuniquecontractboundserror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const IdentityPublicKeyIsDisabledErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identitypublickeyisdisablederror_free(ptr >>> 0, 1))

export class IdentityPublicKeyIsDisabledError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityPublicKeyIsDisabledError.prototype)
    obj.__wbg_ptr = ptr
    IdentityPublicKeyIsDisabledErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityPublicKeyIsDisabledErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identitypublickeyisdisablederror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getPublicKeyIndex () {
    const ret = wasm.identitypublickeyisdisablederror_getPublicKeyIndex(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.identitypublickeyisdisablederror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.identitypublickeyisdisablederror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const IdentityPublicKeyIsReadOnlyErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identitypublickeyisreadonlyerror_free(ptr >>> 0, 1))

export class IdentityPublicKeyIsReadOnlyError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityPublicKeyIsReadOnlyError.prototype)
    obj.__wbg_ptr = ptr
    IdentityPublicKeyIsReadOnlyErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityPublicKeyIsReadOnlyErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identitypublickeyisreadonlyerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getKeyId () {
    const ret = wasm.datacontractmaxdeptherror_getMaxDepth(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {number}
     */
  getPublicKeyIndex () {
    const ret = wasm.datacontractmaxdeptherror_getMaxDepth(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.identitypublickeyisreadonlyerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.identitypublickeyisreadonlyerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const IdentityPublicKeyWithWitnessFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identitypublickeywithwitness_free(ptr >>> 0, 1))

export class IdentityPublicKeyWithWitness {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityPublicKeyWithWitness.prototype)
    obj.__wbg_ptr = ptr
    IdentityPublicKeyWithWitnessFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityPublicKeyWithWitnessFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identitypublickeywithwitness_free(ptr, 0)
  }

  /**
     * @param {number} platform_version
     */
  constructor (platform_version) {
    const ret = wasm.identitypublickeywithwitness_new(platform_version)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    this.__wbg_ptr = ret[0] >>> 0
    IdentityPublicKeyWithWitnessFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {number}
     */
  getId () {
    const ret = wasm.identitypublickeywithwitness_getId(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @param {number} id
     */
  setId (id) {
    wasm.identitypublickeywithwitness_setId(this.__wbg_ptr, id)
  }

  /**
     * @returns {number}
     */
  getType () {
    const ret = wasm.identitypublickeywithwitness_getType(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {number} key_type
     */
  setType (key_type) {
    const ret = wasm.identitypublickeywithwitness_setType(this.__wbg_ptr, key_type)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @param {Uint8Array} data
     */
  setData (data) {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.identitypublickeywithwitness_setData(this.__wbg_ptr, ptr0, len0)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @returns {any}
     */
  getData () {
    const ret = wasm.identitypublickeywithwitness_getData(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {number} purpose
     */
  setPurpose (purpose) {
    const ret = wasm.identitypublickeywithwitness_setPurpose(this.__wbg_ptr, purpose)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @returns {number}
     */
  getPurpose () {
    const ret = wasm.identitypublickeywithwitness_getPurpose(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {number} security_level
     */
  setSecurityLevel (security_level) {
    const ret = wasm.identitypublickeywithwitness_setSecurityLevel(this.__wbg_ptr, security_level)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @param {any} contract_id
     * @param {string | null} [document_type_name]
     */
  setContractBounds (contract_id, document_type_name) {
    const ptr0 = isLikeNone(document_type_name) ? 0 : passStringToWasm0(document_type_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len0 = WASM_VECTOR_LEN
    wasm.identitypublickeywithwitness_setContractBounds(this.__wbg_ptr, contract_id, ptr0, len0)
  }

  /**
     * @returns {number}
     */
  getSecurityLevel () {
    const ret = wasm.identitypublickeywithwitness_getSecurityLevel(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {boolean} read_only
     */
  setReadOnly (read_only) {
    wasm.identitypublickeywithwitness_setReadOnly(this.__wbg_ptr, read_only)
  }

  /**
     * @returns {boolean}
     */
  isReadOnly () {
    const ret = wasm.identitypublickeywithwitness_isReadOnly(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @param {Uint8Array} signature
     */
  setSignature (signature) {
    const ptr0 = passArray8ToWasm0(signature, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    wasm.identitypublickeywithwitness_setSignature(this.__wbg_ptr, ptr0, len0)
  }

  /**
     * @returns {Uint8Array}
     */
  getSignature () {
    const ret = wasm.identitypublickeywithwitness_getSignature(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {Uint8Array}
     */
  hash () {
    const ret = wasm.identitypublickeywithwitness_hash(this.__wbg_ptr)
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2])
    }
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  toJSON () {
    const ret = wasm.identitypublickeywithwitness_toJSON(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @param {boolean} skip_signature
     * @returns {any}
     */
  toObject (skip_signature) {
    const ret = wasm.identitypublickeywithwitness_toObject(this.__wbg_ptr, skip_signature)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const IdentityToFreezeDoesNotExistErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identitytofreezedoesnotexisterror_free(ptr >>> 0, 1))

export class IdentityToFreezeDoesNotExistError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityToFreezeDoesNotExistError.prototype)
    obj.__wbg_ptr = ptr
    IdentityToFreezeDoesNotExistErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityToFreezeDoesNotExistErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identitytofreezedoesnotexisterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.identitytofreezedoesnotexisterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.identitytofreezedoesnotexisterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.identitytofreezedoesnotexisterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const IdentityTokenAccountAlreadyFrozenErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identitytokenaccountalreadyfrozenerror_free(ptr >>> 0, 1))

export class IdentityTokenAccountAlreadyFrozenError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityTokenAccountAlreadyFrozenError.prototype)
    obj.__wbg_ptr = ptr
    IdentityTokenAccountAlreadyFrozenErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityTokenAccountAlreadyFrozenErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identitytokenaccountalreadyfrozenerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.identitytokenaccountalreadyfrozenerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.identitytokenaccountalreadyfrozenerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.identitytokenaccountalreadyfrozenerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const IdentityTokenAccountFrozenErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identitytokenaccountfrozenerror_free(ptr >>> 0, 1))

export class IdentityTokenAccountFrozenError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityTokenAccountFrozenError.prototype)
    obj.__wbg_ptr = ptr
    IdentityTokenAccountFrozenErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityTokenAccountFrozenErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identitytokenaccountfrozenerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.identitytokenaccountfrozenerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.identitytokenaccountfrozenerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.identitytokenaccountfrozenerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const IdentityTokenAccountNotFrozenErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identitytokenaccountnotfrozenerror_free(ptr >>> 0, 1))

export class IdentityTokenAccountNotFrozenError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityTokenAccountNotFrozenError.prototype)
    obj.__wbg_ptr = ptr
    IdentityTokenAccountNotFrozenErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityTokenAccountNotFrozenErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identitytokenaccountnotfrozenerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.identitytokenaccountnotfrozenerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.identitytokenaccountnotfrozenerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.identitytokenaccountnotfrozenerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const IdentityTopUpTransitionFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identitytopuptransition_free(ptr >>> 0, 1))

export class IdentityTopUpTransition {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityTopUpTransition.prototype)
    obj.__wbg_ptr = ptr
    IdentityTopUpTransitionFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityTopUpTransitionFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identitytopuptransition_free(ptr, 0)
  }

  /**
     * @param {number} platform_version
     */
  constructor (platform_version) {
    const ret = wasm.identitytopuptransition_new(platform_version)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    this.__wbg_ptr = ret[0] >>> 0
    IdentityTopUpTransitionFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @param {any} asset_lock_proof
     */
  setAssetLockProof (asset_lock_proof) {
    const ret = wasm.identitytopuptransition_setAssetLockProof(this.__wbg_ptr, asset_lock_proof)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @returns {any}
     */
  get assetLockProof () {
    const ret = wasm.identitytopuptransition_assetLockProof(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getAssetLockProof () {
    const ret = wasm.identitytopuptransition_getAssetLockProof(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getType () {
    const ret = wasm.identitytopuptransition_getType(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  get identityId () {
    const ret = wasm.identitytopuptransition_identityId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getIdentityId () {
    const ret = wasm.identitytopuptransition_getIdentityId(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {any} identity_id
     */
  setIdentityId (identity_id) {
    wasm.identitytopuptransition_setIdentityId(this.__wbg_ptr, identity_id)
  }

  /**
     * @returns {any}
     */
  getOwnerId () {
    const ret = wasm.identitytopuptransition_getOwnerId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getUserFeeIncrease () {
    const ret = wasm.identitytopuptransition_getUserFeeIncrease(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {number} user_fee_increase
     */
  setUserFeeIncrease (user_fee_increase) {
    wasm.identitytopuptransition_setUserFeeIncrease(this.__wbg_ptr, user_fee_increase)
  }

  /**
     * @param {any} options
     * @returns {any}
     */
  toObject (options) {
    const ret = wasm.identitytopuptransition_toObject(this.__wbg_ptr, options)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  toBuffer () {
    const ret = wasm.identitytopuptransition_toBuffer(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  toJSON () {
    const ret = wasm.identitytopuptransition_toJSON(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any[]}
     */
  getModifiedDataIds () {
    const ret = wasm.identitytopuptransition_getModifiedDataIds(this.__wbg_ptr)
    const v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
    return v1
  }

  /**
     * @returns {boolean}
     */
  isDataContractStateTransition () {
    const ret = wasm.identitytopuptransition_isDataContractStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isDocumentStateTransition () {
    const ret = wasm.identitytopuptransition_isDataContractStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isIdentityStateTransition () {
    const ret = wasm.identitytopuptransition_isIdentityStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isVotingStateTransition () {
    const ret = wasm.identitytopuptransition_isDataContractStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @param {Uint8Array} private_key
     * @param {number} key_type
     * @param {any | null} [bls]
     */
  signByPrivateKey (private_key, key_type, bls) {
    const ptr0 = passArray8ToWasm0(private_key, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.identitytopuptransition_signByPrivateKey(this.__wbg_ptr, ptr0, len0, key_type, isLikeNone(bls) ? 0 : addToExternrefTable0(bls))
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @returns {any}
     */
  getSignature () {
    const ret = wasm.identitytopuptransition_getSignature(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {Uint8Array | null} [signature]
     */
  setSignature (signature) {
    const ptr0 = isLikeNone(signature) ? 0 : passArray8ToWasm0(signature, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    wasm.identitytopuptransition_setSignature(this.__wbg_ptr, ptr0, len0)
  }
}

const IdentityTryingToPayWithWrongTokenErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identitytryingtopaywithwrongtokenerror_free(ptr >>> 0, 1))

export class IdentityTryingToPayWithWrongTokenError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityTryingToPayWithWrongTokenError.prototype)
    obj.__wbg_ptr = ptr
    IdentityTryingToPayWithWrongTokenErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityTryingToPayWithWrongTokenErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identitytryingtopaywithwrongtokenerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.identitytryingtopaywithwrongtokenerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.identitytryingtopaywithwrongtokenerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.identitytryingtopaywithwrongtokenerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const IdentityUpdateTransitionFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_identityupdatetransition_free(ptr >>> 0, 1))

export class IdentityUpdateTransition {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IdentityUpdateTransition.prototype)
    obj.__wbg_ptr = ptr
    IdentityUpdateTransitionFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IdentityUpdateTransitionFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_identityupdatetransition_free(ptr, 0)
  }

  /**
     * @param {number} platform_version
     */
  constructor (platform_version) {
    const ret = wasm.identityupdatetransition_new(platform_version)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    this.__wbg_ptr = ret[0] >>> 0
    IdentityUpdateTransitionFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @param {any[] | null} [public_keys]
     */
  setPublicKeysToAdd (public_keys) {
    const ptr0 = isLikeNone(public_keys) ? 0 : passArrayJsValueToWasm0(public_keys, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.identityupdatetransition_setPublicKeysToAdd(this.__wbg_ptr, ptr0, len0)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @returns {any[]}
     */
  getPublicKeysToAdd () {
    const ret = wasm.identityupdatetransition_getPublicKeysToAdd(this.__wbg_ptr)
    const v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
    return v1
  }

  /**
     * @returns {any[]}
     */
  get addPublicKeys () {
    const ret = wasm.identityupdatetransition_addPublicKeys(this.__wbg_ptr)
    const v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
    return v1
  }

  /**
     * @returns {any[]}
     */
  getPublicKeyIdsToDisable () {
    const ret = wasm.identityupdatetransition_getPublicKeyIdsToDisable(this.__wbg_ptr)
    const v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
    return v1
  }

  /**
     * @param {Uint32Array | null} [public_key_ids]
     */
  setPublicKeyIdsToDisable (public_key_ids) {
    const ptr0 = isLikeNone(public_key_ids) ? 0 : passArray32ToWasm0(public_key_ids, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    wasm.identityupdatetransition_setPublicKeyIdsToDisable(this.__wbg_ptr, ptr0, len0)
  }

  /**
     * @returns {number}
     */
  getType () {
    const ret = wasm.identityupdatetransition_getType(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  get identityId () {
    const ret = wasm.identityupdatetransition_identityId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getIdentityId () {
    const ret = wasm.identityupdatetransition_getIdentityId(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {any} identity_id
     */
  setIdentityId (identity_id) {
    wasm.identityupdatetransition_setIdentityId(this.__wbg_ptr, identity_id)
  }

  /**
     * @returns {any}
     */
  getOwnerId () {
    const ret = wasm.identityupdatetransition_getOwnerId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getUserFeeIncrease () {
    const ret = wasm.identityupdatetransition_getUserFeeIncrease(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {number} user_fee_increase
     */
  setUserFeeIncrease (user_fee_increase) {
    wasm.identityupdatetransition_setUserFeeIncrease(this.__wbg_ptr, user_fee_increase)
  }

  /**
     * @returns {bigint}
     */
  getIdentityContractNonce () {
    const ret = wasm.identityupdatetransition_getIdentityContractNonce(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @param {bigint} identity_nonce
     */
  setIdentityContractNonce (identity_nonce) {
    wasm.identityupdatetransition_setIdentityContractNonce(this.__wbg_ptr, identity_nonce)
  }

  /**
     * @param {any} options
     * @returns {any}
     */
  toObject (options) {
    const ret = wasm.identityupdatetransition_toObject(this.__wbg_ptr, options)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  toBuffer () {
    const ret = wasm.identityupdatetransition_toBuffer(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  toJSON () {
    const ret = wasm.identityupdatetransition_toJSON(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any[]}
     */
  getModifiedDataIds () {
    const ret = wasm.identityupdatetransition_getModifiedDataIds(this.__wbg_ptr)
    const v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
    return v1
  }

  /**
     * @returns {boolean}
     */
  isDataContractStateTransition () {
    const ret = wasm.batchtransition_isDataContractStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isDocumentStateTransition () {
    const ret = wasm.batchtransition_isDataContractStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isIdentityStateTransition () {
    const ret = wasm.batchtransition_getType(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isVotingStateTransition () {
    const ret = wasm.batchtransition_isDataContractStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @param {Uint8Array} private_key
     * @param {number} key_type
     * @param {any | null} [bls]
     */
  signByPrivateKey (private_key, key_type, bls) {
    const ptr0 = passArray8ToWasm0(private_key, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.identityupdatetransition_signByPrivateKey(this.__wbg_ptr, ptr0, len0, key_type, isLikeNone(bls) ? 0 : addToExternrefTable0(bls))
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @param {number | null} [key_id]
     */
  setSignaturePublicKeyId (key_id) {
    wasm.identityupdatetransition_setSignaturePublicKeyId(this.__wbg_ptr, isLikeNone(key_id) ? 0x100000001 : (key_id) >>> 0)
  }

  /**
     * @returns {any}
     */
  getSignature () {
    const ret = wasm.identityupdatetransition_getSignature(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getSignaturePublicKeyId () {
    const ret = wasm.identityupdatetransition_getSignaturePublicKeyId(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @param {Uint8Array | null} [signature]
     */
  setSignature (signature) {
    const ptr0 = isLikeNone(signature) ? 0 : passArray8ToWasm0(signature, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    wasm.identityupdatetransition_setSignature(this.__wbg_ptr, ptr0, len0)
  }

  /**
     * @returns {bigint}
     */
  getRevision () {
    const ret = wasm.identityupdatetransition_getRevision(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @param {bigint} revision
     */
  setRevision (revision) {
    wasm.identityupdatetransition_setRevision(this.__wbg_ptr, revision)
  }

  /**
     * @param {IdentityPublicKey} identity_public_key
     * @param {Uint8Array} private_key
     * @param {any} bls
     */
  sign (identity_public_key, private_key, bls) {
    _assertClass(identity_public_key, IdentityPublicKey)
    const ptr0 = passArray8ToWasm0(private_key, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.identityupdatetransition_sign(this.__wbg_ptr, identity_public_key.__wbg_ptr, ptr0, len0, bls)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @param {IdentityPublicKey} identity_public_key
     * @param {any} bls
     * @returns {boolean}
     */
  verifySignature (identity_public_key, bls) {
    _assertClass(identity_public_key, IdentityPublicKey)
    const ret = wasm.identityupdatetransition_verifySignature(this.__wbg_ptr, identity_public_key.__wbg_ptr, bls)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return ret[0] !== 0
  }
}

const IncompatibleDataContractSchemaErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_incompatibledatacontractschemaerror_free(ptr >>> 0, 1))

export class IncompatibleDataContractSchemaError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IncompatibleDataContractSchemaError.prototype)
    obj.__wbg_ptr = ptr
    IncompatibleDataContractSchemaErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IncompatibleDataContractSchemaErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_incompatibledatacontractschemaerror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getDataContractId () {
    const ret = wasm.incompatibledatacontractschemaerror_getDataContractId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {string}
     */
  getOperation () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.incompatibledatacontractschemaerror_getOperation(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  getFieldPath () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.incompatibledatacontractschemaerror_getFieldPath(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.incompatibledatacontractschemaerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.incompatibledatacontractschemaerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const IncompatibleDocumentTypeSchemaErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_incompatibledocumenttypeschemaerror_free(ptr >>> 0, 1))

export class IncompatibleDocumentTypeSchemaError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IncompatibleDocumentTypeSchemaError.prototype)
    obj.__wbg_ptr = ptr
    IncompatibleDocumentTypeSchemaErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IncompatibleDocumentTypeSchemaErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_incompatibledocumenttypeschemaerror_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getOperation () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.incompatibledocumenttypeschemaerror_getOperation(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  getPropertyPath () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.incompatibledocumenttypeschemaerror_getPropertyPath(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.incompatibledocumenttypeschemaerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.incompatibledocumenttypeschemaerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const IncompatibleProtocolVersionErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_incompatibleprotocolversionerror_free(ptr >>> 0, 1))

export class IncompatibleProtocolVersionError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IncompatibleProtocolVersionError.prototype)
    obj.__wbg_ptr = ptr
    IncompatibleProtocolVersionErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IncompatibleProtocolVersionErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_incompatibleprotocolversionerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getParsedProtocolVersion () {
    const ret = wasm.identitypublickeyisdisablederror_getPublicKeyIndex(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {number}
     */
  getMinimalProtocolVersion () {
    const ret = wasm.incompatibleprotocolversionerror_getMinimalProtocolVersion(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.incompatibleprotocolversionerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.incompatibleprotocolversionerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const IncompatibleRe2PatternErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_incompatiblere2patternerror_free(ptr >>> 0, 1))

export class IncompatibleRe2PatternError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(IncompatibleRe2PatternError.prototype)
    obj.__wbg_ptr = ptr
    IncompatibleRe2PatternErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    IncompatibleRe2PatternErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_incompatiblere2patternerror_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getPattern () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.incompatiblere2patternerror_getPattern(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  getPath () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.incompatiblere2patternerror_getPath(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  getMessage () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.incompatiblere2patternerror_getMessage(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.incompatiblere2patternerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.incompatiblere2patternerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InconsistentCompoundIndexDataErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_inconsistentcompoundindexdataerror_free(ptr >>> 0, 1))

export class InconsistentCompoundIndexDataError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InconsistentCompoundIndexDataError.prototype)
    obj.__wbg_ptr = ptr
    InconsistentCompoundIndexDataErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InconsistentCompoundIndexDataErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_inconsistentcompoundindexdataerror_free(ptr, 0)
  }

  /**
     * @returns {Array<any>}
     */
  getIndexedProperties () {
    const ret = wasm.inconsistentcompoundindexdataerror_getIndexedProperties(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {string}
     */
  getDocumentType () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.inconsistentcompoundindexdataerror_getDocumentType(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.inconsistentcompoundindexdataerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.inconsistentcompoundindexdataerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InstantAssetLockProofFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_instantassetlockproof_free(ptr >>> 0, 1))

export class InstantAssetLockProof {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InstantAssetLockProof.prototype)
    obj.__wbg_ptr = ptr
    InstantAssetLockProofFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InstantAssetLockProofFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_instantassetlockproof_free(ptr, 0)
  }

  /**
     * @param {any} raw_parameters
     */
  constructor (raw_parameters) {
    const ret = wasm.instantassetlockproof_new(raw_parameters)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    this.__wbg_ptr = ret[0] >>> 0
    InstantAssetLockProofFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {number}
     */
  getType () {
    const ret = wasm.instantassetlockproof_getType(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getOutputIndex () {
    const ret = wasm.instantassetlockproof_getOutputIndex(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {any | undefined}
     */
  getOutPoint () {
    const ret = wasm.instantassetlockproof_getOutPoint(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  getOutput () {
    const ret = wasm.instantassetlockproof_getOutput(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  createIdentifier () {
    const ret = wasm.instantassetlockproof_createIdentifier(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  getInstantLock () {
    const ret = wasm.instantassetlockproof_getInstantLock(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getTransaction () {
    const ret = wasm.instantassetlockproof_getTransaction(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  toObject () {
    const ret = wasm.instantassetlockproof_toObject(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  toJSON () {
    const ret = wasm.instantassetlockproof_toJSON(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidActionErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidactionerror_free(ptr >>> 0, 1))

export class InvalidActionError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidActionError.prototype)
    obj.__wbg_ptr = ptr
    InvalidActionErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidActionErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidactionerror_free(ptr, 0)
  }
}

const InvalidActionIdErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidactioniderror_free(ptr >>> 0, 1))

export class InvalidActionIdError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidActionIdError.prototype)
    obj.__wbg_ptr = ptr
    InvalidActionIdErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidActionIdErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidactioniderror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidactioniderror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidactioniderror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalidactioniderror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidActionNameErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidactionnameerror_free(ptr >>> 0, 1))

export class InvalidActionNameError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidActionNameError.prototype)
    obj.__wbg_ptr = ptr
    InvalidActionNameErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidActionNameErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidactionnameerror_free(ptr, 0)
  }

  /**
     * @param {any[]} actions
     */
  constructor (actions) {
    const ptr0 = passArrayJsValueToWasm0(actions, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.invalidactionnameerror_new(ptr0, len0)
    this.__wbg_ptr = ret >>> 0
    InvalidActionNameErrorFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {any[]}
     */
  getActions () {
    const ret = wasm.invalidactionnameerror_getActions(this.__wbg_ptr)
    const v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
    return v1
  }
}

const InvalidActiontErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidactionterror_free(ptr >>> 0, 1))

export class InvalidActiontError {
  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidActiontErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidactionterror_free(ptr, 0)
  }

  /**
     * @param {any} action
     */
  constructor (action) {
    const ret = wasm.invalidactionterror_new(action)
    return InvalidActionError.__wrap(ret)
  }
}

const InvalidAssetLockProofCoreChainHeightErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidassetlockproofcorechainheighterror_free(ptr >>> 0, 1))

export class InvalidAssetLockProofCoreChainHeightError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidAssetLockProofCoreChainHeightError.prototype)
    obj.__wbg_ptr = ptr
    InvalidAssetLockProofCoreChainHeightErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidAssetLockProofCoreChainHeightErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidassetlockproofcorechainheighterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getProofCoreChainLockedHeight () {
    const ret = wasm.datacontractmaxdeptherror_getMaxDepth(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {number}
     */
  getCurrentCoreChainLockedHeight () {
    const ret = wasm.invalidassetlockproofcorechainheighterror_getCurrentCoreChainLockedHeight(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidassetlockproofcorechainheighterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidassetlockproofcorechainheighterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidAssetLockProofTransactionHeightErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidassetlockprooftransactionheighterror_free(ptr >>> 0, 1))

export class InvalidAssetLockProofTransactionHeightError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidAssetLockProofTransactionHeightError.prototype)
    obj.__wbg_ptr = ptr
    InvalidAssetLockProofTransactionHeightErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidAssetLockProofTransactionHeightErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidassetlockprooftransactionheighterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getProofCoreChainLockedHeight () {
    const ret = wasm.invalidassetlockprooftransactionheighterror_getProofCoreChainLockedHeight(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {number | undefined}
     */
  getTransactionHeight () {
    const ret = wasm.invalidassetlockprooftransactionheighterror_getTransactionHeight(this.__wbg_ptr)
    return ret === 0x100000001 ? undefined : ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidassetlockprooftransactionheighterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidassetlockprooftransactionheighterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidAssetLockTransactionOutputReturnSizeErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidassetlocktransactionoutputreturnsizeerror_free(ptr >>> 0, 1))

export class InvalidAssetLockTransactionOutputReturnSizeError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidAssetLockTransactionOutputReturnSizeError.prototype)
    obj.__wbg_ptr = ptr
    InvalidAssetLockTransactionOutputReturnSizeErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidAssetLockTransactionOutputReturnSizeErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidassetlocktransactionoutputreturnsizeerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getOutputIndex () {
    const ret = wasm.identitypublickeyisdisablederror_getPublicKeyIndex(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidassetlocktransactionoutputreturnsizeerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidassetlocktransactionoutputreturnsizeerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidCompoundIndexErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidcompoundindexerror_free(ptr >>> 0, 1))

export class InvalidCompoundIndexError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidCompoundIndexError.prototype)
    obj.__wbg_ptr = ptr
    InvalidCompoundIndexErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidCompoundIndexErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidcompoundindexerror_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getDocumentType () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidcompoundindexerror_getDocumentType(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  getIndexName () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidcompoundindexerror_getIndexName(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidcompoundindexerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidcompoundindexerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidDataContractErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invaliddatacontracterror_free(ptr >>> 0, 1))

export class InvalidDataContractError {
  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidDataContractErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invaliddatacontracterror_free(ptr, 0)
  }

  /**
     * @returns {any[]}
     */
  getErrors () {
    const ret = wasm.invaliddatacontracterror_getErrors(this.__wbg_ptr)
    const v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
    return v1
  }

  /**
     * @returns {any}
     */
  getRawDataContract () {
    const ret = wasm.invaliddatacontracterror_getRawDataContract(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {string}
     */
  getMessage () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invaliddatacontracterror_getMessage(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidDataContractIdErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invaliddatacontractiderror_free(ptr >>> 0, 1))

export class InvalidDataContractIdError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidDataContractIdError.prototype)
    obj.__wbg_ptr = ptr
    InvalidDataContractIdErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidDataContractIdErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invaliddatacontractiderror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getExpectedId () {
    const ret = wasm.invaliddatacontractiderror_getExpectedId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getInvalidId () {
    const ret = wasm.invaliddatacontractiderror_getInvalidId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invaliddatacontractiderror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invaliddatacontractiderror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidDataContractVersionErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invaliddatacontractversionerror_free(ptr >>> 0, 1))

export class InvalidDataContractVersionError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidDataContractVersionError.prototype)
    obj.__wbg_ptr = ptr
    InvalidDataContractVersionErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidDataContractVersionErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invaliddatacontractversionerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getExpectedVersion () {
    const ret = wasm.invaliddatacontractversionerror_getExpectedVersion(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {number}
     */
  getVersion () {
    const ret = wasm.invaliddatacontractversionerror_getVersion(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invaliddatacontractversionerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invaliddatacontractversionerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidDescriptionLengthErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invaliddescriptionlengtherror_free(ptr >>> 0, 1))

export class InvalidDescriptionLengthError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidDescriptionLengthError.prototype)
    obj.__wbg_ptr = ptr
    InvalidDescriptionLengthErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidDescriptionLengthErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invaliddescriptionlengtherror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invaliddescriptionlengtherror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invaliddescriptionlengtherror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invaliddescriptionlengtherror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidDocumentActionErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invaliddocumentactionerror_free(ptr >>> 0, 1))

export class InvalidDocumentActionError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidDocumentActionError.prototype)
    obj.__wbg_ptr = ptr
    InvalidDocumentActionErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidDocumentActionErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invaliddocumentactionerror_free(ptr, 0)
  }
}

const InvalidDocumentErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invaliddocumenterror_free(ptr >>> 0, 1))

export class InvalidDocumentError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidDocumentError.prototype)
    obj.__wbg_ptr = ptr
    InvalidDocumentErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidDocumentErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invaliddocumenterror_free(ptr, 0)
  }

  /**
     * @param {any} raw_document
     * @param {any[]} errors
     */
  constructor (raw_document, errors) {
    const ptr0 = passArrayJsValueToWasm0(errors, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.invaliddocumenterror_new(raw_document, ptr0, len0)
    this.__wbg_ptr = ret >>> 0
    InvalidDocumentErrorFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {any[]}
     */
  getErrors () {
    const ret = wasm.invaliddocumenterror_getErrors(this.__wbg_ptr)
    const v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
    return v1
  }

  /**
     * @returns {any}
     */
  getRawDocument () {
    const ret = wasm.invaliddocumenterror_getRawDocument(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {string}
     */
  getMessage () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invaliddocumenterror_getMessage(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidDocumentRevisionErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invaliddocumentrevisionerror_free(ptr >>> 0, 1))

export class InvalidDocumentRevisionError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidDocumentRevisionError.prototype)
    obj.__wbg_ptr = ptr
    InvalidDocumentRevisionErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidDocumentRevisionErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invaliddocumentrevisionerror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getDocumentId () {
    const ret = wasm.invaliddocumentrevisionerror_getDocumentId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {bigint | undefined}
     */
  getPreviousRevision () {
    const ret = wasm.invaliddocumentrevisionerror_getPreviousRevision(this.__wbg_ptr)
    return ret[0] === 0 ? undefined : BigInt.asUintN(64, ret[1])
  }

  /**
     * @returns {bigint}
     */
  getDesiredRevision () {
    const ret = wasm.invaliddocumentrevisionerror_getDesiredRevision(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invaliddocumentrevisionerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invaliddocumentrevisionerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidDocumentTransitionActionErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invaliddocumenttransitionactionerror_free(ptr >>> 0, 1))

export class InvalidDocumentTransitionActionError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidDocumentTransitionActionError.prototype)
    obj.__wbg_ptr = ptr
    InvalidDocumentTransitionActionErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidDocumentTransitionActionErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invaliddocumenttransitionactionerror_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getAction () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invaliddocumenttransitionactionerror_getAction(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invaliddocumenttransitionactionerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invaliddocumenttransitionactionerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidDocumentTransitionIdErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invaliddocumenttransitioniderror_free(ptr >>> 0, 1))

export class InvalidDocumentTransitionIdError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidDocumentTransitionIdError.prototype)
    obj.__wbg_ptr = ptr
    InvalidDocumentTransitionIdErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidDocumentTransitionIdErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invaliddocumenttransitioniderror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getExpectedId () {
    const ret = wasm.invaliddocumenttransitioniderror_getExpectedId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getInvalidId () {
    const ret = wasm.invaliddocumenttransitioniderror_getInvalidId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invaliddocumenttransitioniderror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invaliddocumenttransitioniderror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidDocumentTypeErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invaliddocumenttypeerror_free(ptr >>> 0, 1))

export class InvalidDocumentTypeError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidDocumentTypeError.prototype)
    obj.__wbg_ptr = ptr
    InvalidDocumentTypeErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidDocumentTypeErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invaliddocumenttypeerror_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getType () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invaliddocumenttypeerror_getType(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  getDataContractId () {
    const ret = wasm.invaliddocumenttypeerror_getDataContractId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invaliddocumenttypeerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invaliddocumenttypeerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidDocumentTypeInDataContractErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invaliddocumenttypeindatacontracterror_free(ptr >>> 0, 1))

export class InvalidDocumentTypeInDataContractError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidDocumentTypeInDataContractError.prototype)
    obj.__wbg_ptr = ptr
    InvalidDocumentTypeInDataContractErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidDocumentTypeInDataContractErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invaliddocumenttypeindatacontracterror_free(ptr, 0)
  }

  /**
     * @param {string} doc_type
     * @param {any} data_contract_id
     */
  constructor (doc_type, data_contract_id) {
    const ptr0 = passStringToWasm0(doc_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.invaliddocumenttypeindatacontracterror_new(ptr0, len0, data_contract_id)
    this.__wbg_ptr = ret >>> 0
    InvalidDocumentTypeInDataContractErrorFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {string}
     */
  getType () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invaliddocumenttypeindatacontracterror_getType(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  getDataContractId () {
    const ret = wasm.invaliddocumenttypeindatacontracterror_getDataContractId(this.__wbg_ptr)
    return ret
  }
}

const InvalidDocumentTypeNameErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invaliddocumenttypenameerror_free(ptr >>> 0, 1))

export class InvalidDocumentTypeNameError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidDocumentTypeNameError.prototype)
    obj.__wbg_ptr = ptr
    InvalidDocumentTypeNameErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidDocumentTypeNameErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invaliddocumenttypenameerror_free(ptr, 0)
  }
}

const InvalidDocumentTypeNameErrorWasmFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invaliddocumenttypenameerrorwasm_free(ptr >>> 0, 1))

export class InvalidDocumentTypeNameErrorWasm {
  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidDocumentTypeNameErrorWasmFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invaliddocumenttypenameerrorwasm_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getName () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invaliddocumenttypenameerrorwasm_getName(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invaliddocumenttypenameerrorwasm_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invaliddocumenttypenameerrorwasm_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidDocumentTypeRequiredSecurityLevelErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invaliddocumenttyperequiredsecuritylevelerror_free(ptr >>> 0, 1))

export class InvalidDocumentTypeRequiredSecurityLevelError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidDocumentTypeRequiredSecurityLevelError.prototype)
    obj.__wbg_ptr = ptr
    InvalidDocumentTypeRequiredSecurityLevelErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidDocumentTypeRequiredSecurityLevelErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invaliddocumenttyperequiredsecuritylevelerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invaliddocumenttyperequiredsecuritylevelerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invaliddocumenttyperequiredsecuritylevelerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invaliddocumenttyperequiredsecuritylevelerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidGroupPositionErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidgrouppositionerror_free(ptr >>> 0, 1))

export class InvalidGroupPositionError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidGroupPositionError.prototype)
    obj.__wbg_ptr = ptr
    InvalidGroupPositionErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidGroupPositionErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidgrouppositionerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidgrouppositionerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidgrouppositionerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalidgrouppositionerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidIdentifierErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalididentifiererror_free(ptr >>> 0, 1))

export class InvalidIdentifierError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidIdentifierError.prototype)
    obj.__wbg_ptr = ptr
    InvalidIdentifierErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidIdentifierErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalididentifiererror_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getIdentifierName () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalididentifiererror_getIdentifierName(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  getIdentifierError () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalididentifiererror_getIdentifierError(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalididentifiererror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalididentifiererror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidIdentityAssetLockProofChainLockValidationErrorWasmFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalididentityassetlockproofchainlockvalidationerrorwasm_free(ptr >>> 0, 1))

export class InvalidIdentityAssetLockProofChainLockValidationErrorWasm {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidIdentityAssetLockProofChainLockValidationErrorWasm.prototype)
    obj.__wbg_ptr = ptr
    InvalidIdentityAssetLockProofChainLockValidationErrorWasmFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidIdentityAssetLockProofChainLockValidationErrorWasmFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalididentityassetlockproofchainlockvalidationerrorwasm_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getTransactionId () {
    const ret = wasm.invalididentityassetlockproofchainlockvalidationerrorwasm_getTransactionId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getHeightReportedNotLocked () {
    const ret = wasm.invalididentityassetlockproofchainlockvalidationerrorwasm_getHeightReportedNotLocked(this.__wbg_ptr)
    return ret >>> 0
  }
}

const InvalidIdentityAssetLockTransactionErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalididentityassetlocktransactionerror_free(ptr >>> 0, 1))

export class InvalidIdentityAssetLockTransactionError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidIdentityAssetLockTransactionError.prototype)
    obj.__wbg_ptr = ptr
    InvalidIdentityAssetLockTransactionErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidIdentityAssetLockTransactionErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalididentityassetlocktransactionerror_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getErrorMessage () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalididentityassetlocktransactionerror_getErrorMessage(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalididentityassetlocktransactionerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalididentityassetlocktransactionerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidIdentityAssetLockTransactionOutputErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalididentityassetlocktransactionoutputerror_free(ptr >>> 0, 1))

export class InvalidIdentityAssetLockTransactionOutputError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidIdentityAssetLockTransactionOutputError.prototype)
    obj.__wbg_ptr = ptr
    InvalidIdentityAssetLockTransactionOutputErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidIdentityAssetLockTransactionOutputErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalididentityassetlocktransactionoutputerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getOutputIndex () {
    const ret = wasm.datacontractmaxdeptherror_getMaxDepth(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalididentityassetlocktransactionoutputerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalididentityassetlocktransactionoutputerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidIdentityCreditTransferAmountErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalididentitycredittransferamounterror_free(ptr >>> 0, 1))

export class InvalidIdentityCreditTransferAmountError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidIdentityCreditTransferAmountError.prototype)
    obj.__wbg_ptr = ptr
    InvalidIdentityCreditTransferAmountErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidIdentityCreditTransferAmountErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalididentitycredittransferamounterror_free(ptr, 0)
  }

  /**
     * @returns {bigint}
     */
  getAmount () {
    const ret = wasm.invalididentitycredittransferamounterror_getAmount(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @returns {bigint}
     */
  getMinAmount () {
    const ret = wasm.invalididentitycredittransferamounterror_getMinAmount(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalididentitycredittransferamounterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalididentitycredittransferamounterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidIdentityCreditWithdrawalTransitionAmountErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalididentitycreditwithdrawaltransitionamounterror_free(ptr >>> 0, 1))

export class InvalidIdentityCreditWithdrawalTransitionAmountError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidIdentityCreditWithdrawalTransitionAmountError.prototype)
    obj.__wbg_ptr = ptr
    InvalidIdentityCreditWithdrawalTransitionAmountErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidIdentityCreditWithdrawalTransitionAmountErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalididentitycreditwithdrawaltransitionamounterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalididentitycreditwithdrawaltransitionamounterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalididentitycreditwithdrawaltransitionamounterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalididentitycreditwithdrawaltransitionamounterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidIdentityCreditWithdrawalTransitionCoreFeeErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalididentitycreditwithdrawaltransitioncorefeeerror_free(ptr >>> 0, 1))

export class InvalidIdentityCreditWithdrawalTransitionCoreFeeError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidIdentityCreditWithdrawalTransitionCoreFeeError.prototype)
    obj.__wbg_ptr = ptr
    InvalidIdentityCreditWithdrawalTransitionCoreFeeErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidIdentityCreditWithdrawalTransitionCoreFeeErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalididentitycreditwithdrawaltransitioncorefeeerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCoreFee () {
    const ret = wasm.invaliddatacontractversionerror_getExpectedVersion(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalididentitycreditwithdrawaltransitioncorefeeerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalididentitycreditwithdrawaltransitioncorefeeerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidIdentityCreditWithdrawalTransitionOutputScriptErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalididentitycreditwithdrawaltransitionoutputscripterror_free(ptr >>> 0, 1))

export class InvalidIdentityCreditWithdrawalTransitionOutputScriptError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidIdentityCreditWithdrawalTransitionOutputScriptError.prototype)
    obj.__wbg_ptr = ptr
    InvalidIdentityCreditWithdrawalTransitionOutputScriptErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidIdentityCreditWithdrawalTransitionOutputScriptErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalididentitycreditwithdrawaltransitionoutputscripterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalididentitycreditwithdrawaltransitionoutputscripterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalididentitycreditwithdrawaltransitionoutputscripterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidIdentityErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalididentityerror_free(ptr >>> 0, 1))

export class InvalidIdentityError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidIdentityError.prototype)
    obj.__wbg_ptr = ptr
    InvalidIdentityErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidIdentityErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalididentityerror_free(ptr, 0)
  }

  /**
     * @returns {any[]}
     */
  getErrors () {
    const ret = wasm.invalididentityerror_getErrors(this.__wbg_ptr)
    const v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
    return v1
  }

  /**
     * @returns {any}
     */
  getRawIdentity () {
    const ret = wasm.invalididentityerror_getRawIdentity(this.__wbg_ptr)
    return ret
  }
}

const InvalidIdentityKeySignatureErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalididentitykeysignatureerror_free(ptr >>> 0, 1))

export class InvalidIdentityKeySignatureError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidIdentityKeySignatureError.prototype)
    obj.__wbg_ptr = ptr
    InvalidIdentityKeySignatureErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidIdentityKeySignatureErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalididentitykeysignatureerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getPublicKeyId () {
    const ret = wasm.chainassetlockproof_getCoreChainLockedHeight(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalididentitykeysignatureerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalididentitykeysignatureerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidIdentityNonceErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalididentitynonceerror_free(ptr >>> 0, 1))

export class InvalidIdentityNonceError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidIdentityNonceError.prototype)
    obj.__wbg_ptr = ptr
    InvalidIdentityNonceErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidIdentityNonceErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalididentitynonceerror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getIdentityId () {
    const ret = wasm.invalididentitynonceerror_getIdentityId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {bigint | undefined}
     */
  getCurrentIdentityContractNonce () {
    const ret = wasm.invalididentitynonceerror_getCurrentIdentityContractNonce(this.__wbg_ptr)
    return ret[0] === 0 ? undefined : BigInt.asUintN(64, ret[1])
  }

  /**
     * @returns {bigint}
     */
  getSettingIdentityContractNonce () {
    const ret = wasm.invalididentitynonceerror_getSettingIdentityContractNonce(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @returns {Error}
     */
  getError () {
    const ret = wasm.invalididentitynonceerror_getError(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalididentitynonceerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalididentitynonceerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidIdentityPublicKeyDataErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalididentitypublickeydataerror_free(ptr >>> 0, 1))

export class InvalidIdentityPublicKeyDataError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidIdentityPublicKeyDataError.prototype)
    obj.__wbg_ptr = ptr
    InvalidIdentityPublicKeyDataErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidIdentityPublicKeyDataErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalididentitypublickeydataerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getPublicKeyId () {
    const ret = wasm.invalididentitypublickeydataerror_getPublicKeyId(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  getValidationError () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalididentitypublickeydataerror_getValidationError(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalididentitypublickeydataerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalididentitypublickeydataerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidIdentityPublicKeyIdErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalididentitypublickeyiderror_free(ptr >>> 0, 1))

export class InvalidIdentityPublicKeyIdError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidIdentityPublicKeyIdError.prototype)
    obj.__wbg_ptr = ptr
    InvalidIdentityPublicKeyIdErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidIdentityPublicKeyIdErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalididentitypublickeyiderror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getId () {
    const ret = wasm.invalididentitypublickeyiderror_getId(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalididentitypublickeyiderror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalididentitypublickeyiderror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidIdentityPublicKeySecurityLevelErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalididentitypublickeysecuritylevelerror_free(ptr >>> 0, 1))

export class InvalidIdentityPublicKeySecurityLevelError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidIdentityPublicKeySecurityLevelError.prototype)
    obj.__wbg_ptr = ptr
    InvalidIdentityPublicKeySecurityLevelErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidIdentityPublicKeySecurityLevelErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalididentitypublickeysecuritylevelerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getPublicKeyId () {
    const ret = wasm.invalididentitypublickeysecuritylevelerror_getPublicKeyId(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {number}
     */
  getPublicKeyPurpose () {
    const ret = wasm.invalididentitypublickeysecuritylevelerror_getPublicKeyPurpose(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getPublicKeySecurityLevel () {
    const ret = wasm.invalididentitypublickeysecuritylevelerror_getPublicKeySecurityLevel(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalididentitypublickeysecuritylevelerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalididentitypublickeysecuritylevelerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidIdentityPublicKeyTypeErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalididentitypublickeytypeerror_free(ptr >>> 0, 1))

export class InvalidIdentityPublicKeyTypeError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidIdentityPublicKeyTypeError.prototype)
    obj.__wbg_ptr = ptr
    InvalidIdentityPublicKeyTypeErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidIdentityPublicKeyTypeErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalididentitypublickeytypeerror_free(ptr, 0)
  }

  /**
     * @param {number} key_type
     */
  constructor (key_type) {
    const ret = wasm.invalididentitypublickeytypeerror_new(key_type)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    this.__wbg_ptr = ret[0] >>> 0
    InvalidIdentityPublicKeyTypeErrorFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {number}
     */
  getPublicKeyType () {
    const ret = wasm.invalididentitypublickeytypeerror_getPublicKeyType(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalididentitypublickeytypeerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalididentitypublickeytypeerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidIdentityRevisionErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalididentityrevisionerror_free(ptr >>> 0, 1))

export class InvalidIdentityRevisionError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidIdentityRevisionError.prototype)
    obj.__wbg_ptr = ptr
    InvalidIdentityRevisionErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidIdentityRevisionErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalididentityrevisionerror_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getIdentityId () {
    const ret = wasm.invalididentityrevisionerror_getIdentityId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCurrentRevision () {
    const ret = wasm.invalididentityrevisionerror_getCurrentRevision(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalididentityrevisionerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalididentityrevisionerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidIdentityUpdateTransitionDisableKeysErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalididentityupdatetransitiondisablekeyserror_free(ptr >>> 0, 1))

export class InvalidIdentityUpdateTransitionDisableKeysError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidIdentityUpdateTransitionDisableKeysError.prototype)
    obj.__wbg_ptr = ptr
    InvalidIdentityUpdateTransitionDisableKeysErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidIdentityUpdateTransitionDisableKeysErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalididentityupdatetransitiondisablekeyserror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalididentityupdatetransitiondisablekeyserror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalididentityupdatetransitiondisablekeyserror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalididentityupdatetransitiondisablekeyserror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidIdentityUpdateTransitionEmptyErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalididentityupdatetransitionemptyerror_free(ptr >>> 0, 1))

export class InvalidIdentityUpdateTransitionEmptyError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidIdentityUpdateTransitionEmptyError.prototype)
    obj.__wbg_ptr = ptr
    InvalidIdentityUpdateTransitionEmptyErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidIdentityUpdateTransitionEmptyErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalididentityupdatetransitionemptyerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalididentityupdatetransitionemptyerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalididentityupdatetransitionemptyerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalididentityupdatetransitionemptyerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidIndexPropertyTypeErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidindexpropertytypeerror_free(ptr >>> 0, 1))

export class InvalidIndexPropertyTypeError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidIndexPropertyTypeError.prototype)
    obj.__wbg_ptr = ptr
    InvalidIndexPropertyTypeErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidIndexPropertyTypeErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidindexpropertytypeerror_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getDocumentType () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidindexpropertytypeerror_getDocumentType(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  getIndexName () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidindexpropertytypeerror_getIndexName(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  getPropertyName () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidindexpropertytypeerror_getPropertyName(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  getPropertyType () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidindexpropertytypeerror_getPropertyType(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidindexpropertytypeerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidindexpropertytypeerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidIndexedPropertyConstraintErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidindexedpropertyconstrainterror_free(ptr >>> 0, 1))

export class InvalidIndexedPropertyConstraintError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidIndexedPropertyConstraintError.prototype)
    obj.__wbg_ptr = ptr
    InvalidIndexedPropertyConstraintErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidIndexedPropertyConstraintErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidindexedpropertyconstrainterror_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getDocumentType () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidindexedpropertyconstrainterror_getDocumentType(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  getIndexName () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidindexedpropertyconstrainterror_getIndexName(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  getPropertyName () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidindexedpropertyconstrainterror_getPropertyName(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  getConstraintName () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidindexedpropertyconstrainterror_getConstraintName(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  getReason () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidindexedpropertyconstrainterror_getReason(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidindexedpropertyconstrainterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidindexedpropertyconstrainterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidInitialRevisionErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidinitialrevisionerror_free(ptr >>> 0, 1))

export class InvalidInitialRevisionError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidInitialRevisionError.prototype)
    obj.__wbg_ptr = ptr
    InvalidInitialRevisionErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidInitialRevisionErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidinitialrevisionerror_free(ptr, 0)
  }

  /**
     * @param {Document} document
     */
  constructor (document) {
    _assertClass(document, Document)
    const ptr0 = document.__destroy_into_raw()
    const ret = wasm.invalidinitialrevisionerror_new(ptr0)
    this.__wbg_ptr = ret >>> 0
    InvalidInitialRevisionErrorFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {Document}
     */
  getDocument () {
    const ret = wasm.invalidinitialrevisionerror_getDocument(this.__wbg_ptr)
    return Document.__wrap(ret)
  }
}

const InvalidInstantAssetLockProofErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidinstantassetlockprooferror_free(ptr >>> 0, 1))

export class InvalidInstantAssetLockProofError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidInstantAssetLockProofError.prototype)
    obj.__wbg_ptr = ptr
    InvalidInstantAssetLockProofErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidInstantAssetLockProofErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidinstantassetlockprooferror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidinstantassetlockprooferror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidinstantassetlockprooferror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidInstantAssetLockProofSignatureErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidinstantassetlockproofsignatureerror_free(ptr >>> 0, 1))

export class InvalidInstantAssetLockProofSignatureError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidInstantAssetLockProofSignatureError.prototype)
    obj.__wbg_ptr = ptr
    InvalidInstantAssetLockProofSignatureErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidInstantAssetLockProofSignatureErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidinstantassetlockproofsignatureerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidinstantassetlockproofsignatureerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidinstantassetlockproofsignatureerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidJsonSchemaRefErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidjsonschemareferror_free(ptr >>> 0, 1))

export class InvalidJsonSchemaRefError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidJsonSchemaRefError.prototype)
    obj.__wbg_ptr = ptr
    InvalidJsonSchemaRefErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidJsonSchemaRefErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidjsonschemareferror_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getRefError () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidjsonschemareferror_getRefError(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidjsonschemareferror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidjsonschemareferror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidKeywordCharacterErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidkeywordcharactererror_free(ptr >>> 0, 1))

export class InvalidKeywordCharacterError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidKeywordCharacterError.prototype)
    obj.__wbg_ptr = ptr
    InvalidKeywordCharacterErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidKeywordCharacterErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidkeywordcharactererror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidkeywordcharactererror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidkeywordcharactererror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalidkeywordcharactererror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidKeywordLengthErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidkeywordlengtherror_free(ptr >>> 0, 1))

export class InvalidKeywordLengthError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidKeywordLengthError.prototype)
    obj.__wbg_ptr = ptr
    InvalidKeywordLengthErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidKeywordLengthErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidkeywordlengtherror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidkeywordlengtherror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidkeywordlengtherror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalidkeywordlengtherror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidSignaturePublicKeyPurposeErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidsignaturepublickeypurposeerror_free(ptr >>> 0, 1))

export class InvalidSignaturePublicKeyPurposeError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidSignaturePublicKeyPurposeError.prototype)
    obj.__wbg_ptr = ptr
    InvalidSignaturePublicKeyPurposeErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidSignaturePublicKeyPurposeErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidsignaturepublickeypurposeerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getPublicKeyPurpose () {
    const ret = wasm.invalidsignaturepublickeypurposeerror_getPublicKeyPurpose(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {Array<any>}
     */
  getKeyPurposeRequirement () {
    const ret = wasm.invalidsignaturepublickeypurposeerror_getKeyPurposeRequirement(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidsignaturepublickeypurposeerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidsignaturepublickeypurposeerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidSignaturePublicKeySecurityLevelErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidsignaturepublickeysecuritylevelerror_free(ptr >>> 0, 1))

export class InvalidSignaturePublicKeySecurityLevelError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidSignaturePublicKeySecurityLevelError.prototype)
    obj.__wbg_ptr = ptr
    InvalidSignaturePublicKeySecurityLevelErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidSignaturePublicKeySecurityLevelErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidsignaturepublickeysecuritylevelerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getPublicKeySecurityLevel () {
    const ret = wasm.invalidsignaturepublickeysecuritylevelerror_getPublicKeySecurityLevel(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {Array<any>}
     */
  getKeySecurityLevelRequirement () {
    const ret = wasm.invalidsignaturepublickeysecuritylevelerror_getKeySecurityLevelRequirement(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidsignaturepublickeysecuritylevelerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidsignaturepublickeysecuritylevelerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidStateTransitionErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidstatetransitionerror_free(ptr >>> 0, 1))

export class InvalidStateTransitionError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidStateTransitionError.prototype)
    obj.__wbg_ptr = ptr
    InvalidStateTransitionErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidStateTransitionErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidstatetransitionerror_free(ptr, 0)
  }

  /**
     * @param {any[]} error_buffers
     * @param {any} raw_state_transition
     */
  constructor (error_buffers, raw_state_transition) {
    const ptr0 = passArrayJsValueToWasm0(error_buffers, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.invalidstatetransitionerror_new_wasm(ptr0, len0, raw_state_transition)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    this.__wbg_ptr = ret[0] >>> 0
    InvalidStateTransitionErrorFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {any[]}
     */
  getErrors () {
    const ret = wasm.invalidstatetransitionerror_getErrors(this.__wbg_ptr)
    const v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
    return v1
  }

  /**
     * @returns {any}
     */
  getRawStateTransition () {
    const ret = wasm.invalidstatetransitionerror_getRawStateTransition(this.__wbg_ptr)
    return ret
  }
}

const InvalidStateTransitionSignatureErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidstatetransitionsignatureerror_free(ptr >>> 0, 1))

export class InvalidStateTransitionSignatureError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidStateTransitionSignatureError.prototype)
    obj.__wbg_ptr = ptr
    InvalidStateTransitionSignatureErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidStateTransitionSignatureErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidstatetransitionsignatureerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidstatetransitionsignatureerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidstatetransitionsignatureerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidStateTransitionTypeErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidstatetransitiontypeerror_free(ptr >>> 0, 1))

export class InvalidStateTransitionTypeError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidStateTransitionTypeError.prototype)
    obj.__wbg_ptr = ptr
    InvalidStateTransitionTypeErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidStateTransitionTypeErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidstatetransitiontypeerror_free(ptr, 0)
  }

  /**
     * @param {number} transition_type
     */
  constructor (transition_type) {
    const ret = wasm.invalidstatetransitiontypeerror_new(transition_type)
    this.__wbg_ptr = ret >>> 0
    InvalidStateTransitionTypeErrorFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {number}
     */
  getType () {
    const ret = wasm.invalidstatetransitiontypeerror_getType(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidstatetransitiontypeerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidstatetransitiontypeerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const InvalidTokenAmountErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidtokenamounterror_free(ptr >>> 0, 1))

export class InvalidTokenAmountError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidTokenAmountError.prototype)
    obj.__wbg_ptr = ptr
    InvalidTokenAmountErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidTokenAmountErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidtokenamounterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidtokenamounterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidtokenamounterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalidtokenamounterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidTokenBaseSupplyErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidtokenbasesupplyerror_free(ptr >>> 0, 1))

export class InvalidTokenBaseSupplyError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidTokenBaseSupplyError.prototype)
    obj.__wbg_ptr = ptr
    InvalidTokenBaseSupplyErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidTokenBaseSupplyErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidtokenbasesupplyerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidtokenbasesupplyerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidtokenbasesupplyerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalidtokenbasesupplyerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidTokenClaimNoCurrentRewardsFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidtokenclaimnocurrentrewards_free(ptr >>> 0, 1))

export class InvalidTokenClaimNoCurrentRewards {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidTokenClaimNoCurrentRewards.prototype)
    obj.__wbg_ptr = ptr
    InvalidTokenClaimNoCurrentRewardsFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidTokenClaimNoCurrentRewardsFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidtokenclaimnocurrentrewards_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidtokenclaimnocurrentrewards_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidtokenclaimnocurrentrewards_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalidtokenclaimnocurrentrewards_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidTokenClaimPropertyMismatchFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidtokenclaimpropertymismatch_free(ptr >>> 0, 1))

export class InvalidTokenClaimPropertyMismatch {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidTokenClaimPropertyMismatch.prototype)
    obj.__wbg_ptr = ptr
    InvalidTokenClaimPropertyMismatchFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidTokenClaimPropertyMismatchFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidtokenclaimpropertymismatch_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidtokenclaimpropertymismatch_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidtokenclaimpropertymismatch_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalidtokenclaimpropertymismatch_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidTokenClaimWrongClaimantFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidtokenclaimwrongclaimant_free(ptr >>> 0, 1))

export class InvalidTokenClaimWrongClaimant {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidTokenClaimWrongClaimant.prototype)
    obj.__wbg_ptr = ptr
    InvalidTokenClaimWrongClaimantFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidTokenClaimWrongClaimantFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidtokenclaimwrongclaimant_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidtokenclaimwrongclaimant_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidtokenclaimwrongclaimant_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalidtokenclaimwrongclaimant_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidTokenConfigUpdateNoChangeErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidtokenconfigupdatenochangeerror_free(ptr >>> 0, 1))

export class InvalidTokenConfigUpdateNoChangeError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidTokenConfigUpdateNoChangeError.prototype)
    obj.__wbg_ptr = ptr
    InvalidTokenConfigUpdateNoChangeErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidTokenConfigUpdateNoChangeErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidtokenconfigupdatenochangeerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidtokenconfigupdatenochangeerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidtokenconfigupdatenochangeerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalidtokenconfigupdatenochangeerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidTokenDistributionBlockIntervalTooShortErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidtokendistributionblockintervaltooshorterror_free(ptr >>> 0, 1))

export class InvalidTokenDistributionBlockIntervalTooShortError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidTokenDistributionBlockIntervalTooShortError.prototype)
    obj.__wbg_ptr = ptr
    InvalidTokenDistributionBlockIntervalTooShortErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidTokenDistributionBlockIntervalTooShortErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidtokendistributionblockintervaltooshorterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidtokendistributionblockintervaltooshorterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidtokendistributionblockintervaltooshorterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalidtokendistributionblockintervaltooshorterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidTokenDistributionFunctionDivideByZeroErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidtokendistributionfunctiondividebyzeroerror_free(ptr >>> 0, 1))

export class InvalidTokenDistributionFunctionDivideByZeroError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidTokenDistributionFunctionDivideByZeroError.prototype)
    obj.__wbg_ptr = ptr
    InvalidTokenDistributionFunctionDivideByZeroErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidTokenDistributionFunctionDivideByZeroErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidtokendistributionfunctiondividebyzeroerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidtokendistributionfunctiondividebyzeroerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidtokendistributionfunctiondividebyzeroerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalidtokendistributionfunctiondividebyzeroerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidTokenDistributionFunctionIncoherenceErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidtokendistributionfunctionincoherenceerror_free(ptr >>> 0, 1))

export class InvalidTokenDistributionFunctionIncoherenceError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidTokenDistributionFunctionIncoherenceError.prototype)
    obj.__wbg_ptr = ptr
    InvalidTokenDistributionFunctionIncoherenceErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidTokenDistributionFunctionIncoherenceErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidtokendistributionfunctionincoherenceerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidtokendistributionfunctionincoherenceerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidtokendistributionfunctionincoherenceerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalidtokendistributionfunctionincoherenceerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidTokenDistributionFunctionInvalidParameterErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidtokendistributionfunctioninvalidparametererror_free(ptr >>> 0, 1))

export class InvalidTokenDistributionFunctionInvalidParameterError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidTokenDistributionFunctionInvalidParameterError.prototype)
    obj.__wbg_ptr = ptr
    InvalidTokenDistributionFunctionInvalidParameterErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidTokenDistributionFunctionInvalidParameterErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidtokendistributionfunctioninvalidparametererror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidtokendistributionfunctioninvalidparametererror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidtokendistributionfunctioninvalidparametererror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalidtokendistributionfunctioninvalidparametererror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidTokenDistributionFunctionInvalidParameterTupleErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidtokendistributionfunctioninvalidparametertupleerror_free(ptr >>> 0, 1))

export class InvalidTokenDistributionFunctionInvalidParameterTupleError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidTokenDistributionFunctionInvalidParameterTupleError.prototype)
    obj.__wbg_ptr = ptr
    InvalidTokenDistributionFunctionInvalidParameterTupleErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidTokenDistributionFunctionInvalidParameterTupleErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidtokendistributionfunctioninvalidparametertupleerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidtokendistributionfunctioninvalidparametertupleerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidtokendistributionfunctioninvalidparametertupleerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalidtokendistributionfunctioninvalidparametertupleerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidTokenDistributionTimeIntervalNotMinuteAlignedErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidtokendistributiontimeintervalnotminutealignederror_free(ptr >>> 0, 1))

export class InvalidTokenDistributionTimeIntervalNotMinuteAlignedError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidTokenDistributionTimeIntervalNotMinuteAlignedError.prototype)
    obj.__wbg_ptr = ptr
    InvalidTokenDistributionTimeIntervalNotMinuteAlignedErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidTokenDistributionTimeIntervalNotMinuteAlignedErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidtokendistributiontimeintervalnotminutealignederror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidtokendistributiontimeintervalnotminutealignederror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidtokendistributiontimeintervalnotminutealignederror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalidtokendistributiontimeintervalnotminutealignederror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidTokenDistributionTimeIntervalTooShortErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidtokendistributiontimeintervaltooshorterror_free(ptr >>> 0, 1))

export class InvalidTokenDistributionTimeIntervalTooShortError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidTokenDistributionTimeIntervalTooShortError.prototype)
    obj.__wbg_ptr = ptr
    InvalidTokenDistributionTimeIntervalTooShortErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidTokenDistributionTimeIntervalTooShortErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidtokendistributiontimeintervaltooshorterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidtokendistributiontimeintervaltooshorterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidtokendistributiontimeintervaltooshorterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalidtokendistributiontimeintervaltooshorterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidTokenIdErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidtokeniderror_free(ptr >>> 0, 1))

export class InvalidTokenIdError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidTokenIdError.prototype)
    obj.__wbg_ptr = ptr
    InvalidTokenIdErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidTokenIdErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidtokeniderror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidtokeniderror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidtokeniderror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalidtokeniderror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidTokenLanguageCodeErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidtokenlanguagecodeerror_free(ptr >>> 0, 1))

export class InvalidTokenLanguageCodeError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidTokenLanguageCodeError.prototype)
    obj.__wbg_ptr = ptr
    InvalidTokenLanguageCodeErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidTokenLanguageCodeErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidtokenlanguagecodeerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidtokenlanguagecodeerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidtokenlanguagecodeerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalidtokenlanguagecodeerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidTokenNameCharacterErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidtokennamecharactererror_free(ptr >>> 0, 1))

export class InvalidTokenNameCharacterError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidTokenNameCharacterError.prototype)
    obj.__wbg_ptr = ptr
    InvalidTokenNameCharacterErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidTokenNameCharacterErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidtokennamecharactererror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidtokennamecharactererror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidtokennamecharactererror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalidtokennamecharactererror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidTokenNameLengthErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidtokennamelengtherror_free(ptr >>> 0, 1))

export class InvalidTokenNameLengthError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidTokenNameLengthError.prototype)
    obj.__wbg_ptr = ptr
    InvalidTokenNameLengthErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidTokenNameLengthErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidtokennamelengtherror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidtokennamelengtherror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidtokennamelengtherror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalidtokennamelengtherror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidTokenNoteTooBigErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidtokennotetoobigerror_free(ptr >>> 0, 1))

export class InvalidTokenNoteTooBigError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidTokenNoteTooBigError.prototype)
    obj.__wbg_ptr = ptr
    InvalidTokenNoteTooBigErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidTokenNoteTooBigErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidtokennotetoobigerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidtokennotetoobigerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidtokennotetoobigerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalidtokennotetoobigerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidTokenPositionErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidtokenpositionerror_free(ptr >>> 0, 1))

export class InvalidTokenPositionError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidTokenPositionError.prototype)
    obj.__wbg_ptr = ptr
    InvalidTokenPositionErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidTokenPositionErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidtokenpositionerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidtokenpositionerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidtokenpositionerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalidtokenpositionerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const InvalidTokenPositionStateErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_invalidtokenpositionstateerror_free(ptr >>> 0, 1))

export class InvalidTokenPositionStateError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(InvalidTokenPositionStateError.prototype)
    obj.__wbg_ptr = ptr
    InvalidTokenPositionStateErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    InvalidTokenPositionStateErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_invalidtokenpositionstateerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.invalidtokenpositionstateerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.invalidtokenpositionstateerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.invalidtokenpositionstateerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const JsonSchemaCompilationErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_jsonschemacompilationerror_free(ptr >>> 0, 1))

export class JsonSchemaCompilationError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(JsonSchemaCompilationError.prototype)
    obj.__wbg_ptr = ptr
    JsonSchemaCompilationErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    JsonSchemaCompilationErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_jsonschemacompilationerror_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getError () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.jsonschemacompilationerror_getError(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.jsonschemacompilationerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.jsonschemacompilationerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const JsonSchemaErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_jsonschemaerror_free(ptr >>> 0, 1))

export class JsonSchemaError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(JsonSchemaError.prototype)
    obj.__wbg_ptr = ptr
    JsonSchemaErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  toJSON () {
    return {
      message: this.message,
      keyword: this.keyword,
      instancePath: this.instancePath,
      schemaPath: this.schemaPath,
      propertyName: this.propertyName,
      params: this.params,
      code: this.code
    }
  }

  toString () {
    return JSON.stringify(this)
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    JsonSchemaErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_jsonschemaerror_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getKeyword () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.jsonschemaerror_getKeyword(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  getInstancePath () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.jsonschemaerror_getInstancePath(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  getSchemaPath () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.jsonschemaerror_getSchemaPath(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  getPropertyName () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.jsonschemaerror_getPropertyName(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  getParams () {
    const ret = wasm.jsonschemaerror_getParams(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.jsonschemaerror_code(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  toString () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.jsonschemaerror_toString(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.jsonschemaerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  get keyword () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.jsonschemaerror_keyword(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  get instancePath () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.jsonschemaerror_instancePath(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  get schemaPath () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.jsonschemaerror_schemaPath(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  get propertyName () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.jsonschemaerror_propertyName(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  get params () {
    const ret = wasm.jsonschemaerror_params(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {number}
     */
  get code () {
    const ret = wasm.jsonschemaerror_code(this.__wbg_ptr)
    return ret >>> 0
  }
}

const MainGroupIsNotDefinedErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_maingroupisnotdefinederror_free(ptr >>> 0, 1))

export class MainGroupIsNotDefinedError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(MainGroupIsNotDefinedError.prototype)
    obj.__wbg_ptr = ptr
    MainGroupIsNotDefinedErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    MainGroupIsNotDefinedErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_maingroupisnotdefinederror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.maingroupisnotdefinederror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.maingroupisnotdefinederror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.maingroupisnotdefinederror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const MasterPublicKeyUpdateErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_masterpublickeyupdateerror_free(ptr >>> 0, 1))

export class MasterPublicKeyUpdateError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(MasterPublicKeyUpdateError.prototype)
    obj.__wbg_ptr = ptr
    MasterPublicKeyUpdateErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    MasterPublicKeyUpdateErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_masterpublickeyupdateerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.masterpublickeyupdateerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.masterpublickeyupdateerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.masterpublickeyupdateerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const MasternodeIncorrectVoterIdentityIdErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_masternodeincorrectvoteridentityiderror_free(ptr >>> 0, 1))

export class MasternodeIncorrectVoterIdentityIdError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(MasternodeIncorrectVoterIdentityIdError.prototype)
    obj.__wbg_ptr = ptr
    MasternodeIncorrectVoterIdentityIdErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    MasternodeIncorrectVoterIdentityIdErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_masternodeincorrectvoteridentityiderror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.masternodeincorrectvoteridentityiderror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.masternodeincorrectvoteridentityiderror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.masternodeincorrectvoteridentityiderror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const MasternodeIncorrectVotingAddressErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_masternodeincorrectvotingaddresserror_free(ptr >>> 0, 1))

export class MasternodeIncorrectVotingAddressError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(MasternodeIncorrectVotingAddressError.prototype)
    obj.__wbg_ptr = ptr
    MasternodeIncorrectVotingAddressErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    MasternodeIncorrectVotingAddressErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_masternodeincorrectvotingaddresserror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.masternodeincorrectvotingaddresserror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.masternodeincorrectvotingaddresserror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.masternodeincorrectvotingaddresserror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const MasternodeNotFoundErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_masternodenotfounderror_free(ptr >>> 0, 1))

export class MasternodeNotFoundError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(MasternodeNotFoundError.prototype)
    obj.__wbg_ptr = ptr
    MasternodeNotFoundErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    MasternodeNotFoundErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_masternodenotfounderror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.masternodenotfounderror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.masternodenotfounderror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.masternodenotfounderror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const MasternodeVoteAlreadyPresentErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_masternodevotealreadypresenterror_free(ptr >>> 0, 1))

export class MasternodeVoteAlreadyPresentError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(MasternodeVoteAlreadyPresentError.prototype)
    obj.__wbg_ptr = ptr
    MasternodeVoteAlreadyPresentErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    MasternodeVoteAlreadyPresentErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_masternodevotealreadypresenterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.masternodevotealreadypresenterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.masternodevotealreadypresenterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.masternodevotealreadypresenterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const MasternodeVoteTransitionFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_masternodevotetransition_free(ptr >>> 0, 1))

export class MasternodeVoteTransition {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(MasternodeVoteTransition.prototype)
    obj.__wbg_ptr = ptr
    MasternodeVoteTransitionFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    MasternodeVoteTransitionFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_masternodevotetransition_free(ptr, 0)
  }

  /**
     * @param {number} platform_version
     */
  constructor (platform_version) {
    const ret = wasm.masternodevotetransition_new(platform_version)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    this.__wbg_ptr = ret[0] >>> 0
    MasternodeVoteTransitionFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {any}
     */
  getOwnerId () {
    const ret = wasm.masternodevotetransition_getOwnerId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getType () {
    const ret = wasm.masternodevotetransition_getType(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getProTxHash () {
    const ret = wasm.masternodevotetransition_getProTxHash(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {any} pro_tx_hash
     */
  setProTxHash (pro_tx_hash) {
    wasm.masternodevotetransition_setProTxHash(this.__wbg_ptr, pro_tx_hash)
  }

  /**
     * @param {any} options
     * @returns {any}
     */
  toObject (options) {
    const ret = wasm.masternodevotetransition_toObject(this.__wbg_ptr, options)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  toBuffer () {
    const ret = wasm.masternodevotetransition_toBuffer(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any}
     */
  toJSON () {
    const ret = wasm.masternodevotetransition_toJSON(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any[]}
     */
  getModifiedDataIds () {
    const ret = wasm.masternodevotetransition_getModifiedDataIds(this.__wbg_ptr)
    const v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
    return v1
  }

  /**
     * @returns {boolean}
     */
  isDataContractStateTransition () {
    const ret = wasm.datacontractupdatetransition_isDocumentStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isDocumentStateTransition () {
    const ret = wasm.datacontractupdatetransition_isDocumentStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isIdentityStateTransition () {
    const ret = wasm.datacontractupdatetransition_isDocumentStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {boolean}
     */
  isVotingStateTransition () {
    const ret = wasm.datacontractupdatetransition_isDataContractStateTransition(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {number}
     */
  getUserFeeIncrease () {
    const ret = wasm.datacontractupdatetransition_isDocumentStateTransition(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {number} user_fee_increase
     */
  setUserFeeIncrease (user_fee_increase) {
    wasm.masternodevotetransition_setUserFeeIncrease(this.__wbg_ptr, user_fee_increase)
  }

  /**
     * @returns {bigint}
     */
  getIdentityContractNonce () {
    const ret = wasm.masternodevotetransition_getIdentityContractNonce(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @returns {object | undefined}
     */
  getContestedDocumentResourceVotePoll () {
    const ret = wasm.masternodevotetransition_getContestedDocumentResourceVotePoll(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {Uint8Array} private_key
     * @param {number} key_type
     * @param {any | null} [bls]
     */
  signByPrivateKey (private_key, key_type, bls) {
    const ptr0 = passArray8ToWasm0(private_key, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.masternodevotetransition_signByPrivateKey(this.__wbg_ptr, ptr0, len0, key_type, isLikeNone(bls) ? 0 : addToExternrefTable0(bls))
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }

  /**
     * @returns {any}
     */
  getSignature () {
    const ret = wasm.masternodevotetransition_getSignature(this.__wbg_ptr)
    return ret
  }

  /**
     * @param {Uint8Array | null} [signature]
     */
  setSignature (signature) {
    const ptr0 = isLikeNone(signature) ? 0 : passArray8ToWasm0(signature, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    wasm.masternodevotetransition_setSignature(this.__wbg_ptr, ptr0, len0)
  }

  /**
     * @param {IdentityPublicKey} identity_public_key
     * @param {Uint8Array} private_key
     * @param {any} bls
     */
  sign (identity_public_key, private_key, bls) {
    _assertClass(identity_public_key, IdentityPublicKey)
    const ptr0 = passArray8ToWasm0(private_key, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.masternodevotetransition_sign(this.__wbg_ptr, identity_public_key.__wbg_ptr, ptr0, len0, bls)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }
}

const MasternodeVotedTooManyTimesErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_masternodevotedtoomanytimeserror_free(ptr >>> 0, 1))

export class MasternodeVotedTooManyTimesError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(MasternodeVotedTooManyTimesError.prototype)
    obj.__wbg_ptr = ptr
    MasternodeVotedTooManyTimesErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    MasternodeVotedTooManyTimesErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_masternodevotedtoomanytimeserror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.masternodevotedtoomanytimeserror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.masternodevotedtoomanytimeserror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.masternodevotedtoomanytimeserror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const MaxDocumentsTransitionsExceededErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_maxdocumentstransitionsexceedederror_free(ptr >>> 0, 1))

export class MaxDocumentsTransitionsExceededError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(MaxDocumentsTransitionsExceededError.prototype)
    obj.__wbg_ptr = ptr
    MaxDocumentsTransitionsExceededErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    MaxDocumentsTransitionsExceededErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_maxdocumentstransitionsexceedederror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.maxdocumentstransitionsexceedederror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.maxdocumentstransitionsexceedederror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.maxdocumentstransitionsexceedederror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const MaxIdentityPublicKeyLimitReachedErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_maxidentitypublickeylimitreachederror_free(ptr >>> 0, 1))

export class MaxIdentityPublicKeyLimitReachedError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(MaxIdentityPublicKeyLimitReachedError.prototype)
    obj.__wbg_ptr = ptr
    MaxIdentityPublicKeyLimitReachedErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    MaxIdentityPublicKeyLimitReachedErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_maxidentitypublickeylimitreachederror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getMaxItems () {
    const ret = wasm.maxidentitypublickeylimitreachederror_getMaxItems(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.maxidentitypublickeylimitreachederror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.maxidentitypublickeylimitreachederror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const MetadataFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_metadata_free(ptr >>> 0, 1))

export class Metadata {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(Metadata.prototype)
    obj.__wbg_ptr = ptr
    MetadataFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    MetadataFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_metadata_free(ptr, 0)
  }

  /**
     * @param {bigint} block_height
     * @param {number} core_chain_locked_height
     * @param {bigint} time_ms
     * @param {number} protocol_version
     */
  constructor (block_height, core_chain_locked_height, time_ms, protocol_version) {
    const ret = wasm.metadata_new(block_height, core_chain_locked_height, time_ms, protocol_version)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    this.__wbg_ptr = ret[0] >>> 0
    MetadataFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @param {any} object
     * @returns {Metadata}
     */
  static from (object) {
    const ret = wasm.metadata_from(object)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return Metadata.__wrap(ret[0])
  }

  /**
     * @returns {any}
     */
  toJSON () {
    const ret = wasm.metadata_toJSON(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  toObject () {
    const ret = wasm.metadata_toObject(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {bigint}
     */
  getBlockHeight () {
    const ret = wasm.metadata_getBlockHeight(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @returns {number}
     */
  getCoreChainLockedHeight () {
    const ret = wasm.metadata_getCoreChainLockedHeight(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {bigint}
     */
  getTimeMs () {
    const ret = wasm.metadata_getTimeMs(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @returns {number}
     */
  getProtocolVersion () {
    const ret = wasm.metadata_getProtocolVersion(this.__wbg_ptr)
    return ret >>> 0
  }
}

const MismatchOwnerIdsErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_mismatchowneridserror_free(ptr >>> 0, 1))

export class MismatchOwnerIdsError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(MismatchOwnerIdsError.prototype)
    obj.__wbg_ptr = ptr
    MismatchOwnerIdsErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    MismatchOwnerIdsErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_mismatchowneridserror_free(ptr, 0)
  }

  /**
     * @param {any[]} documents
     */
  constructor (documents) {
    const ptr0 = passArrayJsValueToWasm0(documents, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.mismatchowneridserror_new(ptr0, len0)
    this.__wbg_ptr = ret >>> 0
    MismatchOwnerIdsErrorFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {any[]}
     */
  getDocuments () {
    const ret = wasm.mismatchowneridserror_getDocuments(this.__wbg_ptr)
    const v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
    return v1
  }
}

const MissingDataContractIdErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_missingdatacontractiderror_free(ptr >>> 0, 1))

export class MissingDataContractIdError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(MissingDataContractIdError.prototype)
    obj.__wbg_ptr = ptr
    MissingDataContractIdErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    MissingDataContractIdErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_missingdatacontractiderror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.missingdatacontractiderror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.missingdatacontractiderror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const MissingDefaultLocalizationErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_missingdefaultlocalizationerror_free(ptr >>> 0, 1))

export class MissingDefaultLocalizationError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(MissingDefaultLocalizationError.prototype)
    obj.__wbg_ptr = ptr
    MissingDefaultLocalizationErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    MissingDefaultLocalizationErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_missingdefaultlocalizationerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.missingdefaultlocalizationerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.missingdefaultlocalizationerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.missingdefaultlocalizationerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const MissingDocumentTransitionActionErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_missingdocumenttransitionactionerror_free(ptr >>> 0, 1))

export class MissingDocumentTransitionActionError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(MissingDocumentTransitionActionError.prototype)
    obj.__wbg_ptr = ptr
    MissingDocumentTransitionActionErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    MissingDocumentTransitionActionErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_missingdocumenttransitionactionerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.missingdocumenttransitionactionerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.missingdocumenttransitionactionerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const MissingDocumentTransitionTypeErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_missingdocumenttransitiontypeerror_free(ptr >>> 0, 1))

export class MissingDocumentTransitionTypeError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(MissingDocumentTransitionTypeError.prototype)
    obj.__wbg_ptr = ptr
    MissingDocumentTransitionTypeErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    MissingDocumentTransitionTypeErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_missingdocumenttransitiontypeerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.missingdocumenttransitiontypeerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.missingdocumenttransitiontypeerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const MissingDocumentTypeErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_missingdocumenttypeerror_free(ptr >>> 0, 1))

export class MissingDocumentTypeError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(MissingDocumentTypeError.prototype)
    obj.__wbg_ptr = ptr
    MissingDocumentTypeErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    MissingDocumentTypeErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_missingdocumenttypeerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.missingdocumenttypeerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.missingdocumenttypeerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const MissingIdentityPublicKeyIdsErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_missingidentitypublickeyidserror_free(ptr >>> 0, 1))

export class MissingIdentityPublicKeyIdsError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(MissingIdentityPublicKeyIdsError.prototype)
    obj.__wbg_ptr = ptr
    MissingIdentityPublicKeyIdsErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    MissingIdentityPublicKeyIdsErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_missingidentitypublickeyidserror_free(ptr, 0)
  }

  /**
     * @returns {Array<any>}
     */
  getDuplicatedIds () {
    const ret = wasm.missingidentitypublickeyidserror_getDuplicatedIds(this.__wbg_ptr)
    return ret
  }
}

const MissingMasterPublicKeyErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_missingmasterpublickeyerror_free(ptr >>> 0, 1))

export class MissingMasterPublicKeyError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(MissingMasterPublicKeyError.prototype)
    obj.__wbg_ptr = ptr
    MissingMasterPublicKeyErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    MissingMasterPublicKeyErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_missingmasterpublickeyerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.missingmasterpublickeyerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.missingmasterpublickeyerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const MissingPositionsInDocumentTypePropertiesErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_missingpositionsindocumenttypepropertieserror_free(ptr >>> 0, 1))

export class MissingPositionsInDocumentTypePropertiesError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(MissingPositionsInDocumentTypePropertiesError.prototype)
    obj.__wbg_ptr = ptr
    MissingPositionsInDocumentTypePropertiesErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    MissingPositionsInDocumentTypePropertiesErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_missingpositionsindocumenttypepropertieserror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.missingpositionsindocumenttypepropertieserror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.missingpositionsindocumenttypepropertieserror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.missingpositionsindocumenttypepropertieserror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const MissingPublicKeyErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_missingpublickeyerror_free(ptr >>> 0, 1))

export class MissingPublicKeyError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(MissingPublicKeyError.prototype)
    obj.__wbg_ptr = ptr
    MissingPublicKeyErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    MissingPublicKeyErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_missingpublickeyerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getPublicKeyId () {
    const ret = wasm.invaliddatacontractversionerror_getExpectedVersion(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.missingpublickeyerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.missingpublickeyerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const MissingStateTransitionTypeErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_missingstatetransitiontypeerror_free(ptr >>> 0, 1))

export class MissingStateTransitionTypeError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(MissingStateTransitionTypeError.prototype)
    obj.__wbg_ptr = ptr
    MissingStateTransitionTypeErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    MissingStateTransitionTypeErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_missingstatetransitiontypeerror_free(ptr, 0)
  }

  constructor () {
    const ret = wasm.missingstatetransitiontypeerror_new()
    this.__wbg_ptr = ret >>> 0
    MissingStateTransitionTypeErrorFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.missingstatetransitiontypeerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.missingstatetransitiontypeerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const MissingTransferKeyErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_missingtransferkeyerror_free(ptr >>> 0, 1))

export class MissingTransferKeyError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(MissingTransferKeyError.prototype)
    obj.__wbg_ptr = ptr
    MissingTransferKeyErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    MissingTransferKeyErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_missingtransferkeyerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.missingtransferkeyerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.missingtransferkeyerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.missingtransferkeyerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const ModificationOfGroupActionMainParametersNotPermittedErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_modificationofgroupactionmainparametersnotpermittederror_free(ptr >>> 0, 1))

export class ModificationOfGroupActionMainParametersNotPermittedError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(ModificationOfGroupActionMainParametersNotPermittedError.prototype)
    obj.__wbg_ptr = ptr
    ModificationOfGroupActionMainParametersNotPermittedErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    ModificationOfGroupActionMainParametersNotPermittedErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_modificationofgroupactionmainparametersnotpermittederror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.modificationofgroupactionmainparametersnotpermittederror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.modificationofgroupactionmainparametersnotpermittederror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.modificationofgroupactionmainparametersnotpermittederror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const NewAuthorizedActionTakerGroupDoesNotExistErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_newauthorizedactiontakergroupdoesnotexisterror_free(ptr >>> 0, 1))

export class NewAuthorizedActionTakerGroupDoesNotExistError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(NewAuthorizedActionTakerGroupDoesNotExistError.prototype)
    obj.__wbg_ptr = ptr
    NewAuthorizedActionTakerGroupDoesNotExistErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    NewAuthorizedActionTakerGroupDoesNotExistErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_newauthorizedactiontakergroupdoesnotexisterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.newauthorizedactiontakergroupdoesnotexisterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.newauthorizedactiontakergroupdoesnotexisterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.newauthorizedactiontakergroupdoesnotexisterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const NewAuthorizedActionTakerIdentityDoesNotExistErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_newauthorizedactiontakeridentitydoesnotexisterror_free(ptr >>> 0, 1))

export class NewAuthorizedActionTakerIdentityDoesNotExistError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(NewAuthorizedActionTakerIdentityDoesNotExistError.prototype)
    obj.__wbg_ptr = ptr
    NewAuthorizedActionTakerIdentityDoesNotExistErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    NewAuthorizedActionTakerIdentityDoesNotExistErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_newauthorizedactiontakeridentitydoesnotexisterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.newauthorizedactiontakeridentitydoesnotexisterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.newauthorizedactiontakeridentitydoesnotexisterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.newauthorizedactiontakeridentitydoesnotexisterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const NewAuthorizedActionTakerMainGroupNotSetErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_newauthorizedactiontakermaingroupnotseterror_free(ptr >>> 0, 1))

export class NewAuthorizedActionTakerMainGroupNotSetError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(NewAuthorizedActionTakerMainGroupNotSetError.prototype)
    obj.__wbg_ptr = ptr
    NewAuthorizedActionTakerMainGroupNotSetErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    NewAuthorizedActionTakerMainGroupNotSetErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_newauthorizedactiontakermaingroupnotseterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.newauthorizedactiontakermaingroupnotseterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.newauthorizedactiontakermaingroupnotseterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.newauthorizedactiontakermaingroupnotseterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const NewTokensDestinationIdentityDoesNotExistErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_newtokensdestinationidentitydoesnotexisterror_free(ptr >>> 0, 1))

export class NewTokensDestinationIdentityDoesNotExistError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(NewTokensDestinationIdentityDoesNotExistError.prototype)
    obj.__wbg_ptr = ptr
    NewTokensDestinationIdentityDoesNotExistErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    NewTokensDestinationIdentityDoesNotExistErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_newtokensdestinationidentitydoesnotexisterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.newtokensdestinationidentitydoesnotexisterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.newtokensdestinationidentitydoesnotexisterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.newtokensdestinationidentitydoesnotexisterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const NewTokensDestinationIdentityOptionRequiredErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_newtokensdestinationidentityoptionrequirederror_free(ptr >>> 0, 1))

export class NewTokensDestinationIdentityOptionRequiredError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(NewTokensDestinationIdentityOptionRequiredError.prototype)
    obj.__wbg_ptr = ptr
    NewTokensDestinationIdentityOptionRequiredErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    NewTokensDestinationIdentityOptionRequiredErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_newtokensdestinationidentityoptionrequirederror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.newtokensdestinationidentityoptionrequirederror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.newtokensdestinationidentityoptionrequirederror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.newtokensdestinationidentityoptionrequirederror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const NoDocumentsSuppliedErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_nodocumentssuppliederror_free(ptr >>> 0, 1))

export class NoDocumentsSuppliedError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(NoDocumentsSuppliedError.prototype)
    obj.__wbg_ptr = ptr
    NoDocumentsSuppliedErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    NoDocumentsSuppliedErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_nodocumentssuppliederror_free(ptr, 0)
  }

  constructor () {
    const ret = wasm.nodocumentssuppliederror_new()
    this.__wbg_ptr = ret >>> 0
    NoDocumentsSuppliedErrorFinalization.register(this, this.__wbg_ptr, this)
    return this
  }
}

const NoTransferKeyForCoreWithdrawalAvailableErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_notransferkeyforcorewithdrawalavailableerror_free(ptr >>> 0, 1))

export class NoTransferKeyForCoreWithdrawalAvailableError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(NoTransferKeyForCoreWithdrawalAvailableError.prototype)
    obj.__wbg_ptr = ptr
    NoTransferKeyForCoreWithdrawalAvailableErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    NoTransferKeyForCoreWithdrawalAvailableErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_notransferkeyforcorewithdrawalavailableerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.notransferkeyforcorewithdrawalavailableerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.notransferkeyforcorewithdrawalavailableerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.notransferkeyforcorewithdrawalavailableerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const NonConsensusErrorWasmFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_nonconsensuserrorwasm_free(ptr >>> 0, 1))

export class NonConsensusErrorWasm {
  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    NonConsensusErrorWasmFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_nonconsensuserrorwasm_free(ptr, 0)
  }
}

const NonContiguousContractGroupPositionsErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_noncontiguouscontractgrouppositionserror_free(ptr >>> 0, 1))

export class NonContiguousContractGroupPositionsError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(NonContiguousContractGroupPositionsError.prototype)
    obj.__wbg_ptr = ptr
    NonContiguousContractGroupPositionsErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    NonContiguousContractGroupPositionsErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_noncontiguouscontractgrouppositionserror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.noncontiguouscontractgrouppositionserror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.noncontiguouscontractgrouppositionserror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.noncontiguouscontractgrouppositionserror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const NonContiguousContractTokenPositionsErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_noncontiguouscontracttokenpositionserror_free(ptr >>> 0, 1))

export class NonContiguousContractTokenPositionsError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(NonContiguousContractTokenPositionsError.prototype)
    obj.__wbg_ptr = ptr
    NonContiguousContractTokenPositionsErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    NonContiguousContractTokenPositionsErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_noncontiguouscontracttokenpositionserror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.noncontiguouscontracttokenpositionserror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.noncontiguouscontracttokenpositionserror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.noncontiguouscontracttokenpositionserror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const NotImplementedIdentityCreditWithdrawalTransitionPoolingErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_notimplementedidentitycreditwithdrawaltransitionpoolingerror_free(ptr >>> 0, 1))

export class NotImplementedIdentityCreditWithdrawalTransitionPoolingError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(NotImplementedIdentityCreditWithdrawalTransitionPoolingError.prototype)
    obj.__wbg_ptr = ptr
    NotImplementedIdentityCreditWithdrawalTransitionPoolingErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    NotImplementedIdentityCreditWithdrawalTransitionPoolingErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_notimplementedidentitycreditwithdrawaltransitionpoolingerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getPooling () {
    const ret = wasm.notimplementedidentitycreditwithdrawaltransitionpoolingerror_getPooling(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.notimplementedidentitycreditwithdrawaltransitionpoolingerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.notimplementedidentitycreditwithdrawaltransitionpoolingerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const OverflowErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_overflowerror_free(ptr >>> 0, 1))

export class OverflowError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(OverflowError.prototype)
    obj.__wbg_ptr = ptr
    OverflowErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    OverflowErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_overflowerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.overflowerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.overflowerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.overflowerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const PlatformValueErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_platformvalueerror_free(ptr >>> 0, 1))

export class PlatformValueError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(PlatformValueError.prototype)
    obj.__wbg_ptr = ptr
    PlatformValueErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  toJSON () {
    return {
    }
  }

  toString () {
    return JSON.stringify(this)
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    PlatformValueErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_platformvalueerror_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getMessage () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.platformvalueerror_getMessage(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  toString () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.platformvalueerror_toString(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  valueOf () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.platformvalueerror_valueOf(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const PreProgrammedDistributionTimestampInPastErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_preprogrammeddistributiontimestampinpasterror_free(ptr >>> 0, 1))

export class PreProgrammedDistributionTimestampInPastError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(PreProgrammedDistributionTimestampInPastError.prototype)
    obj.__wbg_ptr = ptr
    PreProgrammedDistributionTimestampInPastErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    PreProgrammedDistributionTimestampInPastErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_preprogrammeddistributiontimestampinpasterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.preprogrammeddistributiontimestampinpasterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.preprogrammeddistributiontimestampinpasterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.preprogrammeddistributiontimestampinpasterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const PrefundedSpecializedBalanceInsufficientErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_prefundedspecializedbalanceinsufficienterror_free(ptr >>> 0, 1))

export class PrefundedSpecializedBalanceInsufficientError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(PrefundedSpecializedBalanceInsufficientError.prototype)
    obj.__wbg_ptr = ptr
    PrefundedSpecializedBalanceInsufficientErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    PrefundedSpecializedBalanceInsufficientErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_prefundedspecializedbalanceinsufficienterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.prefundedspecializedbalanceinsufficienterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.prefundedspecializedbalanceinsufficienterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.prefundedspecializedbalanceinsufficienterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const PrefundedSpecializedBalanceNotFoundErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_prefundedspecializedbalancenotfounderror_free(ptr >>> 0, 1))

export class PrefundedSpecializedBalanceNotFoundError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(PrefundedSpecializedBalanceNotFoundError.prototype)
    obj.__wbg_ptr = ptr
    PrefundedSpecializedBalanceNotFoundErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    PrefundedSpecializedBalanceNotFoundErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_prefundedspecializedbalancenotfounderror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.prefundedspecializedbalancenotfounderror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.prefundedspecializedbalancenotfounderror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.prefundedspecializedbalancenotfounderror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const ProtocolVersionParsingErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_protocolversionparsingerror_free(ptr >>> 0, 1))

export class ProtocolVersionParsingError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(ProtocolVersionParsingError.prototype)
    obj.__wbg_ptr = ptr
    ProtocolVersionParsingErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    ProtocolVersionParsingErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_protocolversionparsingerror_free(ptr, 0)
  }

  /**
     * @param {string} parsing_error
     */
  constructor (parsing_error) {
    const ptr0 = passStringToWasm0(parsing_error, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.protocolversionparsingerror_new(ptr0, len0)
    this.__wbg_ptr = ret >>> 0
    ProtocolVersionParsingErrorFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {string}
     */
  getParsingError () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.protocolversionparsingerror_getParsingError(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.protocolversionparsingerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.protocolversionparsingerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.protocolversionparsingerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const PublicKeyIsDisabledErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_publickeyisdisablederror_free(ptr >>> 0, 1))

export class PublicKeyIsDisabledError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(PublicKeyIsDisabledError.prototype)
    obj.__wbg_ptr = ptr
    PublicKeyIsDisabledErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    PublicKeyIsDisabledErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_publickeyisdisablederror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getPublicKeyId () {
    const ret = wasm.identitypublickeyisdisablederror_getPublicKeyIndex(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.publickeyisdisablederror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.publickeyisdisablederror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const PublicKeySecurityLevelNotMetErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_publickeysecuritylevelnotmeterror_free(ptr >>> 0, 1))

export class PublicKeySecurityLevelNotMetError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(PublicKeySecurityLevelNotMetError.prototype)
    obj.__wbg_ptr = ptr
    PublicKeySecurityLevelNotMetErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    PublicKeySecurityLevelNotMetErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_publickeysecuritylevelnotmeterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getPublicKeySecurityLevel () {
    const ret = wasm.publickeysecuritylevelnotmeterror_getPublicKeySecurityLevel(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getKeySecurityLevelRequirement () {
    const ret = wasm.publickeysecuritylevelnotmeterror_getKeySecurityLevelRequirement(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.publickeysecuritylevelnotmeterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.publickeysecuritylevelnotmeterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const RecipientIdentityDoesNotExistErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_recipientidentitydoesnotexisterror_free(ptr >>> 0, 1))

export class RecipientIdentityDoesNotExistError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(RecipientIdentityDoesNotExistError.prototype)
    obj.__wbg_ptr = ptr
    RecipientIdentityDoesNotExistErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    RecipientIdentityDoesNotExistErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_recipientidentitydoesnotexisterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.recipientidentitydoesnotexisterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.recipientidentitydoesnotexisterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.recipientidentitydoesnotexisterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const RedundantDocumentPaidForByTokenWithContractIdFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_redundantdocumentpaidforbytokenwithcontractid_free(ptr >>> 0, 1))

export class RedundantDocumentPaidForByTokenWithContractId {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(RedundantDocumentPaidForByTokenWithContractId.prototype)
    obj.__wbg_ptr = ptr
    RedundantDocumentPaidForByTokenWithContractIdFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    RedundantDocumentPaidForByTokenWithContractIdFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_redundantdocumentpaidforbytokenwithcontractid_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.redundantdocumentpaidforbytokenwithcontractid_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.redundantdocumentpaidforbytokenwithcontractid_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.redundantdocumentpaidforbytokenwithcontractid_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const RequiredTokenPaymentInfoNotSetErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_requiredtokenpaymentinfonotseterror_free(ptr >>> 0, 1))

export class RequiredTokenPaymentInfoNotSetError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(RequiredTokenPaymentInfoNotSetError.prototype)
    obj.__wbg_ptr = ptr
    RequiredTokenPaymentInfoNotSetErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    RequiredTokenPaymentInfoNotSetErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_requiredtokenpaymentinfonotseterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.requiredtokenpaymentinfonotseterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.requiredtokenpaymentinfonotseterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.requiredtokenpaymentinfonotseterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const RevisionAbsentErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_revisionabsenterror_free(ptr >>> 0, 1))

export class RevisionAbsentError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(RevisionAbsentError.prototype)
    obj.__wbg_ptr = ptr
    RevisionAbsentErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    RevisionAbsentErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_revisionabsenterror_free(ptr, 0)
  }

  /**
     * @param {Document} document
     */
  constructor (document) {
    _assertClass(document, Document)
    const ptr0 = document.__destroy_into_raw()
    const ret = wasm.invalidinitialrevisionerror_new(ptr0)
    this.__wbg_ptr = ret >>> 0
    RevisionAbsentErrorFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * @returns {Document}
     */
  getDocument () {
    const ret = wasm.revisionabsenterror_getDocument(this.__wbg_ptr)
    return Document.__wrap(ret)
  }
}

const SerializedObjectParsingErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_serializedobjectparsingerror_free(ptr >>> 0, 1))

export class SerializedObjectParsingError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(SerializedObjectParsingError.prototype)
    obj.__wbg_ptr = ptr
    SerializedObjectParsingErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    SerializedObjectParsingErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_serializedobjectparsingerror_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getParsingError () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.serializedobjectparsingerror_getParsingError(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.serializedobjectparsingerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.serializedobjectparsingerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const SignatureShouldNotBePresentErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_signatureshouldnotbepresenterror_free(ptr >>> 0, 1))

export class SignatureShouldNotBePresentError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(SignatureShouldNotBePresentError.prototype)
    obj.__wbg_ptr = ptr
    SignatureShouldNotBePresentErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    SignatureShouldNotBePresentErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_signatureshouldnotbepresenterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.signatureshouldnotbepresenterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.signatureshouldnotbepresenterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const SingleDocumentDriveQueryWasmFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_singledocumentdrivequerywasm_free(ptr >>> 0, 1))
/**
 * WASM wrapper for SingleDocumentDriveQuery
 */
export class SingleDocumentDriveQueryWasm {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(SingleDocumentDriveQueryWasm.prototype)
    obj.__wbg_ptr = ptr
    SingleDocumentDriveQueryWasmFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    SingleDocumentDriveQueryWasmFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_singledocumentdrivequerywasm_free(ptr, 0)
  }

  /**
     * Create a new SingleDocumentDriveQuery
     * @param {Uint8Array} contract_id
     * @param {string} document_type_name
     * @param {boolean} document_type_keeps_history
     * @param {Uint8Array} document_id
     * @param {number | null | undefined} block_time_ms
     * @param {number} contested_status
     */
  constructor (contract_id, document_type_name, document_type_keeps_history, document_id, block_time_ms, contested_status) {
    const ptr0 = passArray8ToWasm0(contract_id, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ptr1 = passStringToWasm0(document_type_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len1 = WASM_VECTOR_LEN
    const ptr2 = passArray8ToWasm0(document_id, wasm.__wbindgen_malloc)
    const len2 = WASM_VECTOR_LEN
    const ret = wasm.singledocumentdrivequerywasm_new(ptr0, len0, ptr1, len1, document_type_keeps_history, ptr2, len2, !isLikeNone(block_time_ms), isLikeNone(block_time_ms) ? 0 : block_time_ms, contested_status)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    this.__wbg_ptr = ret[0] >>> 0
    SingleDocumentDriveQueryWasmFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * Get the contract ID
     * @returns {Uint8Array}
     */
  get contractId () {
    const ret = wasm.singledocumentdrivequerywasm_contractId(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * Get the document type name
     * @returns {string}
     */
  get documentTypeName () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.singledocumentdrivequerywasm_documentTypeName(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * Get whether the document type keeps history
     * @returns {boolean}
     */
  get documentTypeKeepsHistory () {
    const ret = wasm.singledocumentdrivequerywasm_documentTypeKeepsHistory(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * Get the document ID
     * @returns {Uint8Array}
     */
  get documentId () {
    const ret = wasm.singledocumentdrivequerywasm_documentId(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * Get the block time in milliseconds
     * @returns {number | undefined}
     */
  get blockTimeMs () {
    const ret = wasm.singledocumentdrivequerywasm_blockTimeMs(this.__wbg_ptr)
    return ret[0] === 0 ? undefined : ret[1]
  }

  /**
     * Get the contested status
     * @returns {number}
     */
  get contestedStatus () {
    const ret = wasm.singledocumentdrivequerywasm_contestedStatus(this.__wbg_ptr)
    return ret
  }
}

const SingleDocumentProofResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_singledocumentproofresult_free(ptr >>> 0, 1))
/**
 * Result of a single document proof verification
 */
export class SingleDocumentProofResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(SingleDocumentProofResult.prototype)
    obj.__wbg_ptr = ptr
    SingleDocumentProofResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    SingleDocumentProofResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_singledocumentproofresult_free(ptr, 0)
  }

  /**
     * Get the root hash
     * @returns {Uint8Array}
     */
  get rootHash () {
    const ret = wasm.singledocumentproofresult_rootHash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * Get the serialized document (if found)
     * @returns {Uint8Array | undefined}
     */
  get documentSerialized () {
    const ret = wasm.singledocumentproofresult_documentSerialized(this.__wbg_ptr)
    let v1
    if (ret[0] !== 0) {
      v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    }
    return v1
  }

  /**
     * Check if a document was found
     * @returns {boolean}
     */
  hasDocument () {
    const ret = wasm.singledocumentproofresult_hasDocument(this.__wbg_ptr)
    return ret !== 0
  }
}

const StateTransitionFactoryFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_statetransitionfactory_free(ptr >>> 0, 1))

export class StateTransitionFactory {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(StateTransitionFactory.prototype)
    obj.__wbg_ptr = ptr
    StateTransitionFactoryFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    StateTransitionFactoryFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_statetransitionfactory_free(ptr, 0)
  }

  /**
     * @param {Uint8Array} buffer
     * @param {any} _options
     * @returns {Promise<any>}
     */
  createFromBuffer (buffer, _options) {
    const ptr0 = passArray8ToWasm0(buffer, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.statetransitionfactory_createFromBuffer(this.__wbg_ptr, ptr0, len0, _options)
    return ret
  }
}

const StateTransitionIsNotActiveErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_statetransitionisnotactiveerror_free(ptr >>> 0, 1))

export class StateTransitionIsNotActiveError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(StateTransitionIsNotActiveError.prototype)
    obj.__wbg_ptr = ptr
    StateTransitionIsNotActiveErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    StateTransitionIsNotActiveErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_statetransitionisnotactiveerror_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getStateTransitionType () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.statetransitionisnotactiveerror_getStateTransitionType(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getActiveVersionRangeStart () {
    const ret = wasm.statetransitionisnotactiveerror_getActiveVersionRangeStart(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {number}
     */
  getActiveVersionRangeEnd () {
    const ret = wasm.statetransitionisnotactiveerror_getActiveVersionRangeEnd(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {number}
     */
  getCurrentProtocolVersion () {
    const ret = wasm.statetransitionisnotactiveerror_getCurrentProtocolVersion(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {any}
     */
  toObject () {
    const ret = wasm.statetransitionisnotactiveerror_toObject(this.__wbg_ptr)
    return ret
  }
}

const StateTransitionMaxSizeExceededErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_statetransitionmaxsizeexceedederror_free(ptr >>> 0, 1))

export class StateTransitionMaxSizeExceededError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(StateTransitionMaxSizeExceededError.prototype)
    obj.__wbg_ptr = ptr
    StateTransitionMaxSizeExceededErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    StateTransitionMaxSizeExceededErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_statetransitionmaxsizeexceedederror_free(ptr, 0)
  }

  /**
     * @returns {bigint}
     */
  getActualSizeBytes () {
    const ret = wasm.statetransitionmaxsizeexceedederror_getActualSizeBytes(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @returns {bigint}
     */
  getMaxSizeBytes () {
    const ret = wasm.statetransitionmaxsizeexceedederror_getMaxSizeBytes(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.statetransitionmaxsizeexceedederror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.statetransitionmaxsizeexceedederror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const SystemPropertyIndexAlreadyPresentErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_systempropertyindexalreadypresenterror_free(ptr >>> 0, 1))

export class SystemPropertyIndexAlreadyPresentError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(SystemPropertyIndexAlreadyPresentError.prototype)
    obj.__wbg_ptr = ptr
    SystemPropertyIndexAlreadyPresentErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    SystemPropertyIndexAlreadyPresentErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_systempropertyindexalreadypresenterror_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getDocumentType () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.systempropertyindexalreadypresenterror_getDocumentType(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  getIndexName () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.systempropertyindexalreadypresenterror_getIndexName(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  getPropertyName () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.systempropertyindexalreadypresenterror_getPropertyName(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.systempropertyindexalreadypresenterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.systempropertyindexalreadypresenterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const TokenAlreadyPausedErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokenalreadypausederror_free(ptr >>> 0, 1))

export class TokenAlreadyPausedError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenAlreadyPausedError.prototype)
    obj.__wbg_ptr = ptr
    TokenAlreadyPausedErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenAlreadyPausedErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokenalreadypausederror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.tokenalreadypausederror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.tokenalreadypausederror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.tokenalreadypausederror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const TokenAmountUnderMinimumSaleAmountFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokenamountunderminimumsaleamount_free(ptr >>> 0, 1))

export class TokenAmountUnderMinimumSaleAmount {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenAmountUnderMinimumSaleAmount.prototype)
    obj.__wbg_ptr = ptr
    TokenAmountUnderMinimumSaleAmountFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenAmountUnderMinimumSaleAmountFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokenamountunderminimumsaleamount_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.tokenamountunderminimumsaleamount_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.tokenamountunderminimumsaleamount_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.tokenamountunderminimumsaleamount_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const TokenBurnTransitionFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokenburntransition_free(ptr >>> 0, 1))

export class TokenBurnTransition {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenBurnTransition.prototype)
    obj.__wbg_ptr = ptr
    TokenBurnTransitionFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenBurnTransitionFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokenburntransition_free(ptr, 0)
  }

  /**
     * @returns {string | undefined}
     */
  getPublicNote () {
    const ret = wasm.tokenburntransition_getPublicNote(this.__wbg_ptr)
    let v1
    if (ret[0] !== 0) {
      v1 = getStringFromWasm0(ret[0], ret[1]).slice()
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    }
    return v1
  }

  /**
     * @returns {bigint}
     */
  getBurnAmount () {
    const ret = wasm.tokenburntransition_getBurnAmount(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }
}

const TokenClaimTransitionFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokenclaimtransition_free(ptr >>> 0, 1))

export class TokenClaimTransition {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenClaimTransition.prototype)
    obj.__wbg_ptr = ptr
    TokenClaimTransitionFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenClaimTransitionFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokenclaimtransition_free(ptr, 0)
  }

  /**
     * @returns {string | undefined}
     */
  getPublicNote () {
    const ret = wasm.tokenclaimtransition_getPublicNote(this.__wbg_ptr)
    let v1
    if (ret[0] !== 0) {
      v1 = getStringFromWasm0(ret[0], ret[1]).slice()
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    }
    return v1
  }

  /**
     * @returns {number}
     */
  getDistributionType () {
    const ret = wasm.tokenclaimtransition_getDistributionType(this.__wbg_ptr)
    return ret
  }
}

const TokenConfigUpdateTransitionFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokenconfigupdatetransition_free(ptr >>> 0, 1))

export class TokenConfigUpdateTransition {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenConfigUpdateTransition.prototype)
    obj.__wbg_ptr = ptr
    TokenConfigUpdateTransitionFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenConfigUpdateTransitionFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokenconfigupdatetransition_free(ptr, 0)
  }

  /**
     * @returns {string | undefined}
     */
  getPublicNote () {
    const ret = wasm.tokenconfigupdatetransition_getPublicNote(this.__wbg_ptr)
    let v1
    if (ret[0] !== 0) {
      v1 = getStringFromWasm0(ret[0], ret[1]).slice()
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    }
    return v1
  }
}

const TokenConfigurationFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokenconfiguration_free(ptr >>> 0, 1))

export class TokenConfiguration {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenConfiguration.prototype)
    obj.__wbg_ptr = ptr
    TokenConfigurationFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenConfigurationFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokenconfiguration_free(ptr, 0)
  }

  /**
     * @returns {TokenKeepsHistoryRules}
     */
  keepsHistory () {
    const ret = wasm.tokenconfiguration_keepsHistory(this.__wbg_ptr)
    return TokenKeepsHistoryRules.__wrap(ret)
  }
}

const TokenDestroyFrozenFundsTransitionFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokendestroyfrozenfundstransition_free(ptr >>> 0, 1))

export class TokenDestroyFrozenFundsTransition {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenDestroyFrozenFundsTransition.prototype)
    obj.__wbg_ptr = ptr
    TokenDestroyFrozenFundsTransitionFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenDestroyFrozenFundsTransitionFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokendestroyfrozenfundstransition_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getFrozenIdentityId () {
    const ret = wasm.tokendestroyfrozenfundstransition_getFrozenIdentityId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {string | undefined}
     */
  getPublicNote () {
    const ret = wasm.tokendestroyfrozenfundstransition_getPublicNote(this.__wbg_ptr)
    let v1
    if (ret[0] !== 0) {
      v1 = getStringFromWasm0(ret[0], ret[1]).slice()
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    }
    return v1
  }
}

const TokenDirectPurchaseTransitionFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokendirectpurchasetransition_free(ptr >>> 0, 1))

export class TokenDirectPurchaseTransition {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenDirectPurchaseTransition.prototype)
    obj.__wbg_ptr = ptr
    TokenDirectPurchaseTransitionFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenDirectPurchaseTransitionFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokendirectpurchasetransition_free(ptr, 0)
  }

  /**
     * @returns {bigint}
     */
  getTokenCount () {
    const ret = wasm.invalididentitycredittransferamounterror_getAmount(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @returns {bigint}
     */
  getTotalAgreedPrice () {
    const ret = wasm.invalididentitycredittransferamounterror_getMinAmount(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }
}

const TokenDirectPurchaseUserPriceTooLowFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokendirectpurchaseuserpricetoolow_free(ptr >>> 0, 1))

export class TokenDirectPurchaseUserPriceTooLow {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenDirectPurchaseUserPriceTooLow.prototype)
    obj.__wbg_ptr = ptr
    TokenDirectPurchaseUserPriceTooLowFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenDirectPurchaseUserPriceTooLowFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokendirectpurchaseuserpricetoolow_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.tokendirectpurchaseuserpricetoolow_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.tokendirectpurchaseuserpricetoolow_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.tokendirectpurchaseuserpricetoolow_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const TokenEmergencyActionTransitionFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokenemergencyactiontransition_free(ptr >>> 0, 1))

export class TokenEmergencyActionTransition {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenEmergencyActionTransition.prototype)
    obj.__wbg_ptr = ptr
    TokenEmergencyActionTransitionFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenEmergencyActionTransitionFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokenemergencyactiontransition_free(ptr, 0)
  }

  /**
     * @returns {string | undefined}
     */
  getPublicNote () {
    const ret = wasm.tokenemergencyactiontransition_getPublicNote(this.__wbg_ptr)
    let v1
    if (ret[0] !== 0) {
      v1 = getStringFromWasm0(ret[0], ret[1]).slice()
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    }
    return v1
  }

  /**
     * @returns {number}
     */
  getEmergencyAction () {
    const ret = wasm.tokenemergencyactiontransition_getEmergencyAction(this.__wbg_ptr)
    return ret
  }
}

const TokenFreezeTransitionFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokenfreezetransition_free(ptr >>> 0, 1))

export class TokenFreezeTransition {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenFreezeTransition.prototype)
    obj.__wbg_ptr = ptr
    TokenFreezeTransitionFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenFreezeTransitionFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokenfreezetransition_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getFrozenIdentityId () {
    const ret = wasm.tokenfreezetransition_getFrozenIdentityId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {string | undefined}
     */
  getPublicNote () {
    const ret = wasm.tokenfreezetransition_getPublicNote(this.__wbg_ptr)
    let v1
    if (ret[0] !== 0) {
      v1 = getStringFromWasm0(ret[0], ret[1]).slice()
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    }
    return v1
  }
}

const TokenIsPausedErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokenispausederror_free(ptr >>> 0, 1))

export class TokenIsPausedError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenIsPausedError.prototype)
    obj.__wbg_ptr = ptr
    TokenIsPausedErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenIsPausedErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokenispausederror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.tokenispausederror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.tokenispausederror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.tokenispausederror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const TokenKeepsHistoryRulesFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokenkeepshistoryrules_free(ptr >>> 0, 1))

export class TokenKeepsHistoryRules {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenKeepsHistoryRules.prototype)
    obj.__wbg_ptr = ptr
    TokenKeepsHistoryRulesFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenKeepsHistoryRulesFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokenkeepshistoryrules_free(ptr, 0)
  }

  /**
     * Whether transfer history is recorded.
     * @returns {boolean}
     */
  keepsTransferHistory () {
    const ret = wasm.tokenkeepshistoryrules_keepsTransferHistory(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * Whether freezing history is recorded.
     * @returns {boolean}
     */
  keepsFreezingHistory () {
    const ret = wasm.tokenkeepshistoryrules_keepsFreezingHistory(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * Whether minting history is recorded.
     * @returns {boolean}
     */
  keepsMintingHistory () {
    const ret = wasm.tokenkeepshistoryrules_keepsMintingHistory(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * Whether burning history is recorded.
     * @returns {boolean}
     */
  keepsBurningHistory () {
    const ret = wasm.tokenkeepshistoryrules_keepsBurningHistory(this.__wbg_ptr)
    return ret !== 0
  }
}

const TokenMintPastMaxSupplyErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokenmintpastmaxsupplyerror_free(ptr >>> 0, 1))

export class TokenMintPastMaxSupplyError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenMintPastMaxSupplyError.prototype)
    obj.__wbg_ptr = ptr
    TokenMintPastMaxSupplyErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenMintPastMaxSupplyErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokenmintpastmaxsupplyerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.tokenmintpastmaxsupplyerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.tokenmintpastmaxsupplyerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.tokenmintpastmaxsupplyerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const TokenMintTransitionFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokenminttransition_free(ptr >>> 0, 1))

export class TokenMintTransition {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenMintTransition.prototype)
    obj.__wbg_ptr = ptr
    TokenMintTransitionFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenMintTransitionFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokenminttransition_free(ptr, 0)
  }

  /**
     * @param {TokenConfiguration} token_configuration
     * @returns {any}
     */
  getRecipientId (token_configuration) {
    _assertClass(token_configuration, TokenConfiguration)
    const ptr0 = token_configuration.__destroy_into_raw()
    const ret = wasm.tokenminttransition_getRecipientId(this.__wbg_ptr, ptr0)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }

  /**
     * @returns {any | undefined}
     */
  getIssuedToIdentityId () {
    const ret = wasm.tokenminttransition_getIssuedToIdentityId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {string | undefined}
     */
  getPublicNote () {
    const ret = wasm.tokenminttransition_getPublicNote(this.__wbg_ptr)
    let v1
    if (ret[0] !== 0) {
      v1 = getStringFromWasm0(ret[0], ret[1]).slice()
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    }
    return v1
  }

  /**
     * @returns {bigint}
     */
  getAmount () {
    const ret = wasm.tokenminttransition_getAmount(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }
}

const TokenNotForDirectSaleFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokennotfordirectsale_free(ptr >>> 0, 1))

export class TokenNotForDirectSale {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenNotForDirectSale.prototype)
    obj.__wbg_ptr = ptr
    TokenNotForDirectSaleFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenNotForDirectSaleFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokennotfordirectsale_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.tokennotfordirectsale_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.tokennotfordirectsale_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.tokennotfordirectsale_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const TokenNotPausedErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokennotpausederror_free(ptr >>> 0, 1))

export class TokenNotPausedError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenNotPausedError.prototype)
    obj.__wbg_ptr = ptr
    TokenNotPausedErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenNotPausedErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokennotpausederror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.tokennotpausederror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.tokennotpausederror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.tokennotpausederror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const TokenNoteOnlyAllowedWhenProposerErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokennoteonlyallowedwhenproposererror_free(ptr >>> 0, 1))

export class TokenNoteOnlyAllowedWhenProposerError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenNoteOnlyAllowedWhenProposerError.prototype)
    obj.__wbg_ptr = ptr
    TokenNoteOnlyAllowedWhenProposerErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenNoteOnlyAllowedWhenProposerErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokennoteonlyallowedwhenproposererror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.tokennoteonlyallowedwhenproposererror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.tokennoteonlyallowedwhenproposererror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.tokennoteonlyallowedwhenproposererror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const TokenPaymentByBurningOnlyAllowedOnInternalTokenErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokenpaymentbyburningonlyallowedoninternaltokenerror_free(ptr >>> 0, 1))

export class TokenPaymentByBurningOnlyAllowedOnInternalTokenError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenPaymentByBurningOnlyAllowedOnInternalTokenError.prototype)
    obj.__wbg_ptr = ptr
    TokenPaymentByBurningOnlyAllowedOnInternalTokenErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenPaymentByBurningOnlyAllowedOnInternalTokenErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokenpaymentbyburningonlyallowedoninternaltokenerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.tokenpaymentbyburningonlyallowedoninternaltokenerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.tokenpaymentbyburningonlyallowedoninternaltokenerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.tokenpaymentbyburningonlyallowedoninternaltokenerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const TokenSetPriceForDirectPurchaseTransitionFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokensetpricefordirectpurchasetransition_free(ptr >>> 0, 1))

export class TokenSetPriceForDirectPurchaseTransition {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenSetPriceForDirectPurchaseTransition.prototype)
    obj.__wbg_ptr = ptr
    TokenSetPriceForDirectPurchaseTransitionFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenSetPriceForDirectPurchaseTransitionFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokensetpricefordirectpurchasetransition_free(ptr, 0)
  }

  /**
     * @returns {string | undefined}
     */
  getPublicNote () {
    const ret = wasm.tokensetpricefordirectpurchasetransition_getPublicNote(this.__wbg_ptr)
    let v1
    if (ret[0] !== 0) {
      v1 = getStringFromWasm0(ret[0], ret[1]).slice()
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    }
    return v1
  }

  /**
     * @returns {bigint | undefined}
     */
  getPrice () {
    const ret = wasm.tokensetpricefordirectpurchasetransition_getPrice(this.__wbg_ptr)
    return ret[0] === 0 ? undefined : BigInt.asUintN(64, ret[1])
  }
}

const TokenSettingMaxSupplyToLessThanCurrentSupplyErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokensettingmaxsupplytolessthancurrentsupplyerror_free(ptr >>> 0, 1))

export class TokenSettingMaxSupplyToLessThanCurrentSupplyError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenSettingMaxSupplyToLessThanCurrentSupplyError.prototype)
    obj.__wbg_ptr = ptr
    TokenSettingMaxSupplyToLessThanCurrentSupplyErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenSettingMaxSupplyToLessThanCurrentSupplyErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokensettingmaxsupplytolessthancurrentsupplyerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.tokensettingmaxsupplytolessthancurrentsupplyerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.tokensettingmaxsupplytolessthancurrentsupplyerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.tokensettingmaxsupplytolessthancurrentsupplyerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const TokenTransferRecipientIdentityNotExistErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokentransferrecipientidentitynotexisterror_free(ptr >>> 0, 1))

export class TokenTransferRecipientIdentityNotExistError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenTransferRecipientIdentityNotExistError.prototype)
    obj.__wbg_ptr = ptr
    TokenTransferRecipientIdentityNotExistErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenTransferRecipientIdentityNotExistErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokentransferrecipientidentitynotexisterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.tokentransferrecipientidentitynotexisterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.tokentransferrecipientidentitynotexisterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.tokentransferrecipientidentitynotexisterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const TokenTransferToOurselfErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokentransfertoourselferror_free(ptr >>> 0, 1))

export class TokenTransferToOurselfError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenTransferToOurselfError.prototype)
    obj.__wbg_ptr = ptr
    TokenTransferToOurselfErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenTransferToOurselfErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokentransfertoourselferror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.tokentransfertoourselferror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.tokentransfertoourselferror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.tokentransfertoourselferror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const TokenTransferTransitionFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokentransfertransition_free(ptr >>> 0, 1))

export class TokenTransferTransition {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenTransferTransition.prototype)
    obj.__wbg_ptr = ptr
    TokenTransferTransitionFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenTransferTransitionFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokentransfertransition_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getRecipientId () {
    const ret = wasm.tokentransfertransition_getRecipientId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {string | undefined}
     */
  getPublicNote () {
    const ret = wasm.tokentransfertransition_getPublicNote(this.__wbg_ptr)
    let v1
    if (ret[0] !== 0) {
      v1 = getStringFromWasm0(ret[0], ret[1]).slice()
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    }
    return v1
  }

  /**
     * @returns {bigint}
     */
  getAmount () {
    const ret = wasm.tokentransfertransition_getAmount(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }
}

const TokenTransitionFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokentransition_free(ptr >>> 0, 1))

export class TokenTransition {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenTransition.prototype)
    obj.__wbg_ptr = ptr
    TokenTransitionFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenTransitionFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokentransition_free(ptr, 0)
  }

  /**
     * @returns {TokenTransitionType}
     */
  getTransitionType () {
    const ret = wasm.tokentransition_getTransitionType(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getTokenId () {
    const ret = wasm.tokentransition_getTokenId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getTokenContractPosition () {
    const ret = wasm.tokentransition_getTokenContractPosition(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getDataContractId () {
    const ret = wasm.tokentransition_getDataContractId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {string}
     */
  getHistoricalDocumentTypeName () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.tokentransition_getHistoricalDocumentTypeName(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @param {any} owner_id
     * @returns {any}
     */
  getHistoricalDocumentId (owner_id) {
    const ret = wasm.tokentransition_getHistoricalDocumentId(this.__wbg_ptr, owner_id)
    return ret
  }

  /**
     * @returns {bigint}
     */
  getIdentityContractNonce () {
    const ret = wasm.tokentransition_getIdentityContractNonce(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }

  /**
     * @returns {any}
     */
  toTransition () {
    const ret = wasm.tokentransition_toTransition(this.__wbg_ptr)
    return ret
  }
}

const TokenTransitionPathQueryResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokentransitionpathqueryresult_free(ptr >>> 0, 1))

export class TokenTransitionPathQueryResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenTransitionPathQueryResult.prototype)
    obj.__wbg_ptr = ptr
    TokenTransitionPathQueryResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenTransitionPathQueryResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokentransitionpathqueryresult_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  get path_query () {
    const ret = wasm.tokentransitionpathqueryresult_path_query(this.__wbg_ptr)
    return ret
  }
}

const TokenUnfreezeTransitionFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tokenunfreezetransition_free(ptr >>> 0, 1))

export class TokenUnfreezeTransition {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TokenUnfreezeTransition.prototype)
    obj.__wbg_ptr = ptr
    TokenUnfreezeTransitionFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TokenUnfreezeTransitionFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tokenunfreezetransition_free(ptr, 0)
  }

  /**
     * @returns {any}
     */
  getFrozenIdentityId () {
    const ret = wasm.tokenunfreezetransition_getFrozenIdentityId(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {string | undefined}
     */
  getPublicNote () {
    const ret = wasm.tokenunfreezetransition_getPublicNote(this.__wbg_ptr)
    let v1
    if (ret[0] !== 0) {
      v1 = getStringFromWasm0(ret[0], ret[1]).slice()
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    }
    return v1
  }
}

const TooManyKeywordsErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_toomanykeywordserror_free(ptr >>> 0, 1))

export class TooManyKeywordsError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TooManyKeywordsError.prototype)
    obj.__wbg_ptr = ptr
    TooManyKeywordsErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TooManyKeywordsErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_toomanykeywordserror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.toomanykeywordserror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.toomanykeywordserror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.toomanykeywordserror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const TooManyMasterPublicKeyErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_toomanymasterpublickeyerror_free(ptr >>> 0, 1))

export class TooManyMasterPublicKeyError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TooManyMasterPublicKeyError.prototype)
    obj.__wbg_ptr = ptr
    TooManyMasterPublicKeyErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TooManyMasterPublicKeyErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_toomanymasterpublickeyerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.toomanymasterpublickeyerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.toomanymasterpublickeyerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.toomanymasterpublickeyerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const TryingToDeleteImmutableDocumentErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tryingtodeleteimmutabledocumenterror_free(ptr >>> 0, 1))

export class TryingToDeleteImmutableDocumentError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TryingToDeleteImmutableDocumentError.prototype)
    obj.__wbg_ptr = ptr
    TryingToDeleteImmutableDocumentErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TryingToDeleteImmutableDocumentErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tryingtodeleteimmutabledocumenterror_free(ptr, 0)
  }

  /**
     * @param {Document} document
     */
  constructor (document) {
    _assertClass(document, Document)
    const ptr0 = document.__destroy_into_raw()
    const ret = wasm.documentnorevisionerror_new(ptr0)
    this.__wbg_ptr = ret >>> 0
    TryingToDeleteImmutableDocumentErrorFinalization.register(this, this.__wbg_ptr, this)
    return this
  }
}

const TryingToReplaceImmutableDocumentErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_tryingtoreplaceimmutabledocumenterror_free(ptr >>> 0, 1))

export class TryingToReplaceImmutableDocumentError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(TryingToReplaceImmutableDocumentError.prototype)
    obj.__wbg_ptr = ptr
    TryingToReplaceImmutableDocumentErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    TryingToReplaceImmutableDocumentErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_tryingtoreplaceimmutabledocumenterror_free(ptr, 0)
  }

  /**
     * @param {Document} document
     */
  constructor (document) {
    _assertClass(document, Document)
    const ptr0 = document.__destroy_into_raw()
    const ret = wasm.documentnorevisionerror_new(ptr0)
    this.__wbg_ptr = ret >>> 0
    TryingToReplaceImmutableDocumentErrorFinalization.register(this, this.__wbg_ptr, this)
    return this
  }
}

const UnauthorizedTokenActionErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_unauthorizedtokenactionerror_free(ptr >>> 0, 1))

export class UnauthorizedTokenActionError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(UnauthorizedTokenActionError.prototype)
    obj.__wbg_ptr = ptr
    UnauthorizedTokenActionErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    UnauthorizedTokenActionErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_unauthorizedtokenactionerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.unauthorizedtokenactionerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.unauthorizedtokenactionerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.unauthorizedtokenactionerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const UndefinedIndexPropertyErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_undefinedindexpropertyerror_free(ptr >>> 0, 1))

export class UndefinedIndexPropertyError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(UndefinedIndexPropertyError.prototype)
    obj.__wbg_ptr = ptr
    UndefinedIndexPropertyErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    UndefinedIndexPropertyErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_undefinedindexpropertyerror_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getDocumentType () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.undefinedindexpropertyerror_getDocumentType(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  getIndexName () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.undefinedindexpropertyerror_getIndexName(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {string}
     */
  getPropertyName () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.undefinedindexpropertyerror_getPropertyName(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.undefinedindexpropertyerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.undefinedindexpropertyerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const UniqueIndicesLimitReachedErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_uniqueindiceslimitreachederror_free(ptr >>> 0, 1))

export class UniqueIndicesLimitReachedError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(UniqueIndicesLimitReachedError.prototype)
    obj.__wbg_ptr = ptr
    UniqueIndicesLimitReachedErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    UniqueIndicesLimitReachedErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_uniqueindiceslimitreachederror_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getDocumentType () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.uniqueindiceslimitreachederror_getDocumentType(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getIndexLimit () {
    const ret = wasm.uniqueindiceslimitreachederror_getIndexLimit(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.uniqueindiceslimitreachederror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.uniqueindiceslimitreachederror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const UnknownAssetLockProofTypeErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_unknownassetlockprooftypeerror_free(ptr >>> 0, 1))

export class UnknownAssetLockProofTypeError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(UnknownAssetLockProofTypeError.prototype)
    obj.__wbg_ptr = ptr
    UnknownAssetLockProofTypeErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    UnknownAssetLockProofTypeErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_unknownassetlockprooftypeerror_free(ptr, 0)
  }

  /**
     * @returns {number | undefined}
     */
  getType () {
    const ret = wasm.unknownassetlockprooftypeerror_getType(this.__wbg_ptr)
    return ret === 0xFFFFFF ? undefined : ret
  }
}

const UnknownDocumentActionTokenEffectErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_unknowndocumentactiontokeneffecterror_free(ptr >>> 0, 1))

export class UnknownDocumentActionTokenEffectError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(UnknownDocumentActionTokenEffectError.prototype)
    obj.__wbg_ptr = ptr
    UnknownDocumentActionTokenEffectErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    UnknownDocumentActionTokenEffectErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_unknowndocumentactiontokeneffecterror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.unknowndocumentactiontokeneffecterror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.unknowndocumentactiontokeneffecterror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.unknowndocumentactiontokeneffecterror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const UnknownDocumentCreationRestrictionModeErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_unknowndocumentcreationrestrictionmodeerror_free(ptr >>> 0, 1))

export class UnknownDocumentCreationRestrictionModeError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(UnknownDocumentCreationRestrictionModeError.prototype)
    obj.__wbg_ptr = ptr
    UnknownDocumentCreationRestrictionModeErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    UnknownDocumentCreationRestrictionModeErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_unknowndocumentcreationrestrictionmodeerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.unknowndocumentcreationrestrictionmodeerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.unknowndocumentcreationrestrictionmodeerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.unknowndocumentcreationrestrictionmodeerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const UnknownGasFeesPaidByErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_unknowngasfeespaidbyerror_free(ptr >>> 0, 1))

export class UnknownGasFeesPaidByError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(UnknownGasFeesPaidByError.prototype)
    obj.__wbg_ptr = ptr
    UnknownGasFeesPaidByErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    UnknownGasFeesPaidByErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_unknowngasfeespaidbyerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.unknowngasfeespaidbyerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.unknowngasfeespaidbyerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.unknowngasfeespaidbyerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const UnknownSecurityLevelErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_unknownsecuritylevelerror_free(ptr >>> 0, 1))

export class UnknownSecurityLevelError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(UnknownSecurityLevelError.prototype)
    obj.__wbg_ptr = ptr
    UnknownSecurityLevelErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    UnknownSecurityLevelErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_unknownsecuritylevelerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.unknownsecuritylevelerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.unknownsecuritylevelerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.unknownsecuritylevelerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const UnknownStorageKeyRequirementsErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_unknownstoragekeyrequirementserror_free(ptr >>> 0, 1))

export class UnknownStorageKeyRequirementsError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(UnknownStorageKeyRequirementsError.prototype)
    obj.__wbg_ptr = ptr
    UnknownStorageKeyRequirementsErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    UnknownStorageKeyRequirementsErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_unknownstoragekeyrequirementserror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.unknownstoragekeyrequirementserror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.unknownstoragekeyrequirementserror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.unknownstoragekeyrequirementserror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const UnknownTradeModeErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_unknowntrademodeerror_free(ptr >>> 0, 1))

export class UnknownTradeModeError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(UnknownTradeModeError.prototype)
    obj.__wbg_ptr = ptr
    UnknownTradeModeErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    UnknownTradeModeErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_unknowntrademodeerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.unknowntrademodeerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.unknowntrademodeerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.unknowntrademodeerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const UnknownTransferableTypeErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_unknowntransferabletypeerror_free(ptr >>> 0, 1))

export class UnknownTransferableTypeError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(UnknownTransferableTypeError.prototype)
    obj.__wbg_ptr = ptr
    UnknownTransferableTypeErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    UnknownTransferableTypeErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_unknowntransferabletypeerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.unknowntransferabletypeerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.unknowntransferabletypeerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.unknowntransferabletypeerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const UnsupportedFeatureErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_unsupportedfeatureerror_free(ptr >>> 0, 1))

export class UnsupportedFeatureError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(UnsupportedFeatureError.prototype)
    obj.__wbg_ptr = ptr
    UnsupportedFeatureErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    UnsupportedFeatureErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_unsupportedfeatureerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.unsupportedfeatureerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.unsupportedfeatureerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.unsupportedfeatureerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const UnsupportedProtocolVersionErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_unsupportedprotocolversionerror_free(ptr >>> 0, 1))

export class UnsupportedProtocolVersionError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(UnsupportedProtocolVersionError.prototype)
    obj.__wbg_ptr = ptr
    UnsupportedProtocolVersionErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    UnsupportedProtocolVersionErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_unsupportedprotocolversionerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getParsedProtocolVersion () {
    const ret = wasm.chainassetlockproof_getCoreChainLockedHeight(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {number}
     */
  getLatestVersion () {
    const ret = wasm.unsupportedprotocolversionerror_getLatestVersion(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.unsupportedprotocolversionerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.unsupportedprotocolversionerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const UnsupportedVersionErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_unsupportedversionerror_free(ptr >>> 0, 1))

export class UnsupportedVersionError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(UnsupportedVersionError.prototype)
    obj.__wbg_ptr = ptr
    UnsupportedVersionErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    UnsupportedVersionErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_unsupportedversionerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getReceivedVersion () {
    const ret = wasm.unsupportedversionerror_getReceivedVersion(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getMinVersion () {
    const ret = wasm.unsupportedversionerror_getMinVersion(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getMaxVersion () {
    const ret = wasm.unsupportedversionerror_getMaxVersion(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.unsupportedversionerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.unsupportedversionerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const ValidationResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_validationresult_free(ptr >>> 0, 1))

export class ValidationResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(ValidationResult.prototype)
    obj.__wbg_ptr = ptr
    ValidationResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    ValidationResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_validationresult_free(ptr, 0)
  }

  /**
     * @param {any[] | null} [errors_option]
     */
  constructor (errors_option) {
    const ptr0 = isLikeNone(errors_option) ? 0 : passArrayJsValueToWasm0(errors_option, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.validationresult_new(ptr0, len0)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    this.__wbg_ptr = ret[0] >>> 0
    ValidationResultFinalization.register(this, this.__wbg_ptr, this)
    return this
  }

  /**
     * This is just a test method - doesn't need to be in the resulted binding. Please
     * remove before shipping
     * @returns {string[]}
     */
  errorsText () {
    const ret = wasm.validationresult_errorsText(this.__wbg_ptr)
    const v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
    return v1
  }

  /**
     * @returns {boolean}
     */
  isValid () {
    const ret = wasm.validationresult_isValid(this.__wbg_ptr)
    return ret !== 0
  }

  /**
     * @returns {any[]}
     */
  getErrors () {
    const ret = wasm.validationresult_getErrors(this.__wbg_ptr)
    const v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
    return v1
  }

  /**
     * @returns {any[]}
     */
  get errors () {
    const ret = wasm.validationresult_errors(this.__wbg_ptr)
    const v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
    return v1
  }

  /**
     * @returns {any}
     */
  getData () {
    const ret = wasm.validationresult_getData(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {any}
     */
  getFirstError () {
    const ret = wasm.validationresult_getFirstError(this.__wbg_ptr)
    return ret
  }
}

const ValueErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_valueerror_free(ptr >>> 0, 1))

export class ValueError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(ValueError.prototype)
    obj.__wbg_ptr = ptr
    ValueErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  toJSON () {
    return {
      message: this.message
    }
  }

  toString () {
    return JSON.stringify(this)
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    ValueErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_valueerror_free(ptr, 0)
  }

  /**
     * @returns {string}
     */
  getMessage () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.valueerror_getMessage(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.valueerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.valueerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

const VerifyActionInfosInContractResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyactioninfosincontractresult_free(ptr >>> 0, 1))

export class VerifyActionInfosInContractResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyActionInfosInContractResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyActionInfosInContractResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyActionInfosInContractResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyactioninfosincontractresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyactioninfosincontractresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get actions () {
    const ret = wasm.verifyactioninfosincontractresult_actions(this.__wbg_ptr)
    return ret
  }
}

const VerifyActionSignersResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyactionsignersresult_free(ptr >>> 0, 1))

export class VerifyActionSignersResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyActionSignersResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyActionSignersResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyActionSignersResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyactionsignersresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyactionsignersresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get signers () {
    const ret = wasm.verifyactionsignersresult_signers(this.__wbg_ptr)
    return ret
  }
}

const VerifyActionSignersTotalPowerResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyactionsignerstotalpowerresult_free(ptr >>> 0, 1))

export class VerifyActionSignersTotalPowerResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyActionSignersTotalPowerResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyActionSignersTotalPowerResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyActionSignersTotalPowerResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyactionsignerstotalpowerresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyactionsignerstotalpowerresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {number}
     */
  get action_status () {
    const ret = wasm.verifyactionsignerstotalpowerresult_action_status(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {bigint}
     */
  get total_power () {
    const ret = wasm.verifyactionsignerstotalpowerresult_total_power(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }
}

const VerifyContestsProofResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifycontestsproofresult_free(ptr >>> 0, 1))

export class VerifyContestsProofResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyContestsProofResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyContestsProofResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyContestsProofResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifycontestsproofresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifycontestsproofresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {Array<any>}
     */
  get contests () {
    const ret = wasm.verifycontestsproofresult_contests(this.__wbg_ptr)
    return ret
  }
}

const VerifyContractHistoryResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifycontracthistoryresult_free(ptr >>> 0, 1))

export class VerifyContractHistoryResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyContractHistoryResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyContractHistoryResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyContractHistoryResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifycontracthistoryresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifycontracthistoryresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get contract_history () {
    const ret = wasm.verifycontracthistoryresult_contract_history(this.__wbg_ptr)
    return ret
  }
}

const VerifyContractResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifycontractresult_free(ptr >>> 0, 1))

export class VerifyContractResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyContractResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyContractResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyContractResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifycontractresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifycontractresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get contract () {
    const ret = wasm.verifycontractresult_contract(this.__wbg_ptr)
    return ret
  }
}

const VerifyDocumentProofKeepSerializedResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifydocumentproofkeepserializedresult_free(ptr >>> 0, 1))

export class VerifyDocumentProofKeepSerializedResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyDocumentProofKeepSerializedResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyDocumentProofKeepSerializedResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyDocumentProofKeepSerializedResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifydocumentproofkeepserializedresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifydocumentproofkeepserializedresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get serialized_documents () {
    const ret = wasm.verifydocumentproofkeepserializedresult_serialized_documents(this.__wbg_ptr)
    return ret
  }
}

const VerifyDocumentProofResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifydocumentproofresult_free(ptr >>> 0, 1))

export class VerifyDocumentProofResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyDocumentProofResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyDocumentProofResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyDocumentProofResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifydocumentproofresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifydocumentproofresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get documents () {
    const ret = wasm.verifydocumentproofresult_documents(this.__wbg_ptr)
    return ret
  }
}

const VerifyElementsResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyelementsresult_free(ptr >>> 0, 1))

export class VerifyElementsResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyElementsResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyElementsResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyElementsResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyelementsresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyelementsresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get elements () {
    const ret = wasm.verifyelementsresult_elements(this.__wbg_ptr)
    return ret
  }
}

const VerifyEpochInfosResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyepochinfosresult_free(ptr >>> 0, 1))

export class VerifyEpochInfosResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyEpochInfosResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyEpochInfosResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyEpochInfosResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyepochinfosresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyepochinfosresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get epoch_infos () {
    const ret = wasm.verifyepochinfosresult_epoch_infos(this.__wbg_ptr)
    return ret
  }
}

const VerifyEpochProposersResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyepochproposersresult_free(ptr >>> 0, 1))

export class VerifyEpochProposersResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyEpochProposersResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyEpochProposersResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyEpochProposersResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyepochproposersresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyepochproposersresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get proposers () {
    const ret = wasm.verifyepochproposersresult_proposers(this.__wbg_ptr)
    return ret
  }
}

const VerifyFullIdentitiesByPublicKeyHashesResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyfullidentitiesbypublickeyhashesresult_free(ptr >>> 0, 1))

export class VerifyFullIdentitiesByPublicKeyHashesResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyFullIdentitiesByPublicKeyHashesResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyFullIdentitiesByPublicKeyHashesResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyFullIdentitiesByPublicKeyHashesResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyfullidentitiesbypublickeyhashesresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyfullidentitiesbypublickeyhashesresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get identities () {
    const ret = wasm.verifyfullidentitiesbypublickeyhashesresult_identities(this.__wbg_ptr)
    return ret
  }
}

const VerifyFullIdentityByIdentityIdResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyfullidentitybyidentityidresult_free(ptr >>> 0, 1))

export class VerifyFullIdentityByIdentityIdResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyFullIdentityByIdentityIdResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyFullIdentityByIdentityIdResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyFullIdentityByIdentityIdResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyfullidentitybyidentityidresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyfullidentitybyidentityidresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get identity () {
    const ret = wasm.verifyfullidentitybyidentityidresult_identity(this.__wbg_ptr)
    return ret
  }
}

const VerifyFullIdentityByNonUniquePublicKeyHashResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyfullidentitybynonuniquepublickeyhashresult_free(ptr >>> 0, 1))

export class VerifyFullIdentityByNonUniquePublicKeyHashResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyFullIdentityByNonUniquePublicKeyHashResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyFullIdentityByNonUniquePublicKeyHashResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyFullIdentityByNonUniquePublicKeyHashResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyfullidentitybynonuniquepublickeyhashresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyfullidentitybynonuniquepublickeyhashresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get identity () {
    const ret = wasm.verifyfullidentitybynonuniquepublickeyhashresult_identity(this.__wbg_ptr)
    return ret
  }
}

const VerifyFullIdentityByUniquePublicKeyHashResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyfullidentitybyuniquepublickeyhashresult_free(ptr >>> 0, 1))

export class VerifyFullIdentityByUniquePublicKeyHashResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyFullIdentityByUniquePublicKeyHashResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyFullIdentityByUniquePublicKeyHashResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyFullIdentityByUniquePublicKeyHashResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyfullidentitybyuniquepublickeyhashresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyfullidentitybyuniquepublickeyhashresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get identity () {
    const ret = wasm.verifyfullidentitybyuniquepublickeyhashresult_identity(this.__wbg_ptr)
    return ret
  }
}

const VerifyGroupInfoResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifygroupinforesult_free(ptr >>> 0, 1))

export class VerifyGroupInfoResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyGroupInfoResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyGroupInfoResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyGroupInfoResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifygroupinforesult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifygroupinforesult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get group () {
    const ret = wasm.verifygroupinforesult_group(this.__wbg_ptr)
    return ret
  }
}

const VerifyGroupInfosInContractResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifygroupinfosincontractresult_free(ptr >>> 0, 1))

export class VerifyGroupInfosInContractResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyGroupInfosInContractResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyGroupInfosInContractResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyGroupInfosInContractResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifygroupinfosincontractresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifygroupinfosincontractresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get groups () {
    const ret = wasm.verifygroupinfosincontractresult_groups(this.__wbg_ptr)
    return ret
  }
}

const VerifyIdentitiesContractKeysResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyidentitiescontractkeysresult_free(ptr >>> 0, 1))

export class VerifyIdentitiesContractKeysResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyIdentitiesContractKeysResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyIdentitiesContractKeysResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyIdentitiesContractKeysResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyidentitiescontractkeysresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyidentitiescontractkeysresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get keys () {
    const ret = wasm.verifyidentitiescontractkeysresult_keys(this.__wbg_ptr)
    return ret
  }
}

const VerifyIdentityBalanceAndRevisionForIdentityIdResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyidentitybalanceandrevisionforidentityidresult_free(ptr >>> 0, 1))

export class VerifyIdentityBalanceAndRevisionForIdentityIdResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyIdentityBalanceAndRevisionForIdentityIdResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyIdentityBalanceAndRevisionForIdentityIdResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyIdentityBalanceAndRevisionForIdentityIdResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyidentitybalanceandrevisionforidentityidresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyidentitybalanceandrevisionforidentityidresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {bigint | undefined}
     */
  get balance () {
    const ret = wasm.verifyidentitybalanceandrevisionforidentityidresult_balance(this.__wbg_ptr)
    return ret[0] === 0 ? undefined : BigInt.asUintN(64, ret[1])
  }

  /**
     * @returns {bigint | undefined}
     */
  get revision () {
    const ret = wasm.verifyidentitybalanceandrevisionforidentityidresult_revision(this.__wbg_ptr)
    return ret[0] === 0 ? undefined : BigInt.asUintN(64, ret[1])
  }
}

const VerifyIdentityBalanceForIdentityIdResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyidentitybalanceforidentityidresult_free(ptr >>> 0, 1))

export class VerifyIdentityBalanceForIdentityIdResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyIdentityBalanceForIdentityIdResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyIdentityBalanceForIdentityIdResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyIdentityBalanceForIdentityIdResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyidentitybalanceforidentityidresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyidentitybalanceforidentityidresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {bigint | undefined}
     */
  get balance () {
    const ret = wasm.verifyidentitybalanceforidentityidresult_balance(this.__wbg_ptr)
    return ret[0] === 0 ? undefined : BigInt.asUintN(64, ret[1])
  }
}

const VerifyIdentityBalancesForIdentityIdsResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyidentitybalancesforidentityidsresult_free(ptr >>> 0, 1))

export class VerifyIdentityBalancesForIdentityIdsResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyIdentityBalancesForIdentityIdsResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyIdentityBalancesForIdentityIdsResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyIdentityBalancesForIdentityIdsResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyidentitybalancesforidentityidsresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyidentitybalancesforidentityidsresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get balances () {
    const ret = wasm.verifyidentitybalancesforidentityidsresult_balances(this.__wbg_ptr)
    return ret
  }
}

const VerifyIdentityContractNonceResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyidentitycontractnonceresult_free(ptr >>> 0, 1))

export class VerifyIdentityContractNonceResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyIdentityContractNonceResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyIdentityContractNonceResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyIdentityContractNonceResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyidentitycontractnonceresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyidentitycontractnonceresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {bigint | undefined}
     */
  get nonce () {
    const ret = wasm.verifyidentitycontractnonceresult_nonce(this.__wbg_ptr)
    return ret[0] === 0 ? undefined : BigInt.asUintN(64, ret[1])
  }
}

const VerifyIdentityIdByNonUniquePublicKeyHashResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyidentityidbynonuniquepublickeyhashresult_free(ptr >>> 0, 1))

export class VerifyIdentityIdByNonUniquePublicKeyHashResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyIdentityIdByNonUniquePublicKeyHashResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyIdentityIdByNonUniquePublicKeyHashResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyIdentityIdByNonUniquePublicKeyHashResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyidentityidbynonuniquepublickeyhashresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyidentityidbynonuniquepublickeyhashresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {Uint8Array | undefined}
     */
  get identity_id () {
    const ret = wasm.verifyidentityidbynonuniquepublickeyhashresult_identity_id(this.__wbg_ptr)
    let v1
    if (ret[0] !== 0) {
      v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    }
    return v1
  }
}

const VerifyIdentityIdByUniquePublicKeyHashResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyidentityidbyuniquepublickeyhashresult_free(ptr >>> 0, 1))

export class VerifyIdentityIdByUniquePublicKeyHashResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyIdentityIdByUniquePublicKeyHashResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyIdentityIdByUniquePublicKeyHashResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyIdentityIdByUniquePublicKeyHashResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyidentityidbyuniquepublickeyhashresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyidentityidbyuniquepublickeyhashresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {Uint8Array | undefined}
     */
  get identity_id () {
    const ret = wasm.verifyidentityidbyuniquepublickeyhashresult_identity_id(this.__wbg_ptr)
    let v1
    if (ret[0] !== 0) {
      v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    }
    return v1
  }
}

const VerifyIdentityIdsByUniquePublicKeyHashesResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyidentityidsbyuniquepublickeyhashesresult_free(ptr >>> 0, 1))

export class VerifyIdentityIdsByUniquePublicKeyHashesResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyIdentityIdsByUniquePublicKeyHashesResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyIdentityIdsByUniquePublicKeyHashesResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyIdentityIdsByUniquePublicKeyHashesResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyidentityidsbyuniquepublickeyhashesresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyidentityidsbyuniquepublickeyhashesresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get identity_ids () {
    const ret = wasm.verifyidentityidsbyuniquepublickeyhashesresult_identity_ids(this.__wbg_ptr)
    return ret
  }
}

const VerifyIdentityKeysByIdentityIdResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyidentitykeysbyidentityidresult_free(ptr >>> 0, 1))

export class VerifyIdentityKeysByIdentityIdResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyIdentityKeysByIdentityIdResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyIdentityKeysByIdentityIdResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyIdentityKeysByIdentityIdResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyidentitykeysbyidentityidresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyidentitykeysbyidentityidresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get identity () {
    const ret = wasm.verifyidentitykeysbyidentityidresult_identity(this.__wbg_ptr)
    return ret
  }
}

const VerifyIdentityNonceResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyidentitynonceresult_free(ptr >>> 0, 1))

export class VerifyIdentityNonceResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyIdentityNonceResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyIdentityNonceResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyIdentityNonceResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyidentitynonceresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyidentitynonceresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {bigint | undefined}
     */
  get nonce () {
    const ret = wasm.verifyidentitynonceresult_nonce(this.__wbg_ptr)
    return ret[0] === 0 ? undefined : BigInt.asUintN(64, ret[1])
  }
}

const VerifyIdentityRevisionForIdentityIdResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyidentityrevisionforidentityidresult_free(ptr >>> 0, 1))

export class VerifyIdentityRevisionForIdentityIdResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyIdentityRevisionForIdentityIdResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyIdentityRevisionForIdentityIdResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyIdentityRevisionForIdentityIdResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyidentityrevisionforidentityidresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyidentityrevisionforidentityidresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {bigint | undefined}
     */
  get revision () {
    const ret = wasm.verifyidentityrevisionforidentityidresult_revision(this.__wbg_ptr)
    return ret[0] === 0 ? undefined : BigInt.asUintN(64, ret[1])
  }
}

const VerifyIdentityVotesGivenProofResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyidentityvotesgivenproofresult_free(ptr >>> 0, 1))

export class VerifyIdentityVotesGivenProofResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyIdentityVotesGivenProofResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyIdentityVotesGivenProofResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyIdentityVotesGivenProofResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyidentityvotesgivenproofresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyidentityvotesgivenproofresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get votes () {
    const ret = wasm.verifyidentityvotesgivenproofresult_votes(this.__wbg_ptr)
    return ret
  }
}

const VerifyMasternodeVoteResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifymasternodevoteresult_free(ptr >>> 0, 1))

export class VerifyMasternodeVoteResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyMasternodeVoteResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyMasternodeVoteResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyMasternodeVoteResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifymasternodevoteresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifymasternodevoteresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {Uint8Array | undefined}
     */
  get vote () {
    const ret = wasm.verifymasternodevoteresult_vote(this.__wbg_ptr)
    let v1
    if (ret[0] !== 0) {
      v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    }
    return v1
  }
}

const VerifySpecializedBalanceResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyspecializedbalanceresult_free(ptr >>> 0, 1))

export class VerifySpecializedBalanceResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifySpecializedBalanceResult.prototype)
    obj.__wbg_ptr = ptr
    VerifySpecializedBalanceResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifySpecializedBalanceResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyspecializedbalanceresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyspecializedbalanceresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {bigint | undefined}
     */
  get balance () {
    const ret = wasm.verifyspecializedbalanceresult_balance(this.__wbg_ptr)
    return ret[0] === 0 ? undefined : BigInt.asUintN(64, ret[1])
  }
}

const VerifyStartAtDocumentInProofResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifystartatdocumentinproofresult_free(ptr >>> 0, 1))

export class VerifyStartAtDocumentInProofResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyStartAtDocumentInProofResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyStartAtDocumentInProofResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyStartAtDocumentInProofResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifystartatdocumentinproofresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifystartatdocumentinproofresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get document () {
    const ret = wasm.verifystartatdocumentinproofresult_document(this.__wbg_ptr)
    return ret
  }
}

const VerifyStateTransitionWasExecutedWithProofResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifystatetransitionwasexecutedwithproofresult_free(ptr >>> 0, 1))

export class VerifyStateTransitionWasExecutedWithProofResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyStateTransitionWasExecutedWithProofResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyStateTransitionWasExecutedWithProofResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyStateTransitionWasExecutedWithProofResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifystatetransitionwasexecutedwithproofresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifystatetransitionwasexecutedwithproofresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get proof_result () {
    const ret = wasm.verifystatetransitionwasexecutedwithproofresult_proof_result(this.__wbg_ptr)
    return ret
  }
}

const VerifyTokenBalanceForIdentityIdResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifytokenbalanceforidentityidresult_free(ptr >>> 0, 1))

export class VerifyTokenBalanceForIdentityIdResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyTokenBalanceForIdentityIdResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyTokenBalanceForIdentityIdResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyTokenBalanceForIdentityIdResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifytokenbalanceforidentityidresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifytokenbalanceforidentityidresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {bigint | undefined}
     */
  get balance () {
    const ret = wasm.verifytokenbalanceforidentityidresult_balance(this.__wbg_ptr)
    return ret[0] === 0 ? undefined : BigInt.asUintN(64, ret[1])
  }
}

const VerifyTokenBalancesForIdentityIdResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifytokenbalancesforidentityidresult_free(ptr >>> 0, 1))

export class VerifyTokenBalancesForIdentityIdResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyTokenBalancesForIdentityIdResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyTokenBalancesForIdentityIdResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyTokenBalancesForIdentityIdResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifytokenbalancesforidentityidresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifytokenbalancesforidentityidresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get balances () {
    const ret = wasm.verifytokenbalancesforidentityidresult_balances(this.__wbg_ptr)
    return ret
  }
}

const VerifyTokenBalancesForIdentityIdsResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifytokenbalancesforidentityidsresult_free(ptr >>> 0, 1))

export class VerifyTokenBalancesForIdentityIdsResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyTokenBalancesForIdentityIdsResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyTokenBalancesForIdentityIdsResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyTokenBalancesForIdentityIdsResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifytokenbalancesforidentityidsresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifytokenbalancesforidentityidsresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get balances () {
    const ret = wasm.verifytokenbalancesforidentityidsresult_balances(this.__wbg_ptr)
    return ret
  }
}

const VerifyTokenContractInfoResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifytokencontractinforesult_free(ptr >>> 0, 1))

export class VerifyTokenContractInfoResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyTokenContractInfoResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyTokenContractInfoResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyTokenContractInfoResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifytokencontractinforesult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifytokencontractinforesult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get contract_info () {
    const ret = wasm.verifytokencontractinforesult_contract_info(this.__wbg_ptr)
    return ret
  }
}

const VerifyTokenDirectSellingPriceResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifytokendirectsellingpriceresult_free(ptr >>> 0, 1))

export class VerifyTokenDirectSellingPriceResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyTokenDirectSellingPriceResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyTokenDirectSellingPriceResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyTokenDirectSellingPriceResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifytokendirectsellingpriceresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifytokendirectsellingpriceresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get price () {
    const ret = wasm.verifytokendirectsellingpriceresult_price(this.__wbg_ptr)
    return ret
  }
}

const VerifyTokenDirectSellingPricesResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifytokendirectsellingpricesresult_free(ptr >>> 0, 1))

export class VerifyTokenDirectSellingPricesResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyTokenDirectSellingPricesResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyTokenDirectSellingPricesResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyTokenDirectSellingPricesResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifytokendirectsellingpricesresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifytokendirectsellingpricesresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get prices () {
    const ret = wasm.verifytokendirectsellingpricesresult_prices(this.__wbg_ptr)
    return ret
  }
}

const VerifyTokenInfoForIdentityIdResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifytokeninfoforidentityidresult_free(ptr >>> 0, 1))

export class VerifyTokenInfoForIdentityIdResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyTokenInfoForIdentityIdResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyTokenInfoForIdentityIdResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyTokenInfoForIdentityIdResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifytokeninfoforidentityidresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifytokeninfoforidentityidresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get token_info () {
    const ret = wasm.verifytokeninfoforidentityidresult_token_info(this.__wbg_ptr)
    return ret
  }
}

const VerifyTokenInfosForIdentityIdResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifytokeninfosforidentityidresult_free(ptr >>> 0, 1))

export class VerifyTokenInfosForIdentityIdResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyTokenInfosForIdentityIdResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyTokenInfosForIdentityIdResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyTokenInfosForIdentityIdResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifytokeninfosforidentityidresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifytokeninfosforidentityidresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get token_infos () {
    const ret = wasm.verifytokeninfosforidentityidresult_token_infos(this.__wbg_ptr)
    return ret
  }
}

const VerifyTokenInfosForIdentityIdsResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifytokeninfosforidentityidsresult_free(ptr >>> 0, 1))

export class VerifyTokenInfosForIdentityIdsResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyTokenInfosForIdentityIdsResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyTokenInfosForIdentityIdsResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyTokenInfosForIdentityIdsResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifytokeninfosforidentityidsresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifytokeninfosforidentityidsresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get token_infos () {
    const ret = wasm.verifytokeninfosforidentityidsresult_token_infos(this.__wbg_ptr)
    return ret
  }
}

const VerifyTokenPerpetualDistributionLastPaidTimeResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifytokenperpetualdistributionlastpaidtimeresult_free(ptr >>> 0, 1))

export class VerifyTokenPerpetualDistributionLastPaidTimeResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyTokenPerpetualDistributionLastPaidTimeResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyTokenPerpetualDistributionLastPaidTimeResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyTokenPerpetualDistributionLastPaidTimeResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifytokenperpetualdistributionlastpaidtimeresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifytokenperpetualdistributionlastpaidtimeresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get last_paid_time () {
    const ret = wasm.verifytokenperpetualdistributionlastpaidtimeresult_last_paid_time(this.__wbg_ptr)
    return ret
  }
}

const VerifyTokenPreProgrammedDistributionsResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifytokenpreprogrammeddistributionsresult_free(ptr >>> 0, 1))

export class VerifyTokenPreProgrammedDistributionsResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyTokenPreProgrammedDistributionsResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyTokenPreProgrammedDistributionsResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyTokenPreProgrammedDistributionsResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifytokenpreprogrammeddistributionsresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifytokenpreprogrammeddistributionsresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get distributions () {
    const ret = wasm.verifytokenpreprogrammeddistributionsresult_distributions(this.__wbg_ptr)
    return ret
  }
}

const VerifyTokenStatusResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifytokenstatusresult_free(ptr >>> 0, 1))

export class VerifyTokenStatusResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyTokenStatusResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyTokenStatusResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyTokenStatusResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifytokenstatusresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifytokenstatusresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get status () {
    const ret = wasm.verifytokenstatusresult_status(this.__wbg_ptr)
    return ret
  }
}

const VerifyTokenStatusesResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifytokenstatusesresult_free(ptr >>> 0, 1))

export class VerifyTokenStatusesResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyTokenStatusesResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyTokenStatusesResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyTokenStatusesResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifytokenstatusesresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifytokenstatusesresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get statuses () {
    const ret = wasm.verifytokenstatusesresult_statuses(this.__wbg_ptr)
    return ret
  }
}

const VerifyTokenTotalSupplyAndAggregatedIdentityBalanceResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifytokentotalsupplyandaggregatedidentitybalanceresult_free(ptr >>> 0, 1))

export class VerifyTokenTotalSupplyAndAggregatedIdentityBalanceResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyTokenTotalSupplyAndAggregatedIdentityBalanceResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyTokenTotalSupplyAndAggregatedIdentityBalanceResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyTokenTotalSupplyAndAggregatedIdentityBalanceResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifytokentotalsupplyandaggregatedidentitybalanceresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifytokentotalsupplyandaggregatedidentitybalanceresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get total_supply_and_balance () {
    const ret = wasm.verifytokentotalsupplyandaggregatedidentitybalanceresult_total_supply_and_balance(this.__wbg_ptr)
    return ret
  }
}

const VerifyTotalCreditsInSystemResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifytotalcreditsinsystemresult_free(ptr >>> 0, 1))

export class VerifyTotalCreditsInSystemResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyTotalCreditsInSystemResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyTotalCreditsInSystemResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyTotalCreditsInSystemResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifytotalcreditsinsystemresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifytotalcreditsinsystemresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {bigint}
     */
  get total_credits () {
    const ret = wasm.verifytotalcreditsinsystemresult_total_credits(this.__wbg_ptr)
    return BigInt.asUintN(64, ret)
  }
}

const VerifyUpgradeStateResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyupgradestateresult_free(ptr >>> 0, 1))

export class VerifyUpgradeStateResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyUpgradeStateResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyUpgradeStateResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyUpgradeStateResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyupgradestateresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyupgradestateresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get upgrade_state () {
    const ret = wasm.verifyupgradestateresult_upgrade_state(this.__wbg_ptr)
    return ret
  }
}

const VerifyUpgradeVoteStatusResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyupgradevotestatusresult_free(ptr >>> 0, 1))

export class VerifyUpgradeVoteStatusResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyUpgradeVoteStatusResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyUpgradeVoteStatusResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyUpgradeVoteStatusResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyupgradevotestatusresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyupgradevotestatusresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get vote_status () {
    const ret = wasm.verifyupgradevotestatusresult_vote_status(this.__wbg_ptr)
    return ret
  }
}

const VerifyVotePollVoteStateProofResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyvotepollvotestateproofresult_free(ptr >>> 0, 1))

export class VerifyVotePollVoteStateProofResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyVotePollVoteStateProofResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyVotePollVoteStateProofResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyVotePollVoteStateProofResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyvotepollvotestateproofresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyvotepollvotestateproofresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get result () {
    const ret = wasm.verifyvotepollvotestateproofresult_result(this.__wbg_ptr)
    return ret
  }
}

const VerifyVotePollVotesProofResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyvotepollvotesproofresult_free(ptr >>> 0, 1))

export class VerifyVotePollVotesProofResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyVotePollVotesProofResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyVotePollVotesProofResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyVotePollVotesProofResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyvotepollvotesproofresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyvotepollvotesproofresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {Array<any>}
     */
  get votes () {
    const ret = wasm.verifyvotepollvotesproofresult_votes(this.__wbg_ptr)
    return ret
  }
}

const VerifyVotePollsEndDateQueryResultFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_verifyvotepollsenddatequeryresult_free(ptr >>> 0, 1))

export class VerifyVotePollsEndDateQueryResult {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VerifyVotePollsEndDateQueryResult.prototype)
    obj.__wbg_ptr = ptr
    VerifyVotePollsEndDateQueryResultFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VerifyVotePollsEndDateQueryResultFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_verifyvotepollsenddatequeryresult_free(ptr, 0)
  }

  /**
     * @returns {Uint8Array}
     */
  get root_hash () {
    const ret = wasm.verifyvotepollsenddatequeryresult_root_hash(this.__wbg_ptr)
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    return v1
  }

  /**
     * @returns {any}
     */
  get vote_polls () {
    const ret = wasm.verifyvotepollsenddatequeryresult_vote_polls(this.__wbg_ptr)
    return ret
  }
}

const VersionErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_versionerror_free(ptr >>> 0, 1))

export class VersionError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VersionError.prototype)
    obj.__wbg_ptr = ptr
    VersionErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VersionErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_versionerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.versionerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.versionerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.versionerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const VotePollNotAvailableForVotingErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_votepollnotavailableforvotingerror_free(ptr >>> 0, 1))

export class VotePollNotAvailableForVotingError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VotePollNotAvailableForVotingError.prototype)
    obj.__wbg_ptr = ptr
    VotePollNotAvailableForVotingErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VotePollNotAvailableForVotingErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_votepollnotavailableforvotingerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.votepollnotavailableforvotingerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.votepollnotavailableforvotingerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.votepollnotavailableforvotingerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const VotePollNotFoundErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_votepollnotfounderror_free(ptr >>> 0, 1))

export class VotePollNotFoundError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(VotePollNotFoundError.prototype)
    obj.__wbg_ptr = ptr
    VotePollNotFoundErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    VotePollNotFoundErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_votepollnotfounderror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.votepollnotfounderror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.votepollnotfounderror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.votepollnotfounderror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const WithdrawalOutputScriptNotAllowedWhenSigningWithOwnerKeyErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_withdrawaloutputscriptnotallowedwhensigningwithownerkeyerror_free(ptr >>> 0, 1))

export class WithdrawalOutputScriptNotAllowedWhenSigningWithOwnerKeyError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(WithdrawalOutputScriptNotAllowedWhenSigningWithOwnerKeyError.prototype)
    obj.__wbg_ptr = ptr
    WithdrawalOutputScriptNotAllowedWhenSigningWithOwnerKeyErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    WithdrawalOutputScriptNotAllowedWhenSigningWithOwnerKeyErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_withdrawaloutputscriptnotallowedwhensigningwithownerkeyerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.withdrawaloutputscriptnotallowedwhensigningwithownerkeyerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.withdrawaloutputscriptnotallowedwhensigningwithownerkeyerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }

  /**
     * @returns {any}
     */
  serialize () {
    const ret = wasm.withdrawaloutputscriptnotallowedwhensigningwithownerkeyerror_serialize(this.__wbg_ptr)
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1])
    }
    return takeFromExternrefTable0(ret[0])
  }
}

const WrongPublicKeyPurposeErrorFinalization = (typeof FinalizationRegistry === 'undefined')
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry(ptr => wasm.__wbg_wrongpublickeypurposeerror_free(ptr >>> 0, 1))

export class WrongPublicKeyPurposeError {
  static __wrap (ptr) {
    ptr = ptr >>> 0
    const obj = Object.create(WrongPublicKeyPurposeError.prototype)
    obj.__wbg_ptr = ptr
    WrongPublicKeyPurposeErrorFinalization.register(obj, obj.__wbg_ptr, obj)
    return obj
  }

  __destroy_into_raw () {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    WrongPublicKeyPurposeErrorFinalization.unregister(this)
    return ptr
  }

  free () {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_wrongpublickeypurposeerror_free(ptr, 0)
  }

  /**
     * @returns {number}
     */
  getPublicKeyPurpose () {
    const ret = wasm.wrongpublickeypurposeerror_getPublicKeyPurpose(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {Array<any>}
     */
  getKeyPurposeRequirement () {
    const ret = wasm.wrongpublickeypurposeerror_getKeyPurposeRequirement(this.__wbg_ptr)
    return ret
  }

  /**
     * @returns {number}
     */
  getCode () {
    const ret = wasm.wrongpublickeypurposeerror_getCode(this.__wbg_ptr)
    return ret >>> 0
  }

  /**
     * @returns {string}
     */
  get message () {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.wrongpublickeypurposeerror_message(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
}

async function __wbg_load (module, imports) {
  if (typeof Response === 'function' && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === 'function') {
      try {
        return await WebAssembly.instantiateStreaming(module, imports)
      } catch (e) {
        if (module.headers.get('Content-Type') != 'application/wasm') {
          console.warn('`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n', e)
        } else {
          throw e
        }
      }
    }

    const bytes = await module.arrayBuffer()
    return await WebAssembly.instantiate(bytes, imports)
  } else {
    const instance = await WebAssembly.instantiate(module, imports)

    if (instance instanceof WebAssembly.Instance) {
      return { instance, module }
    } else {
      return instance
    }
  }
}

function __wbg_get_imports () {
  const imports = {}
  imports.wbg = {}
  imports.wbg.__wbg_String_eecc4a11987127d6 = function (arg0, arg1) {
    const ret = String(arg1)
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len1 = WASM_VECTOR_LEN
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
  }
  imports.wbg.__wbg_balanceisnotenougherror_new = function (arg0) {
    const ret = BalanceIsNotEnoughError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_basicblserror_new = function (arg0) {
    const ret = BasicBLSError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_basicecdsaerror_new = function (arg0) {
    const ret = BasicECDSAError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_batchtransition_new = function (arg0) {
    const ret = BatchTransition.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_buffer_609cc3eee51ed158 = function (arg0) {
    const ret = arg0.buffer
    return ret
  }
  imports.wbg.__wbg_buffer_e1aaea56ee60d2d7 = function (arg0) {
    const ret = arg0.buffer
    return ret
  }
  imports.wbg.__wbg_byteOffset_ddda7c82af125b32 = function (arg0) {
    const ret = arg0.byteOffset
    return ret
  }
  imports.wbg.__wbg_call_672a4d21634d4a24 = function () {
    return handleError(function (arg0, arg1) {
      const ret = arg0.call(arg1)
      return ret
    }, arguments)
  }
  imports.wbg.__wbg_call_7cccdd69e0791ae2 = function () {
    return handleError(function (arg0, arg1, arg2) {
      const ret = arg0.call(arg1, arg2)
      return ret
    }, arguments)
  }
  imports.wbg.__wbg_chainassetlockproof_new = function (arg0) {
    const ret = ChainAssetLockProof.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_choosingtokenmintrecipientnotallowederror_new = function (arg0) {
    const ret = ChoosingTokenMintRecipientNotAllowedError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_constructor_9fd96f589d65d4e5 = function (arg0) {
    const ret = arg0.constructor
    return ret
  }
  imports.wbg.__wbg_contesteddocumentstemporarilynotallowederror_new = function (arg0) {
    const ret = ContestedDocumentsTemporarilyNotAllowedError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_contesteduniqueindexonmutabledocumenttypeerror_new = function (arg0) {
    const ret = ContestedUniqueIndexOnMutableDocumentTypeError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_contesteduniqueindexwithuniqueindexerror_new = function (arg0) {
    const ret = ContestedUniqueIndexWithUniqueIndexError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_contracthasnotokenserror_new = function (arg0) {
    const ret = ContractHasNoTokensError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_crypto_ed58b8e10a292839 = function (arg0) {
    const ret = arg0.crypto
    return ret
  }
  imports.wbg.__wbg_datacontract_new = function (arg0) {
    const ret = DataContract.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_datacontractalreadypresenterror_new = function (arg0) {
    const ret = DataContractAlreadyPresentError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_datacontractboundsnotpresenterror_new = function (arg0) {
    const ret = DataContractBoundsNotPresentError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_datacontractconfigupdateerror_new = function (arg0) {
    const ret = DataContractConfigUpdateError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_datacontractcreatetransition_new = function (arg0) {
    const ret = DataContractCreateTransition.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_datacontracterror_new = function (arg0) {
    const ret = DataContractError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_datacontractgenericerror_new = function (arg0) {
    const ret = DataContractGenericError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_datacontracthavenewuniqueindexerror_new = function (arg0) {
    const ret = DataContractHaveNewUniqueIndexError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_datacontractimmutablepropertiesupdateerror_new = function (arg0) {
    const ret = DataContractImmutablePropertiesUpdateError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_datacontractinvalidindexdefinitionupdateerror_new = function (arg0) {
    const ret = DataContractInvalidIndexDefinitionUpdateError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_datacontractisreadonlyerror_new = function (arg0) {
    const ret = DataContractIsReadonlyError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_datacontractmaxdepthexceederror_new = function (arg0) {
    const ret = DataContractMaxDepthExceedError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_datacontractnotfounderror_new = function (arg0) {
    const ret = DataContractNotFoundError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_datacontractnotpresenterror_new = function (arg0) {
    const ret = DataContractNotPresentError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_datacontractnotpresentnotconsensuserror_new = function (arg0) {
    const ret = DataContractNotPresentNotConsensusError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_datacontracttokenconfigurationupdateerror_new = function (arg0) {
    const ret = DataContractTokenConfigurationUpdateError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_datacontractuniqueindiceschangederror_new = function (arg0) {
    const ret = DataContractUniqueIndicesChangedError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_datacontractupdateactionnotallowederror_new = function (arg0) {
    const ret = DataContractUpdateActionNotAllowedError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_datacontractupdatepermissionerror_new = function (arg0) {
    const ret = DataContractUpdatePermissionError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_datacontractupdatetransition_new = function (arg0) {
    const ret = DataContractUpdateTransition.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_datatriggerconditionerror_new = function (arg0) {
    const ret = DataTriggerConditionError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_datatriggerexecutionerror_new = function (arg0) {
    const ret = DataTriggerExecutionError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_datatriggerinvalidresulterror_new = function (arg0) {
    const ret = DataTriggerInvalidResultError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_debug_e17b51583ca6a632 = function (arg0, arg1, arg2, arg3) {
    console.debug(arg0, arg1, arg2, arg3)
  }
  imports.wbg.__wbg_decimalsoverlimiterror_new = function (arg0) {
    const ret = DecimalsOverLimitError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_deleteProperty_96363d4a1d977c97 = function () {
    return handleError(function (arg0, arg1) {
      const ret = Reflect.deleteProperty(arg0, arg1)
      return ret
    }, arguments)
  }
  imports.wbg.__wbg_destinationidentityfortokenmintingnotseterror_new = function (arg0) {
    const ret = DestinationIdentityForTokenMintingNotSetError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_disablingkeyidalsobeingaddedinsametransitionerror_new = function (arg0) {
    const ret = DisablingKeyIdAlsoBeingAddedInSameTransitionError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_document_new = function (arg0) {
    const ret = Document.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_documentalreadyexistserror_new = function (arg0) {
    const ret = DocumentAlreadyExistsError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_documentalreadypresenterror_new = function (arg0) {
    const ret = DocumentAlreadyPresentError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_documentcontestcurrentlylockederror_new = function (arg0) {
    const ret = DocumentContestCurrentlyLockedError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_documentcontestdocumentwithsameidalreadypresenterror_new = function (arg0) {
    const ret = DocumentContestDocumentWithSameIdAlreadyPresentError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_documentcontestidentityalreadycontestanterror_new = function (arg0) {
    const ret = DocumentContestIdentityAlreadyContestantError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_documentcontestnotjoinableerror_new = function (arg0) {
    const ret = DocumentContestNotJoinableError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_documentcontestnotpaidforerror_new = function (arg0) {
    const ret = DocumentContestNotPaidForError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_documentcreationnotallowederror_new = function (arg0) {
    const ret = DocumentCreationNotAllowedError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_documentfieldmaxsizeexceedederror_new = function (arg0) {
    const ret = DocumentFieldMaxSizeExceededError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_documentincorrectpurchasepriceerror_new = function (arg0) {
    const ret = DocumentIncorrectPurchasePriceError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_documentnorevisionerror_new = function (arg0) {
    const ret = DocumentNoRevisionError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_documentnotforsaleerror_new = function (arg0) {
    const ret = DocumentNotForSaleError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_documentnotfounderror_new = function (arg0) {
    const ret = DocumentNotFoundError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_documentnotprovidederror_new = function (arg0) {
    const ret = DocumentNotProvidedError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_documentowneridmismatcherror_new = function (arg0) {
    const ret = DocumentOwnerIdMismatchError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_documenttimestampsareequalerror_new = function (arg0) {
    const ret = DocumentTimestampsAreEqualError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_documenttimestampsmismatcherror_new = function (arg0) {
    const ret = DocumentTimestampsMismatchError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_documenttimestampwindowviolationerror_new = function (arg0) {
    const ret = DocumentTimestampWindowViolationError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_documenttransition_new = function (arg0) {
    const ret = DocumentTransition.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_documenttransitionsareabsenterror_new = function (arg0) {
    const ret = DocumentTransitionsAreAbsentError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_documenttypeupdateerror_new = function (arg0) {
    const ret = DocumentTypeUpdateError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_done_769e5ede4b31c67b = function (arg0) {
    const ret = arg0.done
    return ret
  }
  imports.wbg.__wbg_duplicatedidentitypublickeyerror_new = function (arg0) {
    const ret = DuplicatedIdentityPublicKeyError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_duplicatedidentitypublickeyiderror_new = function (arg0) {
    const ret = DuplicatedIdentityPublicKeyIdError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_duplicatedidentitypublickeyidstateerror_new = function (arg0) {
    const ret = DuplicatedIdentityPublicKeyIdStateError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_duplicatedidentitypublickeystateerror_new = function (arg0) {
    const ret = DuplicatedIdentityPublicKeyStateError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_duplicatedocumenttransitionswithidserror_new = function (arg0) {
    const ret = DuplicateDocumentTransitionsWithIdsError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_duplicatedocumenttransitionswithindiceserror_new = function (arg0) {
    const ret = DuplicateDocumentTransitionsWithIndicesError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_duplicateindexerror_new = function (arg0) {
    const ret = DuplicateIndexError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_duplicateindexnameerror_new = function (arg0) {
    const ret = DuplicateIndexNameError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_duplicatekeywordserror_new = function (arg0) {
    const ret = DuplicateKeywordsError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_duplicateuniqueindexerror_new = function (arg0) {
    const ret = DuplicateUniqueIndexError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_entries_3265d4158b33e5dc = function (arg0) {
    const ret = Object.entries(arg0)
    return ret
  }
  imports.wbg.__wbg_error_524f506f44df1645 = function (arg0) {
    console.error(arg0)
  }
  imports.wbg.__wbg_error_7534b8e9a36f1ab4 = function (arg0, arg1) {
    let deferred0_0
    let deferred0_1
    try {
      deferred0_0 = arg0
      deferred0_1 = arg1
      console.error(getStringFromWasm0(arg0, arg1))
    } finally {
      wasm.__wbindgen_free(deferred0_0, deferred0_1, 1)
    }
  }
  imports.wbg.__wbg_error_80de38b3f7cc3c3c = function (arg0, arg1, arg2, arg3) {
    console.error(arg0, arg1, arg2, arg3)
  }
  imports.wbg.__wbg_from_0df5e626fd7d89f4 = function (arg0, arg1) {
    const v0 = getArrayU8FromWasm0(arg0, arg1).slice()
    wasm.__wbindgen_free(arg0, arg1 * 1, 1)
    const ret = Buffer.from(v0)
    return ret
  }
  imports.wbg.__wbg_from_2a5d3e218e67aa85 = function (arg0) {
    const ret = Array.from(arg0)
    return ret
  }
  imports.wbg.__wbg_from_95e4de8a4b9d9613 = function (arg0, arg1) {
    const ret = Buffer.from(getArrayU8FromWasm0(arg0, arg1))
    return ret
  }
  imports.wbg.__wbg_generate_997cc277d407ec4a = function () {
    return handleError(function (arg0) {
      const ret = arg0.generate()
      return ret
    }, arguments)
  }
  imports.wbg.__wbg_getPrototypeOf_64af13611bceb86e = function (arg0) {
    const ret = Object.getPrototypeOf(arg0)
    return ret
  }
  imports.wbg.__wbg_getRandomValues_bcb4912f16000dc4 = function () {
    return handleError(function (arg0, arg1) {
      arg0.getRandomValues(arg1)
    }, arguments)
  }
  imports.wbg.__wbg_getTime_46267b1c24877e30 = function (arg0) {
    const ret = arg0.getTime()
    return ret
  }
  imports.wbg.__wbg_get_67b2ba62fc30de12 = function () {
    return handleError(function (arg0, arg1) {
      const ret = Reflect.get(arg0, arg1)
      return ret
    }, arguments)
  }
  imports.wbg.__wbg_get_b9b93047fe3cf45b = function (arg0, arg1) {
    const ret = arg0[arg1 >>> 0]
    return ret
  }
  imports.wbg.__wbg_getwithrefkey_6550b2c093d2eb18 = function (arg0, arg1) {
    const ret = arg0[arg1]
    return ret
  }
  imports.wbg.__wbg_groupactionalreadycompletederror_new = function (arg0) {
    const ret = GroupActionAlreadyCompletedError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_groupactionalreadysignedbyidentityerror_new = function (arg0) {
    const ret = GroupActionAlreadySignedByIdentityError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_groupactiondoesnotexisterror_new = function (arg0) {
    const ret = GroupActionDoesNotExistError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_groupactionnotallowedontransitionerror_new = function (arg0) {
    const ret = GroupActionNotAllowedOnTransitionError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_groupexceedsmaxmemberserror_new = function (arg0) {
    const ret = GroupExceedsMaxMembersError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_grouphastoofewmemberserror_new = function (arg0) {
    const ret = GroupHasTooFewMembersError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_groupmemberhaspowerofzeroerror_new = function (arg0) {
    const ret = GroupMemberHasPowerOfZeroError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_groupmemberhaspoweroverlimiterror_new = function (arg0) {
    const ret = GroupMemberHasPowerOverLimitError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_groupnonunilateralmemberpowerhaslessthanrequiredpowererror_new = function (arg0) {
    const ret = GroupNonUnilateralMemberPowerHasLessThanRequiredPowerError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_grouppositiondoesnotexisterror_new = function (arg0) {
    const ret = GroupPositionDoesNotExistError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_grouprequiredpowerisinvaliderror_new = function (arg0) {
    const ret = GroupRequiredPowerIsInvalidError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_grouptotalpowerlessthanrequirederror_new = function (arg0) {
    const ret = GroupTotalPowerLessThanRequiredError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_has_a5ea9117f258a0ec = function () {
    return handleError(function (arg0, arg1) {
      const ret = Reflect.has(arg0, arg1)
      return ret
    }, arguments)
  }
  imports.wbg.__wbg_identity_new = function (arg0) {
    const ret = Identity.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identityalreadyexistserror_new = function (arg0) {
    const ret = IdentityAlreadyExistsError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identityassetlockprooflockedtransactionmismatcherror_new = function (arg0) {
    const ret = IdentityAssetLockProofLockedTransactionMismatchError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identityassetlocktransactionisnotfounderror_new = function (arg0) {
    const ret = IdentityAssetLockTransactionIsNotFoundError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identityassetlocktransactionoutpointalreadyexistserror_new = function (arg0) {
    const ret = IdentityAssetLockTransactionOutPointAlreadyExistsError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identityassetlocktransactionoutpointnotenoughbalanceerror_new = function (arg0) {
    const ret = IdentityAssetLockTransactionOutPointNotEnoughBalanceError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identityassetlocktransactionoutputnotfounderror_new = function (arg0) {
    const ret = IdentityAssetLockTransactionOutputNotFoundError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identityassetlocktransactionreplayerror_new = function (arg0) {
    const ret = IdentityAssetLockTransactionReplayError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identitycontractnonceoutofboundserror_new = function (arg0) {
    const ret = IdentityContractNonceOutOfBoundsError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identitycreatetransition_new = function (arg0) {
    const ret = IdentityCreateTransition.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identitycredittransfertoselferror_new = function (arg0) {
    const ret = IdentityCreditTransferToSelfError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identitycredittransfertransition_new = function (arg0) {
    const ret = IdentityCreditTransferTransition.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identitycreditwithdrawaltransition_new = function (arg0) {
    const ret = IdentityCreditWithdrawalTransition.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identitydoesnothaveenoughtokenbalanceerror_new = function (arg0) {
    const ret = IdentityDoesNotHaveEnoughTokenBalanceError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identityhasnotagreedtopayrequiredtokenamounterror_new = function (arg0) {
    const ret = IdentityHasNotAgreedToPayRequiredTokenAmountError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identityinsufficientbalanceerror_new = function (arg0) {
    const ret = IdentityInsufficientBalanceError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identityintokenconfigurationnotfounderror_new = function (arg0) {
    const ret = IdentityInTokenConfigurationNotFoundError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identitymemberofgroupnotfounderror_new = function (arg0) {
    const ret = IdentityMemberOfGroupNotFoundError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identitynotfounderror_new = function (arg0) {
    const ret = IdentityNotFoundError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identitynotmemberofgrouperror_new = function (arg0) {
    const ret = IdentityNotMemberOfGroupError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identitypublickey_new = function (arg0) {
    const ret = IdentityPublicKey.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identitypublickeyalreadyexistsforuniquecontractboundserror_new = function (arg0) {
    const ret = IdentityPublicKeyAlreadyExistsForUniqueContractBoundsError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identitypublickeyisdisablederror_new = function (arg0) {
    const ret = IdentityPublicKeyIsDisabledError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identitypublickeyisreadonlyerror_new = function (arg0) {
    const ret = IdentityPublicKeyIsReadOnlyError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identitypublickeywithwitness_new = function (arg0) {
    const ret = IdentityPublicKeyWithWitness.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identitytofreezedoesnotexisterror_new = function (arg0) {
    const ret = IdentityToFreezeDoesNotExistError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identitytokenaccountalreadyfrozenerror_new = function (arg0) {
    const ret = IdentityTokenAccountAlreadyFrozenError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identitytokenaccountfrozenerror_new = function (arg0) {
    const ret = IdentityTokenAccountFrozenError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identitytokenaccountnotfrozenerror_new = function (arg0) {
    const ret = IdentityTokenAccountNotFrozenError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identitytopuptransition_new = function (arg0) {
    const ret = IdentityTopUpTransition.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identitytryingtopaywithwrongtokenerror_new = function (arg0) {
    const ret = IdentityTryingToPayWithWrongTokenError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_identityupdatetransition_new = function (arg0) {
    const ret = IdentityUpdateTransition.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_incompatibledatacontractschemaerror_new = function (arg0) {
    const ret = IncompatibleDataContractSchemaError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_incompatibledocumenttypeschemaerror_new = function (arg0) {
    const ret = IncompatibleDocumentTypeSchemaError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_incompatibleprotocolversionerror_new = function (arg0) {
    const ret = IncompatibleProtocolVersionError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_incompatiblere2patternerror_new = function (arg0) {
    const ret = IncompatibleRe2PatternError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_inconsistentcompoundindexdataerror_new = function (arg0) {
    const ret = InconsistentCompoundIndexDataError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_info_033d8b8a0838f1d3 = function (arg0, arg1, arg2, arg3) {
    console.info(arg0, arg1, arg2, arg3)
  }
  imports.wbg.__wbg_instanceof_ArrayBuffer_e14585432e3737fc = function (arg0) {
    let result
    try {
      result = arg0 instanceof ArrayBuffer
    } catch (_) {
      result = false
    }
    const ret = result
    return ret
  }
  imports.wbg.__wbg_instanceof_Error_4d54113b22d20306 = function (arg0) {
    let result
    try {
      result = arg0 instanceof Error
    } catch (_) {
      result = false
    }
    const ret = result
    return ret
  }
  imports.wbg.__wbg_instanceof_Map_f3469ce2244d2430 = function (arg0) {
    let result
    try {
      result = arg0 instanceof Map
    } catch (_) {
      result = false
    }
    const ret = result
    return ret
  }
  imports.wbg.__wbg_instanceof_Object_7f2dcef8f78644a4 = function (arg0) {
    let result
    try {
      result = arg0 instanceof Object
    } catch (_) {
      result = false
    }
    const ret = result
    return ret
  }
  imports.wbg.__wbg_instanceof_Uint8Array_17156bcf118086a9 = function (arg0) {
    let result
    try {
      result = arg0 instanceof Uint8Array
    } catch (_) {
      result = false
    }
    const ret = result
    return ret
  }
  imports.wbg.__wbg_instantassetlockproof_new = function (arg0) {
    const ret = InstantAssetLockProof.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidactionerror_new = function (arg0) {
    const ret = InvalidActionError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidactioniderror_new = function (arg0) {
    const ret = InvalidActionIdError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidactionnameerror_new = function (arg0) {
    const ret = InvalidActionNameError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidassetlockproofcorechainheighterror_new = function (arg0) {
    const ret = InvalidAssetLockProofCoreChainHeightError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidassetlockprooftransactionheighterror_new = function (arg0) {
    const ret = InvalidAssetLockProofTransactionHeightError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidassetlocktransactionoutputreturnsizeerror_new = function (arg0) {
    const ret = InvalidAssetLockTransactionOutputReturnSizeError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidcompoundindexerror_new = function (arg0) {
    const ret = InvalidCompoundIndexError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invaliddatacontractiderror_new = function (arg0) {
    const ret = InvalidDataContractIdError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invaliddatacontractversionerror_new = function (arg0) {
    const ret = InvalidDataContractVersionError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invaliddescriptionlengtherror_new = function (arg0) {
    const ret = InvalidDescriptionLengthError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invaliddocumentactionerror_new = function (arg0) {
    const ret = InvalidDocumentActionError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invaliddocumenterror_new = function (arg0) {
    const ret = InvalidDocumentError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invaliddocumentrevisionerror_new = function (arg0) {
    const ret = InvalidDocumentRevisionError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invaliddocumenttransitionactionerror_new = function (arg0) {
    const ret = InvalidDocumentTransitionActionError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invaliddocumenttransitioniderror_new = function (arg0) {
    const ret = InvalidDocumentTransitionIdError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invaliddocumenttypeerror_new = function (arg0) {
    const ret = InvalidDocumentTypeError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invaliddocumenttypeindatacontracterror_new = function (arg0) {
    const ret = InvalidDocumentTypeInDataContractError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invaliddocumenttypenameerror_new = function (arg0) {
    const ret = InvalidDocumentTypeNameError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invaliddocumenttyperequiredsecuritylevelerror_new = function (arg0) {
    const ret = InvalidDocumentTypeRequiredSecurityLevelError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidgrouppositionerror_new = function (arg0) {
    const ret = InvalidGroupPositionError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalididentifiererror_new = function (arg0) {
    const ret = InvalidIdentifierError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalididentityassetlockproofchainlockvalidationerrorwasm_new = function (arg0) {
    const ret = InvalidIdentityAssetLockProofChainLockValidationErrorWasm.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalididentityassetlocktransactionerror_new = function (arg0) {
    const ret = InvalidIdentityAssetLockTransactionError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalididentityassetlocktransactionoutputerror_new = function (arg0) {
    const ret = InvalidIdentityAssetLockTransactionOutputError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalididentitycredittransferamounterror_new = function (arg0) {
    const ret = InvalidIdentityCreditTransferAmountError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalididentitycreditwithdrawaltransitionamounterror_new = function (arg0) {
    const ret = InvalidIdentityCreditWithdrawalTransitionAmountError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalididentitycreditwithdrawaltransitioncorefeeerror_new = function (arg0) {
    const ret = InvalidIdentityCreditWithdrawalTransitionCoreFeeError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalididentitycreditwithdrawaltransitionoutputscripterror_new = function (arg0) {
    const ret = InvalidIdentityCreditWithdrawalTransitionOutputScriptError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalididentityerror_new = function (arg0) {
    const ret = InvalidIdentityError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalididentitykeysignatureerror_new = function (arg0) {
    const ret = InvalidIdentityKeySignatureError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalididentitynonceerror_new = function (arg0) {
    const ret = InvalidIdentityNonceError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalididentitypublickeydataerror_new = function (arg0) {
    const ret = InvalidIdentityPublicKeyDataError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalididentitypublickeyiderror_new = function (arg0) {
    const ret = InvalidIdentityPublicKeyIdError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalididentitypublickeysecuritylevelerror_new = function (arg0) {
    const ret = InvalidIdentityPublicKeySecurityLevelError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalididentitypublickeytypeerror_new = function (arg0) {
    const ret = InvalidIdentityPublicKeyTypeError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalididentityrevisionerror_new = function (arg0) {
    const ret = InvalidIdentityRevisionError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalididentityupdatetransitiondisablekeyserror_new = function (arg0) {
    const ret = InvalidIdentityUpdateTransitionDisableKeysError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalididentityupdatetransitionemptyerror_new = function (arg0) {
    const ret = InvalidIdentityUpdateTransitionEmptyError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidindexedpropertyconstrainterror_new = function (arg0) {
    const ret = InvalidIndexedPropertyConstraintError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidindexpropertytypeerror_new = function (arg0) {
    const ret = InvalidIndexPropertyTypeError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidinitialrevisionerror_new = function (arg0) {
    const ret = InvalidInitialRevisionError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidinstantassetlockprooferror_new = function (arg0) {
    const ret = InvalidInstantAssetLockProofError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidinstantassetlockproofsignatureerror_new = function (arg0) {
    const ret = InvalidInstantAssetLockProofSignatureError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidjsonschemareferror_new = function (arg0) {
    const ret = InvalidJsonSchemaRefError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidkeywordcharactererror_new = function (arg0) {
    const ret = InvalidKeywordCharacterError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidkeywordlengtherror_new = function (arg0) {
    const ret = InvalidKeywordLengthError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidsignaturepublickeypurposeerror_new = function (arg0) {
    const ret = InvalidSignaturePublicKeyPurposeError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidsignaturepublickeysecuritylevelerror_new = function (arg0) {
    const ret = InvalidSignaturePublicKeySecurityLevelError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidstatetransitionerror_new = function (arg0) {
    const ret = InvalidStateTransitionError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidstatetransitionsignatureerror_new = function (arg0) {
    const ret = InvalidStateTransitionSignatureError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidstatetransitiontypeerror_new = function (arg0) {
    const ret = InvalidStateTransitionTypeError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidtokenamounterror_new = function (arg0) {
    const ret = InvalidTokenAmountError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidtokenbasesupplyerror_new = function (arg0) {
    const ret = InvalidTokenBaseSupplyError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidtokenclaimnocurrentrewards_new = function (arg0) {
    const ret = InvalidTokenClaimNoCurrentRewards.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidtokenclaimpropertymismatch_new = function (arg0) {
    const ret = InvalidTokenClaimPropertyMismatch.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidtokenclaimwrongclaimant_new = function (arg0) {
    const ret = InvalidTokenClaimWrongClaimant.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidtokenconfigupdatenochangeerror_new = function (arg0) {
    const ret = InvalidTokenConfigUpdateNoChangeError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidtokendistributionblockintervaltooshorterror_new = function (arg0) {
    const ret = InvalidTokenDistributionBlockIntervalTooShortError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidtokendistributionfunctiondividebyzeroerror_new = function (arg0) {
    const ret = InvalidTokenDistributionFunctionDivideByZeroError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidtokendistributionfunctionincoherenceerror_new = function (arg0) {
    const ret = InvalidTokenDistributionFunctionIncoherenceError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidtokendistributionfunctioninvalidparametererror_new = function (arg0) {
    const ret = InvalidTokenDistributionFunctionInvalidParameterError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidtokendistributionfunctioninvalidparametertupleerror_new = function (arg0) {
    const ret = InvalidTokenDistributionFunctionInvalidParameterTupleError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidtokendistributiontimeintervalnotminutealignederror_new = function (arg0) {
    const ret = InvalidTokenDistributionTimeIntervalNotMinuteAlignedError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidtokendistributiontimeintervaltooshorterror_new = function (arg0) {
    const ret = InvalidTokenDistributionTimeIntervalTooShortError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidtokeniderror_new = function (arg0) {
    const ret = InvalidTokenIdError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidtokenlanguagecodeerror_new = function (arg0) {
    const ret = InvalidTokenLanguageCodeError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidtokennamecharactererror_new = function (arg0) {
    const ret = InvalidTokenNameCharacterError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidtokennamelengtherror_new = function (arg0) {
    const ret = InvalidTokenNameLengthError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidtokennotetoobigerror_new = function (arg0) {
    const ret = InvalidTokenNoteTooBigError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidtokenpositionerror_new = function (arg0) {
    const ret = InvalidTokenPositionError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_invalidtokenpositionstateerror_new = function (arg0) {
    const ret = InvalidTokenPositionStateError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_isArray_a1eab7e0d067391b = function (arg0) {
    const ret = Array.isArray(arg0)
    return ret
  }
  imports.wbg.__wbg_isSafeInteger_343e2beeeece1bb0 = function (arg0) {
    const ret = Number.isSafeInteger(arg0)
    return ret
  }
  imports.wbg.__wbg_iterator_9a24c88df860dc65 = function () {
    const ret = Symbol.iterator
    return ret
  }
  imports.wbg.__wbg_jsonschemacompilationerror_new = function (arg0) {
    const ret = JsonSchemaCompilationError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_jsonschemaerror_new = function (arg0) {
    const ret = JsonSchemaError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_keys_5c77a08ddc2fb8a6 = function (arg0) {
    const ret = Object.keys(arg0)
    return ret
  }
  imports.wbg.__wbg_length_a446193dc22c12f8 = function (arg0) {
    const ret = arg0.length
    return ret
  }
  imports.wbg.__wbg_length_ddbfe747b7e4279c = function (arg0) {
    const ret = arg0.length
    return ret
  }
  imports.wbg.__wbg_length_e2d2a49132c1b256 = function (arg0) {
    const ret = arg0.length
    return ret
  }
  imports.wbg.__wbg_log_cad59bb680daec67 = function (arg0, arg1, arg2, arg3) {
    console.log(arg0, arg1, arg2, arg3)
  }
  imports.wbg.__wbg_maingroupisnotdefinederror_new = function (arg0) {
    const ret = MainGroupIsNotDefinedError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_masternodeincorrectvoteridentityiderror_new = function (arg0) {
    const ret = MasternodeIncorrectVoterIdentityIdError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_masternodeincorrectvotingaddresserror_new = function (arg0) {
    const ret = MasternodeIncorrectVotingAddressError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_masternodenotfounderror_new = function (arg0) {
    const ret = MasternodeNotFoundError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_masternodevotealreadypresenterror_new = function (arg0) {
    const ret = MasternodeVoteAlreadyPresentError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_masternodevotedtoomanytimeserror_new = function (arg0) {
    const ret = MasternodeVotedTooManyTimesError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_masternodevotetransition_new = function (arg0) {
    const ret = MasternodeVoteTransition.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_masterpublickeyupdateerror_new = function (arg0) {
    const ret = MasterPublicKeyUpdateError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_maxdocumentstransitionsexceedederror_new = function (arg0) {
    const ret = MaxDocumentsTransitionsExceededError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_maxidentitypublickeylimitreachederror_new = function (arg0) {
    const ret = MaxIdentityPublicKeyLimitReachedError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_message_97a2af9b89d693a3 = function (arg0) {
    const ret = arg0.message
    return ret
  }
  imports.wbg.__wbg_mismatchowneridserror_new = function (arg0) {
    const ret = MismatchOwnerIdsError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_missingdatacontractiderror_new = function (arg0) {
    const ret = MissingDataContractIdError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_missingdefaultlocalizationerror_new = function (arg0) {
    const ret = MissingDefaultLocalizationError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_missingdocumenttransitionactionerror_new = function (arg0) {
    const ret = MissingDocumentTransitionActionError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_missingdocumenttransitiontypeerror_new = function (arg0) {
    const ret = MissingDocumentTransitionTypeError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_missingdocumenttypeerror_new = function (arg0) {
    const ret = MissingDocumentTypeError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_missingidentitypublickeyidserror_new = function (arg0) {
    const ret = MissingIdentityPublicKeyIdsError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_missingmasterpublickeyerror_new = function (arg0) {
    const ret = MissingMasterPublicKeyError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_missingpositionsindocumenttypepropertieserror_new = function (arg0) {
    const ret = MissingPositionsInDocumentTypePropertiesError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_missingpublickeyerror_new = function (arg0) {
    const ret = MissingPublicKeyError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_missingstatetransitiontypeerror_new = function (arg0) {
    const ret = MissingStateTransitionTypeError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_missingtransferkeyerror_new = function (arg0) {
    const ret = MissingTransferKeyError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_modificationofgroupactionmainparametersnotpermittederror_new = function (arg0) {
    const ret = ModificationOfGroupActionMainParametersNotPermittedError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_msCrypto_0a36e2ec3a343d26 = function (arg0) {
    const ret = arg0.msCrypto
    return ret
  }
  imports.wbg.__wbg_name_16617c8e9d4188ac = function (arg0) {
    const ret = arg0.name
    return ret
  }
  imports.wbg.__wbg_new0_f788a2397c7ca929 = function () {
    const ret = new Date()
    return ret
  }
  imports.wbg.__wbg_new_23a2665fac83c611 = function (arg0, arg1) {
    try {
      var state0 = { a: arg0, b: arg1 }
      const cb0 = (arg0, arg1) => {
        const a = state0.a
        state0.a = 0
        try {
          return __wbg_adapter_2343(a, state0.b, arg0, arg1)
        } finally {
          state0.a = a
        }
      }
      const ret = new Promise(cb0)
      return ret
    } finally {
      state0.a = state0.b = 0
    }
  }
  imports.wbg.__wbg_new_31a97dac4f10fab7 = function (arg0) {
    const ret = new Date(arg0)
    return ret
  }
  imports.wbg.__wbg_new_405e22f390576ce2 = function () {
    const ret = new Object()
    return ret
  }
  imports.wbg.__wbg_new_5e0be73521bc8c17 = function () {
    const ret = new Map()
    return ret
  }
  imports.wbg.__wbg_new_78feb108b6472713 = function () {
    const ret = new Array()
    return ret
  }
  imports.wbg.__wbg_new_8a6f238a6ece86ea = function () {
    const ret = new Error()
    return ret
  }
  imports.wbg.__wbg_new_a12002a7f91c75be = function (arg0) {
    const ret = new Uint8Array(arg0)
    return ret
  }
  imports.wbg.__wbg_new_c68d7209be747379 = function (arg0, arg1) {
    const ret = new Error(getStringFromWasm0(arg0, arg1))
    return ret
  }
  imports.wbg.__wbg_new_e0b7b244bd6bfc9b = function (arg0) {
    const ret = new default1(arg0)
    return ret
  }
  imports.wbg.__wbg_newauthorizedactiontakergroupdoesnotexisterror_new = function (arg0) {
    const ret = NewAuthorizedActionTakerGroupDoesNotExistError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_newauthorizedactiontakeridentitydoesnotexisterror_new = function (arg0) {
    const ret = NewAuthorizedActionTakerIdentityDoesNotExistError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_newauthorizedactiontakermaingroupnotseterror_new = function (arg0) {
    const ret = NewAuthorizedActionTakerMainGroupNotSetError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_newnoargs_105ed471475aaf50 = function (arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1))
    return ret
  }
  imports.wbg.__wbg_newtokensdestinationidentitydoesnotexisterror_new = function (arg0) {
    const ret = NewTokensDestinationIdentityDoesNotExistError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_newtokensdestinationidentityoptionrequirederror_new = function (arg0) {
    const ret = NewTokensDestinationIdentityOptionRequiredError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_newwithargs_ab6ffe8cd6c19c04 = function (arg0, arg1, arg2, arg3) {
    const ret = new Function(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3))
    return ret
  }
  imports.wbg.__wbg_newwithbyteoffsetandlength_d97e637ebe145a9a = function (arg0, arg1, arg2) {
    const ret = new Uint8Array(arg0, arg1 >>> 0, arg2 >>> 0)
    return ret
  }
  imports.wbg.__wbg_newwithlength_a381634e90c276d4 = function (arg0) {
    const ret = new Uint8Array(arg0 >>> 0)
    return ret
  }
  imports.wbg.__wbg_next_25feadfc0913fea9 = function (arg0) {
    const ret = arg0.next
    return ret
  }
  imports.wbg.__wbg_next_6574e1a8a62d1055 = function () {
    return handleError(function (arg0) {
      const ret = arg0.next()
      return ret
    }, arguments)
  }
  imports.wbg.__wbg_node_02999533c4ea02e3 = function (arg0) {
    const ret = arg0.node
    return ret
  }
  imports.wbg.__wbg_nodocumentssuppliederror_new = function (arg0) {
    const ret = NoDocumentsSuppliedError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_noncontiguouscontractgrouppositionserror_new = function (arg0) {
    const ret = NonContiguousContractGroupPositionsError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_noncontiguouscontracttokenpositionserror_new = function (arg0) {
    const ret = NonContiguousContractTokenPositionsError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_notimplementedidentitycreditwithdrawaltransitionpoolingerror_new = function (arg0) {
    const ret = NotImplementedIdentityCreditWithdrawalTransitionPoolingError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_notransferkeyforcorewithdrawalavailableerror_new = function (arg0) {
    const ret = NoTransferKeyForCoreWithdrawalAvailableError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_overflowerror_new = function (arg0) {
    const ret = OverflowError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_parse_def2e24ef1252aff = function () {
    return handleError(function (arg0, arg1) {
      const ret = JSON.parse(getStringFromWasm0(arg0, arg1))
      return ret
    }, arguments)
  }
  imports.wbg.__wbg_platformvalueerror_new = function (arg0) {
    const ret = PlatformValueError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_prefundedspecializedbalanceinsufficienterror_new = function (arg0) {
    const ret = PrefundedSpecializedBalanceInsufficientError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_prefundedspecializedbalancenotfounderror_new = function (arg0) {
    const ret = PrefundedSpecializedBalanceNotFoundError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_preprogrammeddistributiontimestampinpasterror_new = function (arg0) {
    const ret = PreProgrammedDistributionTimestampInPastError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_privateKeyToPublicKey_aee37d4e5942584c = function () {
    return handleError(function (arg0, arg1, arg2) {
      const ret = arg0.privateKeyToPublicKey(getArrayU8FromWasm0(arg1, arg2))
      return ret
    }, arguments)
  }
  imports.wbg.__wbg_process_5c1d670bc53614b8 = function (arg0) {
    const ret = arg0.process
    return ret
  }
  imports.wbg.__wbg_protocolversionparsingerror_new = function (arg0) {
    const ret = ProtocolVersionParsingError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_publickeyisdisablederror_new = function (arg0) {
    const ret = PublicKeyIsDisabledError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_publickeysecuritylevelnotmeterror_new = function (arg0) {
    const ret = PublicKeySecurityLevelNotMetError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_push_737cfc8c1432c2c6 = function (arg0, arg1) {
    const ret = arg0.push(arg1)
    return ret
  }
  imports.wbg.__wbg_queueMicrotask_97d92b4fcc8a61c5 = function (arg0) {
    queueMicrotask(arg0)
  }
  imports.wbg.__wbg_queueMicrotask_d3219def82552485 = function (arg0) {
    const ret = arg0.queueMicrotask
    return ret
  }
  imports.wbg.__wbg_randomFillSync_ab2cfe79ebbf2740 = function () {
    return handleError(function (arg0, arg1) {
      arg0.randomFillSync(arg1)
    }, arguments)
  }
  imports.wbg.__wbg_recipientidentitydoesnotexisterror_new = function (arg0) {
    const ret = RecipientIdentityDoesNotExistError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_redundantdocumentpaidforbytokenwithcontractid_new = function (arg0) {
    const ret = RedundantDocumentPaidForByTokenWithContractId.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_require_79b1e9274cde3c87 = function () {
    return handleError(function () {
      const ret = module.require
      return ret
    }, arguments)
  }
  imports.wbg.__wbg_requiredtokenpaymentinfonotseterror_new = function (arg0) {
    const ret = RequiredTokenPaymentInfoNotSetError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_resolve_4851785c9c5f573d = function (arg0) {
    const ret = Promise.resolve(arg0)
    return ret
  }
  imports.wbg.__wbg_revisionabsenterror_new = function (arg0) {
    const ret = RevisionAbsentError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_serializedobjectparsingerror_new = function (arg0) {
    const ret = SerializedObjectParsingError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_setTime_8afa2faa26e7eb59 = function (arg0, arg1) {
    const ret = arg0.setTime(arg1)
    return ret
  }
  imports.wbg.__wbg_set_37837023f3d740e8 = function (arg0, arg1, arg2) {
    arg0[arg1 >>> 0] = arg2
  }
  imports.wbg.__wbg_set_3807d5f0bfc24aa7 = function (arg0, arg1, arg2) {
    arg0[arg1] = arg2
  }
  imports.wbg.__wbg_set_3f1d0b984ed272ed = function (arg0, arg1, arg2) {
    arg0[arg1] = arg2
  }
  imports.wbg.__wbg_set_65595bdd868b3009 = function (arg0, arg1, arg2) {
    arg0.set(arg1, arg2 >>> 0)
  }
  imports.wbg.__wbg_set_8fc6bf8a5b1071d1 = function (arg0, arg1, arg2) {
    const ret = arg0.set(arg1, arg2)
    return ret
  }
  imports.wbg.__wbg_set_bb8cecf6a62b9f46 = function () {
    return handleError(function (arg0, arg1, arg2) {
      const ret = Reflect.set(arg0, arg1, arg2)
      return ret
    }, arguments)
  }
  imports.wbg.__wbg_set_d5bd844db2fd041c = function (arg0, arg1, arg2, arg3) {
    set(arg0, getStringFromWasm0(arg1, arg2), arg3)
  }
  imports.wbg.__wbg_sign_84fff14a54cae54d = function () {
    return handleError(function (arg0, arg1, arg2, arg3, arg4) {
      const ret = arg0.sign(getArrayU8FromWasm0(arg1, arg2), getArrayU8FromWasm0(arg3, arg4))
      return ret
    }, arguments)
  }
  imports.wbg.__wbg_signatureshouldnotbepresenterror_new = function (arg0) {
    const ret = SignatureShouldNotBePresentError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_stack_0ed75d68575b0f3c = function (arg0, arg1) {
    const ret = arg1.stack
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len1 = WASM_VECTOR_LEN
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
  }
  imports.wbg.__wbg_statetransitionisnotactiveerror_new = function (arg0) {
    const ret = StateTransitionIsNotActiveError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_statetransitionmaxsizeexceedederror_new = function (arg0) {
    const ret = StateTransitionMaxSizeExceededError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_static_accessor_GLOBAL_88a902d13a557d07 = function () {
    const ret = typeof global === 'undefined' ? null : global
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret)
  }
  imports.wbg.__wbg_static_accessor_GLOBAL_THIS_56578be7e9f832b0 = function () {
    const ret = typeof globalThis === 'undefined' ? null : globalThis
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret)
  }
  imports.wbg.__wbg_static_accessor_SELF_37c5d418e4bf5819 = function () {
    const ret = typeof self === 'undefined' ? null : self
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret)
  }
  imports.wbg.__wbg_static_accessor_WINDOW_5de37043a91a9c40 = function () {
    const ret = typeof window === 'undefined' ? null : window
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret)
  }
  imports.wbg.__wbg_stringify_b1b3844ae02664a1 = function () {
    return handleError(function (arg0, arg1) {
      const ret = JSON.stringify(arg0, arg1)
      return ret
    }, arguments)
  }
  imports.wbg.__wbg_subarray_aa9065fa9dc5df96 = function (arg0, arg1, arg2) {
    const ret = arg0.subarray(arg1 >>> 0, arg2 >>> 0)
    return ret
  }
  imports.wbg.__wbg_systempropertyindexalreadypresenterror_new = function (arg0) {
    const ret = SystemPropertyIndexAlreadyPresentError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_then_44b73946d2fb3e7d = function (arg0, arg1) {
    const ret = arg0.then(arg1)
    return ret
  }
  imports.wbg.__wbg_toBuffer_16ce9c085c40c537 = function (arg0, arg1) {
    const ret = arg1.toBuffer()
    const ptr1 = passArray8ToWasm0(ret, wasm.__wbindgen_malloc)
    const len1 = WASM_VECTOR_LEN
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
  }
  imports.wbg.__wbg_toString_b46b28b849433558 = function (arg0) {
    const ret = arg0.toString()
    return ret
  }
  imports.wbg.__wbg_tokenalreadypausederror_new = function (arg0) {
    const ret = TokenAlreadyPausedError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_tokenamountunderminimumsaleamount_new = function (arg0) {
    const ret = TokenAmountUnderMinimumSaleAmount.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_tokenburntransition_new = function (arg0) {
    const ret = TokenBurnTransition.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_tokenclaimtransition_new = function (arg0) {
    const ret = TokenClaimTransition.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_tokenconfigupdatetransition_new = function (arg0) {
    const ret = TokenConfigUpdateTransition.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_tokendestroyfrozenfundstransition_new = function (arg0) {
    const ret = TokenDestroyFrozenFundsTransition.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_tokendirectpurchasetransition_new = function (arg0) {
    const ret = TokenDirectPurchaseTransition.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_tokendirectpurchaseuserpricetoolow_new = function (arg0) {
    const ret = TokenDirectPurchaseUserPriceTooLow.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_tokenemergencyactiontransition_new = function (arg0) {
    const ret = TokenEmergencyActionTransition.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_tokenfreezetransition_new = function (arg0) {
    const ret = TokenFreezeTransition.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_tokenispausederror_new = function (arg0) {
    const ret = TokenIsPausedError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_tokenmintpastmaxsupplyerror_new = function (arg0) {
    const ret = TokenMintPastMaxSupplyError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_tokenminttransition_new = function (arg0) {
    const ret = TokenMintTransition.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_tokennoteonlyallowedwhenproposererror_new = function (arg0) {
    const ret = TokenNoteOnlyAllowedWhenProposerError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_tokennotfordirectsale_new = function (arg0) {
    const ret = TokenNotForDirectSale.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_tokennotpausederror_new = function (arg0) {
    const ret = TokenNotPausedError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_tokenpaymentbyburningonlyallowedoninternaltokenerror_new = function (arg0) {
    const ret = TokenPaymentByBurningOnlyAllowedOnInternalTokenError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_tokensetpricefordirectpurchasetransition_new = function (arg0) {
    const ret = TokenSetPriceForDirectPurchaseTransition.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_tokensettingmaxsupplytolessthancurrentsupplyerror_new = function (arg0) {
    const ret = TokenSettingMaxSupplyToLessThanCurrentSupplyError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_tokentransferrecipientidentitynotexisterror_new = function (arg0) {
    const ret = TokenTransferRecipientIdentityNotExistError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_tokentransfertoourselferror_new = function (arg0) {
    const ret = TokenTransferToOurselfError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_tokentransfertransition_new = function (arg0) {
    const ret = TokenTransferTransition.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_tokentransition_new = function (arg0) {
    const ret = TokenTransition.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_tokenunfreezetransition_new = function (arg0) {
    const ret = TokenUnfreezeTransition.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_toomanykeywordserror_new = function (arg0) {
    const ret = TooManyKeywordsError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_toomanymasterpublickeyerror_new = function (arg0) {
    const ret = TooManyMasterPublicKeyError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_tryingtodeleteimmutabledocumenterror_new = function (arg0) {
    const ret = TryingToDeleteImmutableDocumentError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_tryingtoreplaceimmutabledocumenterror_new = function (arg0) {
    const ret = TryingToReplaceImmutableDocumentError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_unauthorizedtokenactionerror_new = function (arg0) {
    const ret = UnauthorizedTokenActionError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_undefinedindexpropertyerror_new = function (arg0) {
    const ret = UndefinedIndexPropertyError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_uniqueindiceslimitreachederror_new = function (arg0) {
    const ret = UniqueIndicesLimitReachedError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_unknownassetlockprooftypeerror_new = function (arg0) {
    const ret = UnknownAssetLockProofTypeError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_unknowndocumentactiontokeneffecterror_new = function (arg0) {
    const ret = UnknownDocumentActionTokenEffectError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_unknowndocumentcreationrestrictionmodeerror_new = function (arg0) {
    const ret = UnknownDocumentCreationRestrictionModeError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_unknowngasfeespaidbyerror_new = function (arg0) {
    const ret = UnknownGasFeesPaidByError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_unknownsecuritylevelerror_new = function (arg0) {
    const ret = UnknownSecurityLevelError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_unknownstoragekeyrequirementserror_new = function (arg0) {
    const ret = UnknownStorageKeyRequirementsError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_unknowntrademodeerror_new = function (arg0) {
    const ret = UnknownTradeModeError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_unknowntransferabletypeerror_new = function (arg0) {
    const ret = UnknownTransferableTypeError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_unsupportedfeatureerror_new = function (arg0) {
    const ret = UnsupportedFeatureError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_unsupportedprotocolversionerror_new = function (arg0) {
    const ret = UnsupportedProtocolVersionError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_unsupportedversionerror_new = function (arg0) {
    const ret = UnsupportedVersionError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_value_cd1ffa7b1ab794f1 = function (arg0) {
    const ret = arg0.value
    return ret
  }
  imports.wbg.__wbg_valueerror_new = function (arg0) {
    const ret = ValueError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_verifySignature_cc5b4d76c3414a9b = function () {
    return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
      const ret = arg0.verifySignature(getArrayU8FromWasm0(arg1, arg2), getArrayU8FromWasm0(arg3, arg4), getArrayU8FromWasm0(arg5, arg6))
      return ret
    }, arguments)
  }
  imports.wbg.__wbg_versionerror_new = function (arg0) {
    const ret = VersionError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_versions_c71aa1626a93e0a1 = function (arg0) {
    const ret = arg0.versions
    return ret
  }
  imports.wbg.__wbg_votepollnotavailableforvotingerror_new = function (arg0) {
    const ret = VotePollNotAvailableForVotingError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_votepollnotfounderror_new = function (arg0) {
    const ret = VotePollNotFoundError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_warn_aaf1f4664a035bd6 = function (arg0, arg1, arg2, arg3) {
    console.warn(arg0, arg1, arg2, arg3)
  }
  imports.wbg.__wbg_withdrawaloutputscriptnotallowedwhensigningwithownerkeyerror_new = function (arg0) {
    const ret = WithdrawalOutputScriptNotAllowedWhenSigningWithOwnerKeyError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbg_wrongpublickeypurposeerror_new = function (arg0) {
    const ret = WrongPublicKeyPurposeError.__wrap(arg0)
    return ret
  }
  imports.wbg.__wbindgen_as_number = function (arg0) {
    const ret = +arg0
    return ret
  }
  imports.wbg.__wbindgen_bigint_from_i128 = function (arg0, arg1) {
    const ret = arg0 << BigInt(64) | BigInt.asUintN(64, arg1)
    return ret
  }
  imports.wbg.__wbindgen_bigint_from_i64 = function (arg0) {
    const ret = arg0
    return ret
  }
  imports.wbg.__wbindgen_bigint_from_str = function (arg0, arg1) {
    const ret = BigInt(getStringFromWasm0(arg0, arg1))
    return ret
  }
  imports.wbg.__wbindgen_bigint_from_u128 = function (arg0, arg1) {
    const ret = BigInt.asUintN(64, arg0) << BigInt(64) | BigInt.asUintN(64, arg1)
    return ret
  }
  imports.wbg.__wbindgen_bigint_from_u64 = function (arg0) {
    const ret = BigInt.asUintN(64, arg0)
    return ret
  }
  imports.wbg.__wbindgen_bigint_get_as_i64 = function (arg0, arg1) {
    const v = arg1
    const ret = typeof (v) === 'bigint' ? v : undefined
    getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true)
    getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true)
  }
  imports.wbg.__wbindgen_boolean_get = function (arg0) {
    const v = arg0
    const ret = typeof (v) === 'boolean' ? (v ? 1 : 0) : 2
    return ret
  }
  imports.wbg.__wbindgen_cb_drop = function (arg0) {
    const obj = arg0.original
    if (obj.cnt-- == 1) {
      obj.a = 0
      return true
    }
    const ret = false
    return ret
  }
  imports.wbg.__wbindgen_closure_wrapper8212 = function (arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 1862, __wbg_adapter_62)
    return ret
  }
  imports.wbg.__wbindgen_debug_string = function (arg0, arg1) {
    const ret = debugString(arg1)
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len1 = WASM_VECTOR_LEN
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
  }
  imports.wbg.__wbindgen_error_new = function (arg0, arg1) {
    const ret = new Error(getStringFromWasm0(arg0, arg1))
    return ret
  }
  imports.wbg.__wbindgen_in = function (arg0, arg1) {
    const ret = arg0 in arg1
    return ret
  }
  imports.wbg.__wbindgen_init_externref_table = function () {
    const table = wasm.__wbindgen_export_4
    const offset = table.grow(4)
    table.set(0, undefined)
    table.set(offset + 0, undefined)
    table.set(offset + 1, null)
    table.set(offset + 2, true)
    table.set(offset + 3, false)
  }
  imports.wbg.__wbindgen_is_bigint = function (arg0) {
    const ret = typeof (arg0) === 'bigint'
    return ret
  }
  imports.wbg.__wbindgen_is_falsy = function (arg0) {
    const ret = !arg0
    return ret
  }
  imports.wbg.__wbindgen_is_function = function (arg0) {
    const ret = typeof (arg0) === 'function'
    return ret
  }
  imports.wbg.__wbindgen_is_null = function (arg0) {
    const ret = arg0 === null
    return ret
  }
  imports.wbg.__wbindgen_is_object = function (arg0) {
    const val = arg0
    const ret = typeof (val) === 'object' && val !== null
    return ret
  }
  imports.wbg.__wbindgen_is_string = function (arg0) {
    const ret = typeof (arg0) === 'string'
    return ret
  }
  imports.wbg.__wbindgen_is_undefined = function (arg0) {
    const ret = arg0 === undefined
    return ret
  }
  imports.wbg.__wbindgen_jsval_eq = function (arg0, arg1) {
    const ret = arg0 === arg1
    return ret
  }
  imports.wbg.__wbindgen_jsval_loose_eq = function (arg0, arg1) {
    const ret = arg0 == arg1
    return ret
  }
  imports.wbg.__wbindgen_memory = function () {
    const ret = wasm.memory
    return ret
  }
  imports.wbg.__wbindgen_number_get = function (arg0, arg1) {
    const obj = arg1
    const ret = typeof (obj) === 'number' ? obj : undefined
    getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true)
    getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true)
  }
  imports.wbg.__wbindgen_number_new = function (arg0) {
    const ret = arg0
    return ret
  }
  imports.wbg.__wbindgen_string_get = function (arg0, arg1) {
    const obj = arg1
    const ret = typeof (obj) === 'string' ? obj : undefined
    const ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len1 = WASM_VECTOR_LEN
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
  }
  imports.wbg.__wbindgen_string_new = function (arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1)
    return ret
  }
  imports.wbg.__wbindgen_throw = function (arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1))
  }

  return imports
}

function __wbg_init_memory (imports, memory) {

}

function __wbg_finalize_init (instance, module) {
  wasm = instance.exports
  __wbg_init.__wbindgen_wasm_module = module
  cachedDataViewMemory0 = null
  cachedUint32ArrayMemory0 = null
  cachedUint8ArrayMemory0 = null

  wasm.__wbindgen_start()
  return wasm
}

function initSync (module) {
  if (wasm !== undefined) return wasm

  if (typeof module !== 'undefined') {
    if (Object.getPrototypeOf(module) === Object.prototype) {
      ({ module } = module)
    } else {
      console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
    }
  }

  const imports = __wbg_get_imports()

  __wbg_init_memory(imports)

  if (!(module instanceof WebAssembly.Module)) {
    module = new WebAssembly.Module(module)
  }

  const instance = new WebAssembly.Instance(module, imports)

  return __wbg_finalize_init(instance, module)
}

async function __wbg_init (module_or_path) {
  if (wasm !== undefined) return wasm

  if (typeof module_or_path !== 'undefined') {
    if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
      ({ module_or_path } = module_or_path)
    } else {
      console.warn('using deprecated parameters for the initialization function; pass a single object instead')
    }
  }

  if (typeof module_or_path === 'undefined') {
    module_or_path = new URL('wasm_drive_verify_bg.wasm', import.meta.url)
  }
  const imports = __wbg_get_imports()

  if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
    module_or_path = fetch(module_or_path)
  }

  __wbg_init_memory(imports)

  const { instance, module } = await __wbg_load(await module_or_path, imports)

  return __wbg_finalize_init(instance, module)
}

export { initSync }
export default __wbg_init
