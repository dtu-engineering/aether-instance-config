import * as http from 'http';
import { promises as fs } from 'fs';

const PORT = 5001;

interface healthCheckResponse {
  status: string,
  message: string
}

const checkHealth = async (): Promise<healthCheckResponse> => {
  const filePath = '/var/tmp/aether_health_status.log'
  const healthyLogString = '[INFO]'
  const unhealthyLogString = '[FATAL]'
  const disabledCheckLogString = 'AETHER_HEALTH_CHECK_ENABLED=false'

  try {
    const contents = await fs.readFile(filePath, {encoding:'utf8'})

    if (contents.includes(disabledCheckLogString)){
      return {
        status: "NONE",
        message: "Successful health checks are not required."
      }
    }
    if (contents.includes(healthyLogString)){
      return {
        status: "HEALTHY",
        message: "Aether environment is healthy. All provisioning has completed successfully."
      }
    }
    if (contents.includes(unhealthyLogString)){
      return {
        status: "UNHEALTHY",
        message: "Aether environment is unhealthy. A fatal error has been encountered during instance userdata execution."
      }
    }
    else {
      return {
        status: "PENDING",
        message: "Aether environment configuration in progress."
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
    if (healthResponse.status === 'NONE') {
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

