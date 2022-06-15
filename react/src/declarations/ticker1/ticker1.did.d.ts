import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface _SERVICE {
  'count' : ActorMethod<[], bigint>,
  'tick2' : ActorMethod<[], bigint>,
}
