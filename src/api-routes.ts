// Import the domain-check API handler
import domainCheckHandler from './pages/api/domain-check';

// API routes configuration
const apiRoutes = [
  {
    path: '/api/domain-check',
    handler: domainCheckHandler,
    method: 'GET',
  },
];

export default apiRoutes; 