# DeTi: Decentralized Time Travel

Trigger your canister to run periodically, on a schedule, or at any time you designate in the future!

## Inspiration

Internet Computer, by being computer-first, allows functionality that is outside the boundaries of what a data-first blockchain like EVM is capable of. The idea of being self-running - literally unstoppable - is unique and possible through the heartbeat core function. But that function is expensive and kinda hard to use!

At the same time, we were blown away by the work of Jordan Last and his collaborators on [Azle](https://github.com/demergentlabs/azle). This lets one build with all the speed and familiarity of Typescript while compiling to the WASM that IC requires for its code.

There was an opportunity to make a unique IC capability uniquely easy as a service to people making dynamic, decentralized apps.

## What it does

DeTi

## How we built it

## Challenges we ran into

## Accomplishments that we're proud of

## What we learned

## What's next for DeTi: Decentralized Time Travel

## Install

1. Install dfx
2. Install rust
3. Install cmake (usually required on macos)

### Example sequence (MacOs):

```bash
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)" # Install dfx
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh # install Rust
brew install cmake # Get cmake when its missing
```

## To Do

- Add wallet-enabled frontend in react app - hooks?
- connect frontend to our backend
- deploy on IC network
- use stable storage (Ray doesn't jnderstand stable storage yet and when to use it)
- maybe: preupgrade/postupgrade
- Make pulses a DIP-20
- Check for an SDR-ICP price oracle - on the ledger?
- Add argument builder in Azle (using dfinity/candid?)
- Clone plug wallet for

## To Test

- Add ledger interaction for buying pulses with ICP

## Done
