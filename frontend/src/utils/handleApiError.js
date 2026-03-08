export const handleApiError = (err, defaultMessage = 'Operation failed. Please try again.') => {
  if (err.response?.data?.message) {
    return err.response.data.message;
  }

  const status = err.response?.status;

  if (!err.response && err.request) {
    return 'Network error – cannot reach the server.';
  }
  if (status === 400) return 'Invalid request. Please check your input.';
  if ([409, 422].includes(status)) return 'This action conflicts with existing data.';
  if (status === 429) return 'Too many requests – please wait a moment.';
  if (status >= 500) return 'Service temporarily unavailable.';
  if (status) return `Server responded with error ${status}`;

  return err.message || defaultMessage;
};
