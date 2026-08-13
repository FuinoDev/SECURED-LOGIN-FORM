import "dotenv/config";
import app from "./app.js";
import { env } from "./config/env.js";
app.listen(env.PORT, () => {
    console.info(`Server listening on http://localhost:${env.PORT}`);
});
//# sourceMappingURL=index.js.map