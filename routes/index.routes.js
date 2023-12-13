import agentRouter from "./agent.routes.js"
import AdminRouter from './admin.routes.js'
import GuestRouter from "./guest.routes.js"
import ReportRouter from "./Reports.routes.js"
function initialize(app) {
  app.use("/api/admin", AdminRouter)
  app.use('/api/Agent', agentRouter);
  app.use('/api/Guest',GuestRouter)
  app.use('/api/Report',ReportRouter)
}

export default initialize;  