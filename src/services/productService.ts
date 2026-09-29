import apiClient from '../apis/apiClient';
import type { ApiResponse } from '../apis/apiResponse';
import type { Product, Category } from '../models';

export const productService = {
  // ១. ទាញយក Products ទាំងអស់ (អាច filter តាម categoryId ឬ search ឈ្មោះ)
  getAllProducts: async (categoryId?: number, search?: string): Promise<Product[]> => {
    const response = await apiClient.get<ApiResponse<Product[]>>('/products', {
      params: { category_id: categoryId, search },
    });
    return response.data.data;
  },

  // ២. ស្វែងរកទំនិញតាម Barcode ពេល Cashier ស្កេន
  getProductByBarcode: async (barcode: string): Promise<Product> => {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/barcode/${barcode}`);
    return response.data.data;
  },

  // ៣. ទាញយក Categories ទាំងអស់
  getAllCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return response.data.data;
  },
};

export default productService;