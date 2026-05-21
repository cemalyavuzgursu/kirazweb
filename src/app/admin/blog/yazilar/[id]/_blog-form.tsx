"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MediaInput } from "@/components/admin/media-input";
import { saveBlogPost, deleteBlogPost } from "@/server/actions/blog";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  coverImage: string | null;
  isPublished: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
}

interface Props {
  post?: BlogPost;
  isNew: boolean;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function BlogForm({ post, isNew }: Props) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [seoOpen, setSeoOpen] = useState(false);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setTitle(val);
    if (!slugTouched) {
      setSlug(toSlug(val));
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(e.target.value);
    setSlugTouched(true);
  }

  return (
    <form action={saveBlogPost} className="space-y-6 max-w-4xl">
      {post?.id ? <input type="hidden" name="id" value={post.id} /> : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Başlık *</Label>
                <Input
                  id="title"
                  name="title"
                  value={title}
                  onChange={handleTitleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">URL slug *</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={handleSlugChange}
                  required
                  placeholder="yazi-basligi"
                />
                <p className="text-xs text-ink-300 mt-1">
                  /blog/<span className="font-mono">{slug || "slug"}</span> adresinden açılır.
                </p>
              </div>

              <div>
                <Label htmlFor="excerpt">Özet</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  rows={3}
                  defaultValue={post?.excerpt ?? ""}
                  placeholder="Kısa özet (isteğe bağlı)"
                />
              </div>

              <div>
                <Label htmlFor="content">İçerik (HTML)</Label>
                <Textarea
                  id="content"
                  name="content"
                  rows={12}
                  defaultValue={post?.content ?? ""}
                  className="font-mono text-xs"
                  placeholder="<p>Yazı içeriği...</p>"
                />
                <p className="text-xs text-ink-300 mt-1">
                  HTML etiketleri kullanabilirsiniz: <code>&lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;a&gt;, &lt;strong&gt;</code> vb.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <button
                type="button"
                className="flex items-center justify-between w-full text-left"
                onClick={() => setSeoOpen((v) => !v)}
              >
                <h3 className="font-display text-lg text-ink-700">SEO</h3>
                <span className="text-xs text-ink-400">{seoOpen ? "Kapat" : "Aç"}</span>
              </button>

              {seoOpen && (
                <div className="space-y-4 pt-2 border-t border-cream-100">
                  <div>
                    <Label htmlFor="seoTitle">SEO Başlık</Label>
                    <Input id="seoTitle" name="seoTitle" defaultValue={post?.seoTitle ?? ""} />
                  </div>
                  <div>
                    <Label htmlFor="seoDescription">Meta Açıklama</Label>
                    <Textarea
                      id="seoDescription"
                      name="seoDescription"
                      rows={3}
                      maxLength={160}
                      defaultValue={post?.seoDescription ?? ""}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4">
              <h3 className="font-display text-lg text-ink-700">Yayın</h3>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="isPublished"
                  defaultChecked={post?.isPublished ?? false}
                  className="h-4 w-4 rounded border-cream-300 text-rose-500"
                />
                Yayında
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <h3 className="font-display text-lg text-ink-700">Kapak Görseli</h3>
              <MediaInput
                name="coverImage"
                defaultValue={post?.coverImage ?? ""}
                folder="blog"
                placeholder="/uploads/blog/gorsel.webp"
              />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button type="submit">{isNew ? "Oluştur" : "Güncelle"}</Button>
            <Link href="/admin/blog/yazilar">
              <Button type="button" variant="outline" className="w-full">İptal</Button>
            </Link>
          </div>

          {!isNew && post?.id && (
            <form action={deleteBlogPost}>
              <input type="hidden" name="id" value={post.id} />
              <Button
                type="submit"
                variant="outline"
                className="w-full text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                Yazıyı Sil
              </Button>
            </form>
          )}
        </div>
      </div>
    </form>
  );
}
