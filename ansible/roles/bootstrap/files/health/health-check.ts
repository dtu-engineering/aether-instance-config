import * as http from 'http';
import { promises as fs } from 'fs';

const PORT = 5001;

interface healthCheckResponse {
  status: string,
  message: string
}

const checkHealth = async (): Promise<healthCheckResponse> => {
  const filePath = '/tmp/bootstrap.log'
  const healthyLogString = 'Aether instance bootstrap SUCCESS'
  const unhealthyLogString = 'Aether instance bootstrap FAILURE'

  try {
    const contents = await fs.readFile(filePath, {encoding:'utf8'})

    if (contents.includes(healthyLogString)){
      return {
        status: "HEALTHY",
        message: "Instance bootstrapping has completed successfully"
      }
    }
    if (contents.includes(unhealthyLogString)){
      return {
        status: "UNHEALTHY",
        message: "Instance bootstrapping has encountered a failure"
      }
    }
    else {
      return {
        status: "PENDING",
        message: "No success or failure signal detected - Instance bootstrapping in progress"
      }
    }
  } catch (error) {
    return {
      status: "ERROR",
      message: "Error detecting status"
    }
  }
}

const requestHandler = async (req:http.IncomingMessage, res:http.ServerResponse) => {
  if (req.url === '/health' && req.method === 'GET') {
    const healthResponse = await checkHealth();

    if (healthResponse.status === 'HEALTHY') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(healthResponse));
    }
    if (healthResponse.status === 'UNHEALTHY') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(healthResponse));
    }
    if (healthResponse.status === 'PENDING') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(healthResponse));
    }
    else if (healthResponse.status === 'ERROR') {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(healthResponse));
    } 
  }
}

const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`Server sucessfully running on port ${PORT}`);
});

