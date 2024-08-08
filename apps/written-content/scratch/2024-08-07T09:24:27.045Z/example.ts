import { useState } from "react";

const [index, setIndex] = useState(0);

type MyComponentProps = {
  setIndex: React.Dispatch<React.SetStateAction<number>>;
};
