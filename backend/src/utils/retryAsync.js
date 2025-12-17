const retryAsync = async (
  fn,
  {
    retries = 5,
    // delay = 1000,
    onRetry = null
  } = {}
) => {
  let attempt = 0;
  let lastError;

  while (attempt < retries) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      attempt++;

      if (attempt < retries) {
        if (onRetry) {
          onRetry(err, attempt);
        }
        // await new Promise(res => setTimeout(res, delay));
      }
    }
  }

  throw lastError;
};

module.exports = retryAsync;