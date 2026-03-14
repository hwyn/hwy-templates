export interface RouteNode {
  kind: string;
  label: string;
  tokenId: string;
  excluded?: boolean;
  self?: boolean;
}

export interface RouteCard {
  method: string;
  pattern: string;
  nodes: RouteNode[];
  removed: RouteNode[];
  verifyLinks: { label: string; href: string }[];
  tryEndpoint: { method: string; path: string };
}
