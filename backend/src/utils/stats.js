// Small utility for computing statistics from items array.
function computeStats(items = []) {
  const total = Array.isArray(items) ? items.length : 0;
  const averagePrice = total === 0 ? 0 : (items.reduce((acc, cur) => acc + (cur.price || 0), 0) / total);
  return { total, averagePrice };
}

module.exports = { computeStats };