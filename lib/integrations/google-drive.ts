import { google } from "googleapis";

function getAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials not configured");
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export async function listFolders(parentFolderId: string) {
  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.list({
    q: `'${parentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id, name, createdTime)",
    orderBy: "name",
  });

  return res.data.files || [];
}

export async function listFilesInFolder(folderId: string) {
  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'video/' and trashed = false`,
    fields: "files(id, name, mimeType, size, createdTime, thumbnailLink)",
    orderBy: "name",
  });

  return res.data.files || [];
}

export async function downloadFile(fileId: string): Promise<Buffer> {
  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" }
  );

  return Buffer.from(res.data as ArrayBuffer);
}

export async function uploadFile(
  folderId: string,
  fileName: string,
  mimeType: string,
  body: Buffer
) {
  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
      mimeType,
    },
    media: {
      mimeType,
      body: Buffer.from(body) as unknown as NodeJS.ReadableStream,
    },
    fields: "id, name, webViewLink",
  });

  return res.data;
}

export async function indexBrollFolders(parentFolderId: string) {
  const folders = await listFolders(parentFolderId);

  const catalog = await Promise.all(
    folders.map(async (folder) => {
      const files = await listFilesInFolder(folder.id!);
      return {
        driveFolderId: folder.id!,
        folderName: folder.name!,
        clipCount: files.length,
        clips: files.map((f) => ({
          id: f.id,
          name: f.name,
          size: f.size,
          thumbnail: f.thumbnailLink,
        })),
      };
    })
  );

  return catalog;
}
