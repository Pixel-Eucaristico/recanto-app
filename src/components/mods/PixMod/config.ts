
import { ModConfig } from '@/types/cms-types';

export const pixModConfig: ModConfig = {
  id: 'PixMod',
  name: 'Bloco Pix',
  description: 'Exibe QR Code Pix e dados de pagamento',
  icon: 'QrCode',
  category: 'other',
  props: [
    {
      name: 'pixKey',
      label: 'Chave Pix',
      type: 'text',
      required: true,
      placeholder: 'CPF, CNPJ, Email ou Aleatória',
      description: 'Chave para receber o pagamento',
    },
    {
      name: 'name',
      label: 'Nome do Beneficiário',
      type: 'text',
      required: true,
      placeholder: 'Nome completo sem acentos',
    },
    {
      name: 'city',
      label: 'Cidade',
      type: 'text',
      required: true,
      placeholder: 'Cidade da conta bancária',
    },
    {
      name: 'amount',
      label: 'Valor (Opcional)',
      type: 'number',
      placeholder: '0.00',
      description: 'Valor fixo da cobrança. Deixe vazio para livre.',
    },
    {
      name: 'description',
      label: 'Descrição / Identificador',
      type: 'text',
      placeholder: 'Doação Site',
    },
    {
      name: 'title',
      label: 'Título',
      type: 'text',
      default: 'Faça sua contribuição',
    }
  ],
};
