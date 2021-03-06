// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

/* eslint-disable camelcase */
import { sha3_256 } from 'js-sha3'

export default function sha256Hash(data) {
    return sha3_256
        .create()
        .update(data)
        .hex()
}
/* eslint-enable camelcase */
