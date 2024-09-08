// 'throws' keyword

function mightThrow(): string, throws "my-custom-error" {
  if (Math.random() > 0.5) {
    throw "my-custom-error";
  }

  return "Success!";
}