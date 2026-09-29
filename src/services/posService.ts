import axiosClient from '../apis/axiosClient';
import type { PosBootstrapData, CheckoutPayload, Invoice, Customer } from '../models/pos.types';

export const posService = {
    async getInitData(): Promise<{ status: string; data: PosBootstrapData }> {
        return axiosClient.get('/pos/init');
    },

    async checkout(payload: CheckoutPayload): Promise<{ status: string; message: string; invoice: Invoice }> {
        return axiosClient.post('/pos/sales', payload);
    },

    async createCustomer(data: { name: string; phone: string; sex?: string }): Promise<{ status: string; message: string; customer: Customer }> {
        return axiosClient.post('/pos/customers', data);
    }
};
