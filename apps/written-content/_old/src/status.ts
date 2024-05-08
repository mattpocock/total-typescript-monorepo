import { useState } from "react";

type State =
  | {
      status: "loading";
    }
  | {
      status: "success";
      data: {
        id: string;
      };
    }
  | {
      status: "error";
      error: Error;
    };

const example3: State = {
  status: "success",
  // Where's the data?!
};

const example4: State = {
  status: "loading",
  // We're loading, but we still have an error?!
  error: new Error("Eek!"),
};

const Component = () => {
  const [state, setState] = useState<State>({
    status: "loading",
  });

  if (state.status === "success") {
    const { data } = state;
  }
};
