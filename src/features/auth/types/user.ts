export type Role = 'admin' | 'missionario' | 'recantiano' | 'pai' | 'colaborador' | 'benfeitor' | 'visitante' | null;

export interface User {
  id: string;
  name: string;
  role: Role;
}
