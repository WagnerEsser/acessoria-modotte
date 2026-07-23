export type SecurityHeader = {
  key: string;
  value: string;
};

export function getContentSecurityPolicy(isProduction: boolean): string;
export function getSecurityHeaders(isProduction: boolean): SecurityHeader[];
