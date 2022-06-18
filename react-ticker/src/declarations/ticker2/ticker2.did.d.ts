import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface _SERVICE {
  'count' : ActorMethod<[], bigint>,
  'count_counter2' : ActorMethod<[], bigint>,
  'count_counter3' : ActorMethod<[], bigint>,
  'counter2_tick' : ActorMethod<[], bigint>,
  'counter3_tick' : ActorMethod<[], bigint>,
  'tick2' : ActorMethod<[], bigint>,
}
