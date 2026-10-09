import { adminService } from '../api/adminService';
import { useAsync } from './useAsync';

export function useCategories() {
  return useAsync(() => adminService.getCategories(), []);
}
