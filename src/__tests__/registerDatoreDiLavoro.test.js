/**
 * UC_RegistrazioneDatoreDiLavoro
 * Test Case totali: 10
 */

describe("Test ambiente Jest", () => {
    test("Jest funziona correttamente", () => {
      expect(true).toBe(true);
    });
  });
  
  /* ---------------- MOCK LOGICA DI BUSINESS ---------------- */
  
  function registraDatoreDiLavoro({ email, password, azienda }) {
    // Email
    if (!email) throw new Error("Email vuota");
    if (!email.includes("@")) throw new Error("Formato email non valido");
    if (email === "gia@registrata.it") throw new Error("Email già registrata");
  
    // Password
    if (!password) throw new Error("Password vuota");
    if (password.length < 8) throw new Error("Password troppo corta");
    if (!/[A-Z]/.test(password)) throw new Error("Password senza maiuscola");
    if (!/[0-9]/.test(password)) throw new Error("Password senza numero");
    if (!/[!@#$%^&*]/.test(password))
      throw new Error("Password senza carattere speciale");
  
    // Azienda
    if (!azienda) throw new Error("Azienda mancante");
  
    return { success: true };
  }
  
  /* ---------------- EMAIL (TC 1–3) ---------------- */
  
  describe("UC_RegistrazioneDatoreDiLavoro – Test Email", () => {
    test("TC_RegistrazioneDatore_1 – Email vuota", () => {
      expect(() =>
        registraDatoreDiLavoro({
          email: "",
          password: "Password1!",
          azienda: "ACME",
        })
      ).toThrow("Email vuota");
    });
  
    test("TC_RegistrazioneDatore_2 – Email già registrata", () => {
      expect(() =>
        registraDatoreDiLavoro({
          email: "gia@registrata.it",
          password: "Password1!",
          azienda: "ACME",
        })
      ).toThrow("Email già registrata");
    });
  
    test("TC_RegistrazioneDatore_3 – Email formato non valido", () => {
      expect(() =>
        registraDatoreDiLavoro({
          email: "emailnonvalida",
          password: "Password1!",
          azienda: "ACME",
        })
      ).toThrow("Formato email non valido");
    });
  });
  
  /* ---------------- PASSWORD PARTE 1 (TC 4–6) ---------------- */
  
  describe("UC_RegistrazioneDatoreDiLavoro – Test Password (parte 1)", () => {
    test("TC_RegistrazioneDatore_4 – Password vuota", () => {
      expect(() =>
        registraDatoreDiLavoro({
          email: "test@mail.it",
          password: "",
          azienda: "ACME",
        })
      ).toThrow("Password vuota");
    });
  
    test("TC_RegistrazioneDatore_5 – Password troppo corta", () => {
      expect(() =>
        registraDatoreDiLavoro({
          email: "test@mail.it",
          password: "Ab1!",
          azienda: "ACME",
        })
      ).toThrow("Password troppo corta");
    });
  
    test("TC_RegistrazioneDatore_6 – Password senza lettera maiuscola", () => {
      expect(() =>
        registraDatoreDiLavoro({
          email: "test@mail.it",
          password: "password1!",
          azienda: "ACME",
        })
      ).toThrow("Password senza maiuscola");
    });
  });
  
  /* ---------------- PASSWORD PARTE 2 (TC 7–8) ---------------- */
  
  describe("UC_RegistrazioneDatoreDiLavoro – Test Password (parte 2)", () => {
    test("TC_RegistrazioneDatore_7 – Password senza numero", () => {
      expect(() =>
        registraDatoreDiLavoro({
          email: "test@mail.it",
          password: "Password!",
          azienda: "ACME",
        })
      ).toThrow("Password senza numero");
    });
  
    test("TC_RegistrazioneDatore_8 – Password senza carattere speciale", () => {
      expect(() =>
        registraDatoreDiLavoro({
          email: "test@mail.it",
          password: "Password1",
          azienda: "ACME",
        })
      ).toThrow("Password senza carattere speciale");
    });
  });
  
  /* ---------------- AZIENDA + SUCCESSO (TC 9–10) ---------------- */
  
  describe("UC_RegistrazioneDatoreDiLavoro – Test Azienda e Successo", () => {
    test("TC_RegistrazioneDatore_9 – Azienda mancante", () => {
      expect(() =>
        registraDatoreDiLavoro({
          email: "test@mail.it",
          password: "Password1!",
          azienda: "",
        })
      ).toThrow("Azienda mancante");
    });
  
    test("TC_RegistrazioneDatore_10 – Registrazione valida", () => {
      const result = registraDatoreDiLavoro({
        email: "valida@mail.it",
        password: "Password1!",
        azienda: "ACME",
      });
  
      expect(result.success).toBe(true);
    });
  });
  