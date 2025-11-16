// Artillery.js processor for custom logic
module.exports = {
  generateRandomId: () => {
    return Math.random().toString(36).substring(7);
  },
};

