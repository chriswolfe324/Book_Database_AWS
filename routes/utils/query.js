// routes/utils/query.js
function parseSort(sortStr) {
  // e.g. "title,-dateFinished" => { title: 1, dateFinished: -1 }
  if (!sortStr) return { dateFinished: -1, _id: -1 }; // default newest first
  return sortStr.split(',').reduce((acc, key) => {
    key = key.trim();
    if (!key) return acc;
    if (key.startsWith('-')) acc[key.slice(1)] = -1;
    else acc[key] = 1;
    return acc;
  }, {});
}

function getPagination(query) {
  const page = Math.max(parseInt(query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || '10', 10), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

module.exports = { parseSort, getPagination };
