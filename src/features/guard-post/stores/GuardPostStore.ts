import { makeAutoObservable, runInAction } from "mobx";
import { guardPostService } from "../services/guardPostService";
import type {
  GetAllGuardPostsQuery,
  GuardPostCreateDTO,
  GuardPostUpdateCommand,
  IGuardPost,
} from "../types/guardPost";
import type { ApiError } from "../../../api/agent";

export class GuardPostStore {
  list: IGuardPost[] = [];
  detail: IGuardPost | null = null;
  pageIndex: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  totalPages: number = 0;
  hasPreviousPage: boolean = false;
  hasNextPage: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;
  selectedGuardPost: IGuardPost | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  selectGuardPost = (id: string) => {
    const post = this.list.find(p => p.id === id);
    console.log("Selected Guard Post:", post);
    if (post) this.selectedGuardPost = post;
  }

  // Hàm clear selected item khi đóng Modal
  clearSelectedGuardPost = () => {
    this.selectedGuardPost = null;
  }

  async fetchList(query?: GetAllGuardPostsQuery) {
    this.isLoading = true;
    this.error = null;
    try {
      const data = await guardPostService.list(query);
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
        this.error = apiError.message || "Failed to fetch guard posts";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async fetchDetail(id: string) {
    this.isLoading = true;
    this.error = null;
    try {
      const data = await guardPostService.detail(id);
      runInAction(() => {
        this.detail = data;
      });
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to fetch guard post detail";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async create(payload: GuardPostCreateDTO) {
    this.isLoading = true;
    this.error = null;
    try {
      const guardPostId = await guardPostService.create(payload);
      await this.fetchDetail(guardPostId);
      return guardPostId;
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to create guard post";
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  updateGuardPost = async (id: string, payload: GuardPostUpdateCommand) => {
    this.isLoading = true;
    try {
      await guardPostService.update(id, payload);
      
      runInAction(() => {
        const index = this.list.findIndex(p => p.id === id);
        if (index !== -1) {
          this.list[index] = { ...this.list[index], ...payload };
        }
        this.isLoading = false;
      });
    } catch (error) {
      console.error(error);
      runInAction(() => { this.isLoading = false; });
      throw error;
    }
  }

  async delete(id: string) {
    this.isLoading = true;
    this.error = null;
    try {
      await guardPostService.delete(id);
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
        this.error = apiError.message || "Failed to delete guard post";
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
