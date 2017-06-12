import sha3 from 'js-sha3'

export default function sha256Hash(data) {
    return sha3.sha3_256
        .create()
        .update(data)
        .hex()
}
