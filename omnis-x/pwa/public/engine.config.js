/**
 * Separated Frontend Engine Connection Config.
 *
 * When connecting this PWA to an existing OMNIS-X (JADE_PALACE) deployment
 * with a new IP address:
 *
 * - mode: 'relay'  -> Calls /api/* on the PWA server (server.py + engine_connector.py).
 *                     Best for cross-IP setups because server-side relay avoids CORS.
 * - mode: 'direct' -> Calls the OMNIS-X FastAPI engine directly from the browser
 *                     (use this when hosting /public inside the existing JADE_PALACE origin).
 */
export const ENGINE_CONFIG = {
  mode: 'relay', // 'relay' | 'direct'
  engineBaseUrl: 'http://127.0.0.1:8000', // Change to http://<NEW_ENGINE_IP>:8000 for direct mode
  incidentsPath: '/api/v1/incidents',
  healthPath: '/health',
  defaultUserId: 'USR-PRINCIPAL',
  authHeader: '',
};
