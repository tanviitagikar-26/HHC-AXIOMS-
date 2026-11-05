import { useState, type ChangeEvent, type ReactNode } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const siteMediaBucket = 'site-media';
const maxFileBytes = 5 * 1024 * 1024;
const extensionByType: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export type PhotoFields = { image_url: string | null; storage_path: string | null };

type AdminImageFieldProps = {
  label: string;
  pathPrefix: string;
  imageUrl: string | null;
  storagePath: string | null;
  onSave: (fields: PhotoFields) => Promise<boolean>;
};

export function AdminPhotoGroup({ title, helper, children }: { title: string; helper: string; children: ReactNode }) {
  return (
    <div className="admin-photo-group">
      <div className="admin-photo-group-heading">
        <strong>{title}</strong>
        <span>{helper}</span>
      </div>
      {children}
    </div>
  );
}

export function AdminImageField({ label, pathPrefix, imageUrl, storagePath, onSave }: AdminImageFieldProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function removeStoredFile(path: string) {
    if (!supabase) return;
    const { error: removeError } = await supabase.storage.from(siteMediaBucket).remove([path]);
    if (removeError) console.error('site photo file could not be removed', removeError);
  }

  async function uploadPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !supabase) return;
    const extension = extensionByType[file.type];
    if (!extension) { setError('Please choose a JPEG, PNG, or WebP image.'); return; }
    if (file.size > maxFileBytes) { setError('That image is larger than 5 MB. Please choose a smaller file.'); return; }

    const client = supabase;
    const newPath = `${pathPrefix}-${crypto.randomUUID()}.${extension}`;
    setBusy(true); setError('');

    const { error: uploadError } = await client.storage.from(siteMediaBucket).upload(newPath, file, { contentType: file.type, upsert: false });
    if (uploadError) { setError('We could not upload that photo. Please try again.'); setBusy(false); return; }

    const publicUrl = client.storage.from(siteMediaBucket).getPublicUrl(newPath).data.publicUrl;
    const saved = await onSave({ image_url: publicUrl, storage_path: newPath });
    if (!saved) {
      await removeStoredFile(newPath);
      setError('We could not save that photo. Please try again.');
      setBusy(false);
      return;
    }
    if (storagePath) await removeStoredFile(storagePath);
    setBusy(false);
  }

  async function removePhoto() {
    if (!storagePath || !window.confirm('Remove this photo from the website?')) return;
    setBusy(true); setError('');
    const saved = await onSave({ image_url: null, storage_path: null });
    if (!saved) { setError('We could not remove that photo. Please try again.'); setBusy(false); return; }
    await removeStoredFile(storagePath);
    setBusy(false);
  }

  return (
    <div className="admin-image-field">
      <div className="admin-image-preview">
        {imageUrl ? <img src={imageUrl} alt={label} /> : <span className="admin-image-placeholder">No photo</span>}
      </div>
      <div className="admin-image-body">
        <strong className="admin-image-title">{label}</strong>
        <span className="admin-image-status">{imageUrl ? 'Photo set' : 'No file chosen'}</span>
        {error && <p className="admin-image-error">{error}</p>}
      </div>
      <div className="admin-image-actions">
        <label className={busy ? 'button button-dark admin-upload-button is-busy' : 'button button-dark admin-upload-button'}>
          <ImagePlus size={16} /> {imageUrl ? 'Replace photo' : 'Choose file'}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} disabled={busy} hidden />
        </label>
        {imageUrl && <button type="button" className="admin-delete admin-remove-photo" onClick={() => { void removePhoto(); }} disabled={busy} aria-label={`Remove ${label}`}><Trash2 size={15} /></button>}
      </div>
    </div>
  );
}
