/**
 * Converte URLs temporárias (`blob:`) ou strings base64 em data URLs
 * persistentes. Permite que fotos e áudios continuem disponíveis após a
 * gravação, mesmo depois de recarregar a página.
 */
export async function ensurePersistentMediaUrl(
  value: string | null | undefined,
): Promise<string | null> {
  if (!value) return null;
  if (!value.startsWith('blob:')) return value;

  try {
    const response = await fetch(value);
    const blob = await response.blob();
    if (blob.size === 0) return null;

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
