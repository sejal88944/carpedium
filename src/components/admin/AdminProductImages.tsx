'use client'

import { useState } from 'react'
import { Upload, X, Plus } from 'lucide-react'

const MAX_IMAGES = 5
const SLOT_LABELS = ['Front', 'Back', 'View 3', 'View 4', 'View 5']

type Props = {
  images: string[]
  onChange: (images: string[]) => void
  surface?: string
}

async function uploadImageFile(file: File): Promise<string> {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloud) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', 'aasha_unsigned')
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: 'POST',
    body: fd,
  }).then((r) => r.json())
  if (res.secure_url) return res.secure_url as string
  throw new Error(res.error?.message || 'Upload failed')
}

/** Multiple product photos in one admin card (front, back, extra views). */
export function AdminProductImages({ images, onChange, surface = '#f4f4f4' }: Props) {
  const [busy, setBusy] = useState(false)
  const [urlInput, setUrlInput] = useState('')

  async function addFiles(files: FileList | File[]) {
    const list = Array.from(files).slice(0, MAX_IMAGES - images.length)
    if (list.length === 0) return
    setBusy(true)
    try {
      const uploaded: string[] = []
      for (const file of list) {
        uploaded.push(await uploadImageFile(file))
      }
      onChange([...images, ...uploaded].slice(0, MAX_IMAGES))
    } catch (e) {
      console.error(e)
      alert('Image upload failed — try again or paste a URL.')
    } finally {
      setBusy(false)
    }
  }

  function removeAt(i: number) {
    onChange(images.filter((_, idx) => idx !== i))
  }

  function addUrl() {
    const u = urlInput.trim()
    if (!u || images.length >= MAX_IMAGES) return
    onChange([...images, u])
    setUrlInput('')
  }

  const cols = images.length >= 3 ? 'grid-cols-3' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-1'

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Product photos (एका card मध्ये)
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            2–{MAX_IMAGES} images — Front, Back, etc. Shop वर एकाच card मध्ये दिसतील.
          </p>
        </div>
        <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[10px] font-bold text-brand">
          {images.length}/{MAX_IMAGES}
        </span>
      </div>

      {images.length > 0 ? (
        <div className={`mt-4 grid gap-2 ${cols}`}>
          {images.map((src, i) => (
            <div
              key={`${src.slice(0, 32)}-${i}`}
              className="relative aspect-[3/4] overflow-hidden rounded-xl border border-slate-200 dark:border-white/10"
              style={{ backgroundColor: surface }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-contain p-1.5" />
              <span className="absolute left-1.5 top-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                {SLOT_LABELS[i] ?? `Photo ${i + 1}`}
              </span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white hover:bg-rose-600"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-xs text-slate-500 dark:border-white/15">
          No photos yet — upload front & back mockups
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label
          className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-white dark:border-white/15 dark:hover:bg-white/[0.04] ${
            images.length >= MAX_IMAGES || busy ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          <Upload className="h-3.5 w-3.5" />
          {busy ? 'Uploading…' : 'Add photos'}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={images.length >= MAX_IMAGES || busy}
            onChange={(e) => {
              const f = e.target.files
              if (f?.length) void addFiles(f)
              e.target.value = ''
            }}
          />
        </label>
        {images.length < MAX_IMAGES ? (
          <label className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold dark:border-white/10">
            <Plus className="h-3.5 w-3.5" /> One more
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void addFiles([f])
                e.target.value = ''
              }}
            />
          </label>
        ) : null}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Paste image URL…"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand dark:border-white/10 dark:bg-slate-950"
        />
        <button
          type="button"
          onClick={addUrl}
          disabled={!urlInput.trim() || images.length >= MAX_IMAGES}
          className="shrink-0 rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-white disabled:opacity-50 dark:bg-white/10"
        >
          Add URL
        </button>
      </div>
    </div>
  )
}
