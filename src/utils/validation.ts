export function validateItemData(data: any) {
  if (!data.name || typeof data.name !== 'string') {
    return 'Name is required and must be a string';
  }

  if (!data.status || (data.status !== 'active' && data.status !== 'inactive')) {
    return 'Status is required and must be either "active" or "inactive"';
  }

  return null;
}
