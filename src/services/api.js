const API_URL = import.meta.env.VITE_API_URL;

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : { message: (await response.text()).replace(/<[^>]*>/g, '').trim() };

  if (!response.ok) {
    const error = new Error(
      data.message || `HTTP Error: ${response.status}`
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const authAPI = {
  login: (username, password) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  logout: () =>
    apiCall('/auth/logout', {
      method: 'POST',
    }),
};

export const serviceAPI = {
  getAll: () => apiCall('/services'),
  getById: (id) => apiCall(`/services/${id}`),
};

export const transactionAPI = {
  startService: (serviceId) =>
    apiCall('/transactions/start', {
      method: 'POST',
      body: JSON.stringify({ service_id: serviceId }),
    }),

  completeService: (transactionId) =>
    apiCall(`/transactions/${transactionId}/complete`, {
      method: 'POST',
    }),

  recordPayment: (transactionId, paymentData) =>
    apiCall(`/transactions/${transactionId}/payment`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),
};