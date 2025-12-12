import { exampleRepository } from '@/repository/exampleRepository';
import { Example } from '@/model/example';

export const exampleService = {
  getAllExamples: async (): Promise<Example[]> => {
    const jsonData = await exampleRepository.getAll();
    
    // Mapping JSON -> Modello
    return jsonData.map((item: any) => {
      const example = new Example();
      example.stringa = item.stringa;
      example.numero = item.numero;
      example.nome = item.nome;
      example.cognome = item.cognome;
      example.numeroTelefono = item.numeroTelefono;
      return example;
    });
  },
};