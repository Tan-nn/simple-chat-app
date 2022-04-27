import { ServerX } from "./server";

const server = new ServerX();

server.listen(port => {
  console.log(`Server is listening on http://localhost:${port}`);
});
