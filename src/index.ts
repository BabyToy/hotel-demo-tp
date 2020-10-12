import os = require("os");
import { expressApp } from "./app";

console.log("Starting service");
const app = expressApp();

app.listen(process.env.PORT || 80, () => {
  console.info(`http://${os.hostname()}:${process.env.PORT || 80}`);
});
