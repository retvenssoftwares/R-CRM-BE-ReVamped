
import adminRouter from './admin.routes.js'

function initialize(app) {
  app.use('/api/admin', adminRouter);
}

export default initialize;  