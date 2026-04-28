export type Role =
  | 'admin'
  | 'missionario'
  | 'recantiano'
  | 'pai'
  | 'colaborador'
  | 'benfeitor'
  | 'visitante'
  | null;

export interface CurrentUser {
  id: string;
  name: string;
  role: Role;
  features: string[];
}
