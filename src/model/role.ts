export enum Role {
  DATORE_LAVORO = "DatoreDiLavoro",
  DIPENDENTE = "Dipendente",
  MANUTENTORE = "Manutentore",
  RESPONSABILE_SICUREZZA = "ResponsabileSicurezza"
}

export const isValidRole = (role: string): role is Role => {
  return Object.values(Role).includes(role as Role);
};
