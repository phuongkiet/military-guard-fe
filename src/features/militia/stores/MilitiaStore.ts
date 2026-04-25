import { makeAutoObservable, runInAction } from "mobx";
import { militiaService } from "../services/militiaService";
import type {
  GetAllMilitiasQuery,
  Militia,
  MilitiaCreateDTO,
  MilitiaUpdateDTO,
} from "../types/militia";
import type { ApiError } from "../../../api/agent";

export class MilitiaStore {
  list: Militia[] = [];
  detail: Militia | null = null;
  pageIndex: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  totalPages: number = 0;
  hasPreviousPage: boolean = false;
  hasNextPage: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;
  selectedMilitia: Militia | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // Set selected item để bắn vào Modal
  selectMilitia = (id: string) => {
    const militia = this.list.find((m) => m.id === id);
    if (militia) this.selectedMilitia = militia;
  };

  clearSelectedMilitia = () => {
    this.selectedMilitia = null;
  };

  async fetchList(query?: GetAllMilitiasQuery) {
    this.isLoading = true;
    this.error = null;
    try {
      // Ưu tiên dùng query truyền vào, nếu không có thì lấy state hiện tại
      const currentQuery = query || {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
      };
      
      const data = await militiaService.list(currentQuery);
      
      runInAction(() => {
        this.list = data.items;
        this.pageIndex = data.pageIndex;
        this.pageSize = data.pageSize;
        this.totalCount = data.totalCount;
        this.totalPages = data.totalPages;
        this.hasPreviousPage = data.hasPreviousPage;
        this.hasNextPage = data.hasNextPage;
      });
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Không thể tải danh sách dân quân.";
      });
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  }

  async fetchDetail(id: string) {
    this.isLoading = true;
    this.error = null;
    try {
      const data = await militiaService.detail(id);
      runInAction(() => {
        this.detail = data;
      });
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to fetch militia detail";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async create(payload: MilitiaCreateDTO) {
    this.isLoading = true;
    this.error = null;
    try {
      const militiaId = await militiaService.create(payload);
      await this.fetchDetail(militiaId);
      return militiaId;
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to create militia";
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async update(id: string, payload: MilitiaUpdateDTO) {
    this.isLoading = true;
    this.error = null;
    try {
      await militiaService.update(id, payload);
      await this.fetchDetail(id);
      await this.fetchList({ pageIndex: this.pageIndex, pageSize: this.pageSize });
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to update militia";
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async delete(id: string) {
    this.isLoading = true;
    this.error = null;
    try {
      await militiaService.delete(id);
      runInAction(() => {
        this.list = this.list.filter((item) => item.id !== id);
        this.totalCount = Math.max(0, this.totalCount - 1);
        this.totalPages =
          this.pageSize > 0 ? Math.ceil(this.totalCount / this.pageSize) : this.totalPages;
        this.hasPreviousPage = this.pageIndex > 1;
        this.hasNextPage = this.pageIndex < this.totalPages;
        if (this.detail?.id === id) {
          this.detail = null;
        }
      });
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to delete militia";
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  clearError() {
    this.error = null;
  }

  resetDetail() {
    this.detail = null;
  }
}
