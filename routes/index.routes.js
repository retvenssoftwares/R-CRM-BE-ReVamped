import agentRouter from "./agent.routes.js"
import AdminRouter from './admin.routes.js'
import GuestRouter from "./guest.router.js"
function initialize(app) {
  app.use("/api/admin", AdminRouter)
  app.use('/api/Agent', agentRouter);
  app.use('/api/Guest',GuestRouter)
}

export default initialize;  