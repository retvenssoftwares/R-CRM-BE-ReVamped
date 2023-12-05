import agentRouter from "./agent.routes.js"

  function initialize(app) {
    app.use('/api/Agent', agentRouter);
  }

  export default initialize;  