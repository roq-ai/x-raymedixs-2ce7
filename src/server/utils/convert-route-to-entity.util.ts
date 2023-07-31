const mapping: Record<string, string> = {
  knowledges: 'knowledge',
  organizations: 'organization',
  users: 'user',
};

export function convertRouteToEntityUtil(route: string) {
  return mapping[route] || route;
}
