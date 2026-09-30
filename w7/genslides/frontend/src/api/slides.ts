import { get, post, put, del } from './index';
import type {
  ProjectResponse,
  SlideResponse,
  CreateSlideRequest,
  UpdateSlideRequest,
  ReorderSlidesResponse,
  UpdateTitleResponse,
  DeleteResponse,
  SetDefaultImageResponse,
} from '@/types';

export const slidesApi = {
  getProject: (slug: string) =>
    get<ProjectResponse>(`/slides/${slug}`),

  createSlide: (slug: string, data: CreateSlideRequest) =>
    post<SlideResponse>(`/slides/${slug}`, data),

  updateSlide: (slug: string, sid: string, data: UpdateSlideRequest) =>
    put<SlideResponse>(`/slides/${slug}/${sid}`, data),

  deleteSlide: (slug: string, sid: string) =>
    del<DeleteResponse>(`/slides/${slug}/${sid}`),

  reorderSlides: (slug: string, slideIds: string[]) =>
    put<ReorderSlidesResponse>(`/slides/${slug}/reorder`, { slide_ids: slideIds }),

  updateTitle: (slug: string, title: string) =>
    put<UpdateTitleResponse>(`/slides/${slug}/title`, { title }),

  setDefaultImage: (slug: string, sid: string, filename: string) =>
    put<SetDefaultImageResponse>(`/slides/${slug}/${sid}/default-image`, { filename }),

  exportProject: async (slug: string): Promise<void> => {
    const response = await fetch(`/api/slides/${slug}/export`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Export failed: ${response.status}`);
    }

    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `${slug}.zip`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    // Create blob and trigger download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};
