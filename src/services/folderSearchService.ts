import { Client } from "@microsoft/microsoft-graph-client";

export class FolderSearchService {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async findFolderByName(folderName: string): Promise<any | null> {
    try {
      console.log(`📁 Searching for folder named: "${folderName}"`);

      // First, search in the root directory
      const rootFiles = await this.client.api("/me/drive/root/children").get();
      const folders = rootFiles.value.filter(
        (item: any) =>
          item.folder &&
          item.name.toLowerCase().includes(folderName.toLowerCase())
      );

      if (folders.length > 0) {
        console.log(`📁 Found folder in root: ${folders[0].name}`);
        return folders[0];
      }

      // If not found in root, search recursively
      console.log(`📁 Folder not found in root, searching subdirectories...`);
      const allFolders = await this.getAllFoldersRecursive();
      const matchingFolder = allFolders.find((folder: any) =>
        folder.name.toLowerCase().includes(folderName.toLowerCase())
      );

      if (matchingFolder) {
        console.log(`📁 Found folder: ${matchingFolder.name}`);
        return matchingFolder;
      }

      console.log(`📁 No folder found with name containing: "${folderName}"`);
      return null;
    } catch (error) {
      console.error(`Error searching for folder "${folderName}":`, error);
      return null;
    }
  }

  async getAllFoldersRecursive(
    path: string = "/me/drive/root/children"
  ): Promise<any[]> {
    try {
      const response = await this.client.api(path).get();
      let allFolders: any[] = [];

      const items = response.value || [];

      for (const item of items) {
        if (item.folder) {
          allFolders.push(item);
          if (item.folder.childCount > 0) {
            try {
              const subFolders = await this.getAllFoldersRecursive(
                `/me/drive/items/${item.id}/children`
              );
              allFolders.push(...subFolders);
            } catch (error) {
              console.warn(
                `⚠️ Could not access subfolder ${item.name}:`,
                error.message
              );
            }
          }
        }
      }

      return allFolders;
    } catch (error) {
      console.error("Error in recursive folder search:", error);
      return [];
    }
  }

  async getFilesInFolder(folderId: string): Promise<any[]> {
    try {
      console.log(`📁 Getting files in folder ID: ${folderId}`);
      const response = await this.client
        .api(`/me/drive/items/${folderId}/children`)
        .get();
      const files = response.value.filter((item: any) => item.file) || [];

      console.log(`📁 Found ${files.length} files in folder`);
      return files;
    } catch (error) {
      console.error(`Error getting files in folder ${folderId}:`, error);
      throw error;
    }
  }
}
