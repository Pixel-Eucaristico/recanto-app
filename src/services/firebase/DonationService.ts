import { BaseFirebaseService } from './BaseFirebaseService';
import { Donation } from '@/types/firebase-entities';

class DonationService extends BaseFirebaseService<Donation> {
  constructor() {
    super('donations');
  }

  /**
   * Busca doações por status
   */
  async getDonationsByStatus(status: Donation['status']): Promise<Donation[]> {
    return this.queryByField('status', status);
  }

  /**
   * Busca doações de um doador específico
   */
  async getDonationsByDonor(donorId: string): Promise<Donation[]> {
    return this.queryByField('donor_id', donorId);
  }

  /**
   * Busca doações por método
   */
  async getDonationsByMethod(method: Donation['method']): Promise<Donation[]> {
    return this.queryByField('method', method);
  }

  /**
   * Calcula total de doações por período
   */
  async getTotalByPeriod(startDate: string, endDate: string): Promise<number> {
    const allDonations = await this.list();
    const filtered = allDonations.filter(
      donation => donation.date >= startDate && donation.date <= endDate
    );
    return filtered.reduce((total, donation) => total + donation.value, 0);
  }

  /**
   * Confirma uma doação
   */
  async confirmDonation(donationId: string): Promise<Donation | null> {
    return this.update(donationId, { status: 'confirmado' } as Partial<Donation>);
  }

  /**
   * Cancela uma doação
   */
  async cancelDonation(donationId: string): Promise<Donation | null> {
    return this.update(donationId, { status: 'cancelado' } as Partial<Donation>);
  }
}

export const donationService = new DonationService();
export default donationService;
