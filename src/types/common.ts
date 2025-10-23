export type DomainType = "e" | "t" | null;
export type AgentType = "ecommerce" | "tourism" | null;
export type CommonResponse<T> = {
  code: number;
  message: string;
  data: T;
};
