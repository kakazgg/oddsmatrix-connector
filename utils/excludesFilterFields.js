const excludeFields = (query) => {
  const fields = ["sort", "limit", "page", "collection"];
  fields.forEach((field) => {
    delete query[field];
  });
  return query;
};

module.exports = excludeFields;
