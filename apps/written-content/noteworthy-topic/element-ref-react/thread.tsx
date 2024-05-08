import { useRef, ElementRef, useEffect } from "react";

const Component = () => {
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current?.play();
  }, []);

  return <audio ref={audioRef}>Hello</audio>;
};
