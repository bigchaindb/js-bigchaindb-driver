# JavaScript quickstart for BigchainDB

> :bangbang: High chance of :fire: and :rage: ahead if you expect this to be production-ready.

> :bangbang: **ONLY** (and I mean **_only_**) supports BigchainDB Server 0.9

Some naive helpers to get you on your way to making some transactions :boom:, if you'd like to use
[BigchainDB](https://github.com/bigchaindb/bigchaindb) with JavaScript.

Aimed to support usage in browsers or node; if it doesn't, well, I don't know what to say except
it's probably you :smirk:. Use at your own risk :rocket:. At least I can tell you it's ES∞+, so
you'll probably need a babel here and a bundler there (or use [one of the built versions](./dist)),
of which I expect you'll know quite well ([otherwise, go check out js-reactor :wink:](https://github.com/bigchaindb/js-reactor)).

## Getting started

Srs, just read through [index.js](./index.js) and see if you can make any sense of it.

You may also be interested in a [long-form example with actual code](#example).

The expected flow for making transactions:

1. Go get yourself some keypairs! Just make a `new Keypair()` (or a whole bunch of them, nobody's
   counting :sunglasses:).
1. Go get yourself a condition! `makeEd25519Condition()` should do the trick :sparkles:.
1. Go wrap that condition as an output (don't worry about the *why*)! `makeOutput()` no sweat
   :muscle:.
1. (**Optional**) You've got everyting you need, except for an asset. Maybe define one (any
   JSON-serializable object will do).
1. Time to get on the rocket ship, baby. `makeCreateTransaction()` your way to lifelong glory and
   fame :clap:!
1. Ok, now you've got a transaction, but we need you to *sign* (`signTransaction()`) it cause, you
   know... cryptography and `¯\_(ツ)_/¯`.
1. Alright, sick dude, you've *finally* got everything you need to `POST` to a server. Phew
   :sweat_drops:. Go `fetch()` your way to business, start:point_up:life4evar!

...

Alright, alright, so you've made a couple transactions. Now what? Do I hear you saying
"<sub>Transfer them??</sub>" No problem, brotha, I gotcha covered :neckbeard:.

1. Go get some more outputs (wrapping conditions), maybe based on some new made-up friends (i.e.
   keypairs).
1. Go make a transfer transaction, using the transaction you want to *spend* (i.e. you can fulfill)
   in `makeTransferTransaction()` :v:. *If you're not sure what any of this means (and you're as
   confused as I think you are right now), you might wanna go check out [this](https://docs.bigchaindb.com/projects/server/en/latest/data-models/crypto-conditions.html)
   and [this](https://docs.bigchaindb.com/projects/py-driver/en/latest/usage.html#asset-transfer)
   and [this](https://tools.ietf.org/html/draft-thomas-crypto-conditions-01) first.*
1. Sign that transaction with `signTransaction()`!
1. `POST` to the server, and watch the :dollar:s drop, man.

## Needs for speeds

This implementation plays "safe" by using JS-native (or downgradable) libraries for its
crypto-related functions to keep compatabilities with the browser. If that makes you :unamused: and
you'd rather go :godmode: with some :zap: :zap:, you can try using some of these to go as fast as a
:speedboat: --:surfing_man: :

* [chloride](https://github.com/dominictarr/chloride), or its underlying [sodium](https://github.com/paixaop/node-sodium)
  library
* [node-sha3](https://github.com/phusion/node-sha3) -- **MAKE SURE** to use [steakknife's fork](https://github.com/steakknife/node-sha3)
  if [the FIPS 202 upgrade](https://github.com/phusion/node-sha3/pull/25) hasn't been merged
  (otherwise, you'll run into all kinds of hashing problems)

## :rotating_light: WARNING WARNING WARNING :rotating_light:

> Crypto-conditions

Make sure you keep using a crypto-conditions implementation that implements the older v1 draft (e.g.
[`five-bells-condition@v3.3.1`](https://github.com/interledgerjs/five-bells-condition/releases/tag/v3.3.1)).
BigchainDB Server 0.9 does not implement the newer version of the spec and **WILL** fail if you to
use a newer implementation of crypto-conditions.

> SHA3

Make sure to use a SHA3 implementation that has been upgraded as per [FIPS 202](http://csrc.nist.gov/publications/drafts/fips-202/fips_202_draft.pdf).
Otherwise, the hashes you generate **WILL** be invalid in the eyes of the BigchainDB Server.

> Ed25519

If you do end up replacing `tweetnacl` with `chloride` (or any other Ed25519 package), you might
want to double check that it gives you a correct public/private (or verifying/signing, if they use
that lingo) keypair.

An example BigchainDB Server-generated keypair (encoded in base58):

- Public: "DjPMHDD9JtgypDKY38mPz9f6owjAMAKhLuN1JfRAat8C"
- Private: "7Gf5YRch2hYTyeLxqNLgTY63D9K5QH2UQ7LYFeBGuKvo"

Your package should be able to take in the decoded version of the **private** key and return you the
same **public** key (once you encode that to base58).

-------

## Example

OK, OK, I gotcha, you'd rather see some *actual* code rather than a giant list of steps that don't
mean anything. :point_down: is for you.

```js
import {
    Ed25519Keypair,
    makeEd25519Condition,
    makeOutput,
    makeCreateTransaction,
    makeTransferTransaction,
    signTransaction,
} from 'js-bigchaindb-quickstart'; // Or however you'd like to import it

/**********************
 * CREATE transaction *
 **********************/
// First, create a keypair for our new friend, Ash (let's be real--who would you rather catch some
// Pokemon: Alice or the Ketchum man himself?)
const ash = new Ed25519Keypair();

console.log(ash.publicKey); // something like "DjPMHDD9JtgypDKY38mPz9f6owjAMAKhLuN1JfRAat8C"
console.log(ash.privateKey); // something like "7Gf5YRch2hYTyeLxqNLgTY63D9K5QH2UQ7LYFeBGuKvo"

// Let's get an output and condition that lets Ash be the recipient of the new asset we're creating
const ashCondition = new makeEd25519Condition(ash.publicKey);
const ashOutput = new makeOutput(ashCondition);

console.log(ashOutput);
/* Something like
{
    "amount": 1,
    "condition": {
        "details": {
            "signature": null,
            "type_id": 4,
            "type": "fulfillment",
            "bitmask": 32,
            "public_key": "DjPMHDD9JtgypDKY38mPz9f6owjAMAKhLuN1JfRAat8C"
        },
        "uri": "cc:4:20:vSfobaaMSP52nxnVkPiLMysCTR-t8JpjbWIdU6SvRYU:96"
    },
    "public_keys": [
        "DjPMHDD9JtgypDKY38mPz9f6owjAMAKhLuN1JfRAat8C"
    ]
}
*/

// Let's make an asset, to pretend this isn't boring.
const pokeAsset = {
    'name': 'Pikachu',
    'trait': 'Will never, ever, EVAARRR leave your back'
};

const noMetadata = null; // Let's ignore that meta-stuff for now

// Now let's go give Ash his beloved Pikachu
const createPokeTx = makeCreateTransaction(pokeAsset, noMetadata, [ashOutput], ash.publicKey);

console.log(createPokeTx);
/* Something like
{
    "id": "38acf7a938a39be335afc8e7300468b981a29813d52938104ba3badfe21470c9",
    "operation": "CREATE",
    "outputs": [
        {
            "amount": 1,
            "condition": {
                "details": {
                    "signature": null,
                    "type_id": 4,
                    "type": "fulfillment",
                    "bitmask": 32,
                    "public_key": "DjPMHDD9JtgypDKY38mPz9f6owjAMAKhLuN1JfRAat8C"
                },
                "uri": "cc:4:20:vSfobaaMSP52nxnVkPiLMysCTR-t8JpjbWIdU6SvRYU:96"
            },
            "public_keys": [
                "DjPMHDD9JtgypDKY38mPz9f6owjAMAKhLuN1JfRAat8C"
            ]
        }
    ],
    "inputs": [
        {
            "fulfillment": null,
            "fulfills": null,
            "owners_before": [
                "DjPMHDD9JtgypDKY38mPz9f6owjAMAKhLuN1JfRAat8C"
            ]
        }
    ],
    "metadata": null,
    "asset": {
        "data": {
            "name": "Pikachu",
            "trait": "Will never, ever, EVAARRR leave your back"
        }
    },
    "version": "0.9"
}
*/

// Let's sign this thing to make it legit! (Let's call Ash the "issuer", but a registered PokeCorp
// could be the one issuing instead)
const signedCreateTx = signTransaction(createPokeTx, ash.privateKey);

console.log(signedPokeTx);
/* Something like
{
    "id": "38acf7a938a39be335afc8e7300468b981a29813d52938104ba3badfe21470c9",
    "operation": "CREATE",
    "outputs": [
        {
            "amount": 1,
            "condition": {
                "details": {
                    "signature": null,
                    "type_id": 4,
                    "type": "fulfillment",
                    "bitmask": 32,
                    "public_key": "DjPMHDD9JtgypDKY38mPz9f6owjAMAKhLuN1JfRAat8C"
                },
                "uri": "cc:4:20:vSfobaaMSP52nxnVkPiLMysCTR-t8JpjbWIdU6SvRYU:96"
            },
            "public_keys": [
                "DjPMHDD9JtgypDKY38mPz9f6owjAMAKhLuN1JfRAat8C"
            ]
        }
    ],
    "inputs": [
        {
            "fulfillment": "cf:4:vSfobaaMSP52nxnVkPiLMysCTR-t8JpjbWIdU6SvRYWj-cp1qb1vsTSt_775cGe-NQFxgyUQvcPx1nWkJRgXhMvTk2vN2QJU_nd2DgeTbIcWBF-8-N1SH2WqQLsXJLcP",
            "fulfills": null,
            "owners_before": [
                "DjPMHDD9JtgypDKY38mPz9f6owjAMAKhLuN1JfRAat8C"
            ]
        }
    ],
    "metadata": null,
    "asset": {
        "data": {
            "name": "Pikachu",
            "trait": "Will never, ever, EVAARRR leave your back"
        }
    },
    "version": "0.9"
}
*/

// Alright, now you've got yourself a valid transaction and you can do some crazy thing like send it
// over to a BigchainDB node. I'll leave that as an exercise for you ;).

/************************
 * TRANSFER transaction *
 ************************/
// Alright, let's get Ash some imaginary friends (remember Brock? Neither do I)
const brock = new Ed25519Keypair(); // public: "H8ZVy61CCKh5VQV9nzzzggNW8e5CyTbSiegpdLqLSmqi", private: "5xoYuPP92pznaGZF9KLsyAdR5C7yDU79of1KA9UK4qKS"

// Let's pretend that, for the sake of this example, Ash can actually part with Pikachu. Let's trade
// Pikachu to Brock (we won't be getting anything back, but if it helps, you can pretend Brock'll
// give Ash some help with his love life).
const brockCondition = new makeEd25519Condition(brock.publicKey);
const brockOutput = new makeOutput(brockCondition);

// Let's create the TRANSFER transaction cementing this trade. We'll use the "unspent" CREATE
// transaction that assigned Pikachu to Ash as an input to this TRANSFER.
// Note that we'll keep ignoring that metadata stuff.
// Also note that we could use either `createPokeTx` (unsigned) or `signedCreateTx` (signed) here
// for the input transaction. Either way, we'll be fulfilling the first (and only) output set in it.
const fulfilledOutputIndex = 0;
const transferPokeTx = makeTransferTransaction(createPokeTx, noMetadata, [brockOutput], fulfilledOutputIndex);

// OK, let's sign this TRANSFER (Ash has to, as he's the one currently in "control" of Pikachu)
const signedTransferTx = signTransaction(transferPokeTx, ash.privateKey);

console.log(signedTransferTx);
/* If everything went well, you should get something like this
{
    "id": "0876962a40479e171135cd92dbae7f0216f2691561b56a579cff631371d4d128",
    "operation": "TRANSFER",
    "outputs": [
        {
            "amount": 1,
            "condition": {
                "details": {
                    "signature": null,
                    "type_id": 4,
                    "type": "fulfillment",
                    "bitmask": 32,
                    "public_key": "H8ZVy61CCKh5VQV9nzzzggNW8e5CyTbSiegpdLqLSmqi"
                },
                "uri": "cc:4:20:76rNv-DAIjZC0-68Gl0KEuDpcJRpCAAQXxvVbTvQAxE:96"
            },
            "public_keys": [
                "H8ZVy61CCKh5VQV9nzzzggNW8e5CyTbSiegpdLqLSmqi"
            ]
        }
    ],
    "inputs": [
        {
            "fulfillment": "cf:4:vSfobaaMSP52nxnVkPiLMysCTR-t8JpjbWIdU6SvRYU8UJKi0Oq7QoCXIHuiWEYzxfgVEYs9HHtDIWBSkq1uvMX6l7VKwUCrK93k6JMNVBA8djOa5UGfDDF49xLVEgQI",
            "fulfills": {
                "output": 0,
                "txid": "38acf7a938a39be335afc8e7300468b981a29813d52938104ba3badfe21470c9"
            },
            "owners_before": [
                "DjPMHDD9JtgypDKY38mPz9f6owjAMAKhLuN1JfRAat8C"
            ]
        }
    ],
    "metadata": null,
    "asset": {
        "id": "38acf7a938a39be335afc8e7300468b981a29813d52938104ba3badfe21470c9"
    },
    "version": "0.9"
}
*/

// Assuming you figured out how to send a transaction to a BigchainDB node, and that the federation
// you sent it to has validated the CREATE transaction you sent, you should now be able to cement
// the TRANSFER of Pikachu to Brock by sending `signedTransferTx` to a node in the same federation.



=========================================================================================================



                  /*************************************************************
                   *                                                           *
                   *                  ~~~   CHALLENGE   ~~~                    *
                   *                                                           *
                   *   So who's making the decentralized version of Pokemon?   *
                   *                    (cause I want in)                      *
                   *                                                           *
                   *************************************************************/
```
