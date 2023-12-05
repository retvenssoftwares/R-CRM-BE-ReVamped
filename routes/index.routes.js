import agentRouter from "./agent.routes.js"
import AdminRouter from './admin.routes.js'
function initialize(app) {
  app.use("/api/admin", AdminRouter)
  app.use('/api/Agent', agentRouter);
}

export default initialize;  