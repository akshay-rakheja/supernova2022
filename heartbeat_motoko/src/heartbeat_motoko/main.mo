import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Principal "mo:base/Principal";

actor Alarm {
  // type Time = Int;
  // let now : () -> Time;
  let n = 5;
  var count = 0;



  public shared func ring() : async () {
    // Debug.print(Time);
    Debug.print("Ring!");
    let now = Time.now();
    Debug.print(Int.toText(now));
    // Debug.print("Alarm: " ++ count);
      // Debug.print("Time: " ++ Time.now);
      // count = count + 1;
    // Debug.print(Int.toText(Time.now()));
  };

  system func heartbeat() : async () {
    if (count % n == 0) {
      await ring();
    };
    count += 1;
  }
}