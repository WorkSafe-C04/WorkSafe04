export enum Role {
  DATORE_LAVORO = "Datore di lavoro",
  DIPENDENTE = "Dipendente",
  MANUTENTORE = "Manutentore",
  RESPONSABILE_SICUREZZA = "Responsabile sicurezza"
}

export const isValidRole = (role: string): role is Role => {
  return Object.values(Role).includes(role as Role);
};
