// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import sha3 from 'js-sha3'

export default function sha256Hash(data) {
    return sha3.sha3_256
        .create()
        .update(data)
        .hex()
}
