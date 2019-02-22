export const getRefId = event => {
  const repoName = event.repository.full_name;
  const prNumber = event.number;
  const refId = `${repoName}/${prNumber}`;
  return refId;
};
