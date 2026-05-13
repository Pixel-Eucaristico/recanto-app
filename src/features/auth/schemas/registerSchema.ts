import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha precisa ter pelo menos 6 caracteres'),
  birthdate: z
    .string()
    .min(1, 'Data de nascimento é obrigatória')
    .refine(
      d => {
        const parsed = Date.parse(d);
        if (isNaN(parsed)) return false;
        return new Date(parsed) <= new Date();
      },
      { message: 'Data de nascimento inválida' },
    ),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

export type LoginInput = z.infer<typeof loginSchema>;
