# DeTi: Decentralized Time Travel

Trigger your canister to run periodically, on a schedule, or at any time you designate in the future! Built front to back in Typescript.

## Inspiration

Internet Computer, by being computer-first, allows functionality that is outside the boundaries of what a data-first blockchain like EVM is capable of. The idea of being self-running - literally unstoppable - is unique and possible through the heartbeat core function. But that function is expensive and kinda hard to use!

At the same time, we were blown away by the work of Jordan Last and his collaborators at Demergent Labs on [Azle](https://github.com/demergentlabs/azle). This lets one build with all the speed and familiarity of Typescript while compiling to the WASM that IC requires for its code.

There was an opportunity to make a unique IC capability uniquely easy as a service to people making dynamic, decentralized apps. We can imagine use cases across many categories:

- _SocialFi_: DAO governance that acts on the common will after votes by using a time certain for the election. Then the autonomous organization can execute without requiring human intervention.
- _GameFi_: Multiplayer games that move their common world forward independent of individual player actions. For example, a battle royale could keep changing the map on a regular basis to keep the intensity of gameplay.
- _Metaverse_: Autonmous Metaverse NFTs that "behave" even when the user is not around, perhaps even reacting to special events (birthdays, holidays etc)
- _Async DeFi_: Time-limited asynchronous market orders that execute or expire a certain period after going in
- _Public Good_: Dead-man-switches that activate certain actions when a user does not otherwise specify "stop" beforehand, releasing information or executing actions to protect protesters. (Messages are cancellable).
- _Blue Sky_: Skynet's origin from Terminator 3

## What it does

DeTi makes Internet Computers autonomous. DeTi is a decentralized cron scheduling service that will fire off a message to a designated canister on a specific function endpoint on a schedule or at a time designated by the user. We wrangled the date work so you would not have to: run your function every day at 5pm. Or every Tuesday at 9:23pm. Maybe just once next Saturday at 11. No matter your scheduling needs, you can compose them using DeTi.

With DeTi, unstoppable canisters become unstoppable robots. We are imagining applia

## How we built it

We used the experimental Azle TypeScript-based WASM compiler. We learned a ton about how this transpilation works and where the limits are for expressing one's intent using Typescript. We implemented stable storage, pre/post upgrade continuity for dynamically keyed mappings, and a whole new library for figuring out dates and time based on the IC timestamp. Finally, we implemented the internal accounting token as a DIP20-compatible interface to make it easy to operate and store value for future use.

We made our front-end using React (via create-react-app), Tailwind CSS, and React Router. These tools let us build the whole sophisticated app using one language. We think this will be much easier for other people to understand as they look for references on their IC development journey.

## Challenges and Accomplishments

**The IC Factor** We wanted to focus on an aspect of IC that is different from other blockchain technologies. The focus on unstoppability and advancing to autonomy is very IC and very much unlike other distributed ledger systems. IC can not just record - it can _behave_.

**Social Utility**: We're proud of figuring out a path to make the heartbeat more economical as a means of activating IC Canisters. Slowing the main check allows us to manage the vast majority of scheduling use cases while keeping cycle usage in check.

**Technical Accomplishment**: We are also proud of making Azle work in a nontrivial application. The system is wonderful but, like the whole IC ecosystem, very much in development, and figuring out where the quirks were was a technical challenge. But a worthwhile one!

**Giving Back** Finally, being able to leave behind tools for the community furthers our own idea of how we want to contribute to the blockchain community. The NPM package and template are a start and we hope that they will allow others to make progress more quickly.

And we hope they do it with Azle!

## What we learned

We learned that Internet Computer is very different from the other blockchain work we have done! The many chains involved, the semi-private way data is handled, and the complexity of working with a WASM runtime were all new to the team.

We learned to be patient with Azle - the opportunities are enormous, but it rewards careful, try-build-deploy approaches to extension as we learn how it interacts with the underlying Rust systems.

And we learned that the potential of these technologies is ahead of us. We're excited about the future of Internet Computer. DeTi can send us a reminder to celebrate that progress down the road.

## What's next for DeTi: Decentralized Time Travel

We would love to continue to work on this project, which we think would be helpful to a number of projects that are about the unique capabilities of IC.

- Putting on SNS when it is available
- Passing custom arguments to the scheduled messages
- Allow agents - make a canister able to self-schedule using another's pulse account, all from code
- Add DETI to a DEX for easier liquity
- Support identification and wallet software beyond Plug (as cool as it is!)
- Add payment-based DETI minting
- Increase the robustness of DETI to handle scale and be more unstoppable by moving across subnets.

## Thanks

We are grateful to the DFINITY Foundation, Demergent Labs, Psychedelic Studios, and Jordan Last personally for the rapid education we have received in this hackathon.

## How to Install

### Prerequisites

1. Install dfx
2. Install rust
3. Install cmake (usually required on macos)

```bash
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)" # Install dfx
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh # install Rust
brew install cmake # Get cmake when its missing
```

### Installation

```
yarn
yarn deploy
```

Then update the `config.json` files in the `src` of each of the `react` packages to have the front-ends communicate with your back-end .

To deploy to the IC Network:

```
yarn deploy --network ic
```

# Team Management

## To Do TOday

- Make Template for TS Dfinity dev (react + azle)

## To do in general

## To Test

- Form to buy pulses
- Make pulses a DIP-20
- maybe: preupgrade/postupgrade
- Form to schedule
- List of schedules (with a remove button per schedule)
- Public dashboard with login button
- Deploy to IC
- connect frontend to our backend
- Add wallet-enabled frontend in react app - hooks?
- Add ledger interaction for buying pulses with ICP
- use stable storage (Ray doesn't jnderstand stable storage yet and when to use it)
- FIX backend
- Add support for day of month recurring events (50%)

## Done

## Willnotdo

- Clone plug wallet for local testing?
- Check for an SDR-ICP price oracle - on the ledger?
- Add argument builder in Azle (using dfinity/candid?)
