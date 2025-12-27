
/**
 * Utilitário para gerar Payload do Pix (EMVCo)
 * Referência: Manual de Padrões para Iniciação do Pix (Banco Central do Brasil)
 */

interface PixKeyData {
  key: string;
  name: string;
  city: string;
  amount?: string;
  description?: string; // TXTID
  txid?: string;
}

export class PixPayload {
  private key: string;
  private name: string;
  private city: string;
  private amount: string | undefined;
  private txid: string;

  constructor({ key, name, city, amount, txid = '***' }: PixKeyData) {
    this.key = key;
    this.name = this.normalizeString(name, 25);
    this.city = this.normalizeString(city, 15);
    this.amount = amount ? parseFloat(amount.replace(',', '.')).toFixed(2) : undefined;
    this.txid = txid || '***';
  }

  // Remove acentos e limita tamanho
  private normalizeString(str: string, maxLength: number): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .substring(0, maxLength);
  }

  // Formata campo TLV (Type-Length-Value)
  private formatField(id: string, value: string): string {
    const length = value.length.toString().padStart(2, '0');
    return `${id}${length}${value}`;
  }

  // Calcula CRC16 (CCITT-FALSE / 0xFFFF)
  private getCRC16(payload: string): string {
    const polynomial = 0x1021;
    let crc = 0xFFFF;

    for (let i = 0; i < payload.length; i++) {
        crc ^= payload.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ polynomial;
            } else {
                crc = crc << 1;
            }
        }
    }

    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  }

  public getPayload(): string {
    const payload = [
      this.formatField('00', '01'), // Format Indicator
      this.formatField('26', [      // Merchant Account Information
        this.formatField('00', 'BR.GOV.BCB.PIX'),
        this.formatField('01', this.key),
      ].join('')),
      this.formatField('52', '0000'), // Merchant Category Code
      this.formatField('53', '986'),  // Transaction Currency (BRL)
      this.amount ? this.formatField('54', this.amount) : '', // Transaction Amount
      this.formatField('58', 'BR'),   // Country Code
      this.formatField('59', this.name), // Merchant Name
      this.formatField('60', this.city), // Merchant City
      this.formatField('62', [        // Additional Data Field Template
        this.formatField('05', this.txid)
      ].join('')),
      '6304' // CRC16 ID + Length
    ].join('');

    return `${payload}${this.getCRC16(payload)}`;
  }
}
