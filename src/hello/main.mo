actor {
  public func greet(name : Text) : async Text {
    return "Hello, " # name # "!";
  };
  public func farewell(name : Text) : async Text {
    return "Goodbye, " # name # "!";
  };
};
