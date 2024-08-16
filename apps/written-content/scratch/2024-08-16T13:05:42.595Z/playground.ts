interface Failure<T> {
  success: false;
  error: T;
}

const Failure = <T>(error: T): Failure<T> => ({
  success: false,
  error,
});

interface Success<T> {
  success: true;
  value: T;
}

const Success = <T>(value: T): Success<T> => ({
  success: true,
  value,
});

const demoFunction = () => {
  const result = Math.random();
  if (result > 0.5) {
    return Failure("A random error occurred");
  }

  return Success(result);
};
