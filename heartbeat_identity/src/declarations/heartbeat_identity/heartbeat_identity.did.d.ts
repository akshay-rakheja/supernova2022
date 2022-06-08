import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Counter {
  'bump' : ActorMethod<[], bigint>,
  'inc' : ActorMethod<[], undefined>,
  'inc2' : ActorMethod<[], undefined>,
  'read' : ActorMethod<[], bigint>,
}
export interface _SERVICE extends Counter {}
