
import AdminRouter from './admin.routes.js'
  function initialize(app) {
 app.use("/api/admin",AdminRouter)
  }

export default initialize;  