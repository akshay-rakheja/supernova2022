import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Text "mo:base/Text";

shared(msg) actor class Counter() {
  let owner = msg.caller;

  // public shared({ msg }) func whoami(): async Text {
  //     // Debug.print(Principal.toText(caller.principal));
  //     return Principal.toText(msg.caller);
  //   };

  var count = 0;

  public shared(msg) func inc() : async () {
    assert (owner == msg.caller);
    count += 1;
  };

  public shared(msg) func inc2() : async () {
    assert (owner != msg.caller);
    count += 1;
  };

  public func read() : async Nat {
    count
  };

  public shared(msg) func bump() : async Nat {
    assert (owner == msg.caller);
    count := 1;
    count;
  };
  // whoami();
};
