import apiClient from './client';
import { FileHierarchyResponseDto } from '../types/fileHierarchy';

export const FileApi = {
  async getFileTree(parentId?: string): Promise<FileHierarchyResponseDto[]> {
    const response = await apiClient.get('/file-hierarchy/tree', {
      params: { parentId }
    });
    console.log(response.data)
    console.log(response.data.map((node: any) => this.mapFileNode(node)))
    return response.data.map((node: any) => this.mapFileNode(node));
  },

  async createFolder(dto: { name: string; parentId?: string }): Promise<FileHierarchyResponseDto> {
    const response = await apiClient.post('/file-hierarchy/folders', dto);
    return this.mapFileNode(response.data);
  },

  async uploadFile(file: File, parentId?: string): Promise<FileHierarchyResponseDto> {
    const formData = new FormData();
    
    formData.append('file', file);

    console.log(file.name)

    const response = await apiClient.post(
      '/file-hierarchy/files',
      formData,
      {
        params: { parentId },
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return this.mapFileNode(response.data);
  },

  async renameItem(id: string, newName: string): Promise<FileHierarchyResponseDto> {
    const response = await apiClient.patch(`/file-hierarchy/${id}`, { name: newName });
    return this.mapFileNode(response.data);
  },

  async moveItem(id: string, newParentId: string): Promise<FileHierarchyResponseDto> {
    const response = await apiClient.post(`/file-hierarchy/move/${id}`, {
      newParentId
    });
    return this.mapFileNode(response.data);
  },

  async deleteItem(id: string): Promise<void> {
    await apiClient.delete(`/file-hierarchy/${id}`);
  },

async downloadFile(id: string): Promise<{ url: string; name: string }> {
  try {
    const response = await apiClient.get(`/file-hierarchy/download/${id}`, {
    validateStatus: (status) => status >= 200 && status < 400
    });
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error('Ошибка скачивания:', error);
    throw error; // Важно пробросить ошибку для обработки в компоненте
  }
},


  mapFileNode(node: any): FileHierarchyResponseDto {
    return {
      id: node.id,
      name: node.name,
      type: node.type.toLowerCase() as 'file' | 'folder',
      path: node.path,
      url: node.url,
      size: node.size,
      mimeType: node.mimeType,
      createdAt: new Date(node.createdAt),
      updatedAt: new Date(node.updatedAt),
      children: node.children ? node.children.map((n: any) => this.mapFileNode(n)) : [],
      expanded: node.type === 'folder'
    };
  }
};