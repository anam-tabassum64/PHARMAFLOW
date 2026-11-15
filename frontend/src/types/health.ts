export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  environment: string;
  timestamp: string;
}

export interface ReadinessStatus {
  status: string;
  database: string;
  version: string;
  timestamp: string;
}
