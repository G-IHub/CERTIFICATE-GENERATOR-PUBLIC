import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  FileText,
  Calendar,
  User,
  Image as ImageIcon,
  Upload,
  X as XIcon,
} from "lucide-react";
import {
  blogApi,
  Blog,
  CreateBlogData,
  UpdateBlogData,
} from "../utils/blogApi";
import { projectId } from "../utils/supabase/info";

interface BlogManagementProps {
  accessToken: string | null;
}

export default function BlogManagement({ accessToken }: BlogManagementProps) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  // Load blogs on mount
  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    if (!accessToken) {
      toast.error("Authentication required. Please log in again.");
      console.error("❌ No access token available");
      return;
    }

    try {
      setLoading(true);
      console.log("🔄 Loading blogs from API...");
      console.log("📝 Access token length:", accessToken.length);

      const response = await blogApi.getAll(accessToken);
      console.log("✅ Blogs loaded successfully:", response);

      // Filter out any null or invalid blogs
      const validBlogs = (response.blogs || []).filter(
        (blog) => blog && blog.id,
      );
      setBlogs(validBlogs);

      if (validBlogs.length === 0) {
        console.log("ℹ️ No blogs found in database");
      }
    } catch (error: any) {
      console.error("❌ Failed to load blogs:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });

      // Check specific error types
      if (
        error.message?.includes("Invalid JWT") ||
        error.message?.includes("Unauthorized")
      ) {
        toast.error(
          "Your session has expired. Please log out and log back in.",
          {
            duration: 5000,
          },
        );
        console.error(
          "🔐 JWT token is invalid or expired. User needs to re-authenticate.",
        );
      } else if (
        error.message?.includes("404") ||
        error.message?.includes("Not Found")
      ) {
        toast.error(
          "Blog API not configured yet. See BLOG_SERVER_SETUP.md for setup instructions.",
        );
      } else {
        toast.error(error.message || "Failed to load blogs");
      }
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const openEditor = (blog?: Blog) => {
    if (blog) {
      // Edit existing blog
      setEditingBlog(blog);
      setTitle(blog.title);
      setExcerpt(blog.excerpt);
      setContent(blog.content);
      setImage(blog.image);
      setImagePreview(null); // Clear preview when editing existing blog
      setImageFile(null); // Clear file when editing existing blog
      setAuthor(blog.author);
      setStatus(blog.status);
    } else {
      // Create new blog
      setEditingBlog(null);
      setTitle("");
      setExcerpt("");
      setContent("");
      setImage("");
      setImagePreview(null);
      setImageFile(null);
      setAuthor("");
      setStatus("draft");
    }
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingBlog(null);
    setTitle("");
    setExcerpt("");
    setContent("");
    setImage("");
    setAuthor("");
    setStatus("draft");
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSave = async () => {
    if (!accessToken) {
      toast.error("Authentication required");
      return;
    }

    if (!title.trim() || !content.trim() || !author.trim()) {
      toast.error("Title, content, and author are required");
      return;
    }

    try {
      if (editingBlog) {
        // Update existing blog
        const updates: UpdateBlogData = {
          title,
          excerpt,
          content,
          image,
          author,
          status,
        };

        const response = await blogApi.update(
          accessToken,
          editingBlog.id,
          updates,
        );
        setBlogs((prev) =>
          prev.map((blog) =>
            blog.id === editingBlog.id ? response.blog : blog,
          ),
        );
        toast.success("Blog updated successfully");
      } else {
        // Create new blog
        const newBlogData: CreateBlogData = {
          title,
          excerpt,
          content,
          image: image || "", // Use uploaded image or empty string
          author,
          status,
        };

        const response = await blogApi.create(accessToken, newBlogData);
        setBlogs((prev) => [response.blog, ...prev]);
        toast.success("Blog created successfully");
      }

      closeEditor();
    } catch (error: any) {
      console.error("Failed to save blog:", error);

      // Check if it's a 404 (API not configured)
      if (
        error.message?.includes("404") ||
        error.message?.includes("Not Found") ||
        error.message?.includes("Failed to create blog")
      ) {
        toast.error(
          "Blog API not configured. Please see BLOG_SERVER_SETUP.md for setup instructions.",
          {
            duration: 5000,
          },
        );
      } else {
        toast.error(error.message || "Failed to save blog");
      }
    }
  };

  const handleDelete = async () => {
    if (!accessToken || !deletingBlogId) {
      return;
    }

    try {
      await blogApi.delete(accessToken, deletingBlogId);
      setBlogs((prev) => prev.filter((blog) => blog.id !== deletingBlogId));
      toast.success("Blog deleted successfully");
      setShowDeleteConfirm(false);
      setDeletingBlogId(null);
    } catch (error: any) {
      console.error("Failed to delete blog:", error);
      toast.error(error.message || "Failed to delete blog");
    }
  };

  const confirmDelete = (blogId: string) => {
    setDeletingBlogId(blogId);
    setShowDeleteConfirm(true);
  };

  const handleImageUpload = async (file: File) => {
    if (!accessToken) {
      toast.error("Authentication required");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setUploadingImage(true);
      console.log("📤 Uploading image to server...");

      // Create form data
      const formData = new FormData();
      formData.append("file", file);

      // Upload via server endpoint (bypasses RLS)
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/blogs/upload-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Failed to upload image" }));
        throw new Error(error.message || "Failed to upload image");
      }

      const result = await response.json();
      setImage(result.url);
      console.log("✅ Image uploaded successfully:", result.url);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("❌ Failed to upload image:", error);

      // Check if it's a bucket setup issue
      if (
        error.message?.includes("not found") ||
        error.message?.includes("Bucket")
      ) {
        toast.error(
          "Blog image storage is being set up. Please wait a moment and try again, or refresh the page.",
          {
            duration: 5000,
          },
        );
      } else if (
        error.message?.includes("RLS") ||
        error.message?.includes("security policy")
      ) {
        toast.error("Storage permissions issue. Please contact support.", {
          duration: 5000,
        });
      } else {
        toast.error(error.message || "Failed to upload image");
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setImage("");
    // Reset file input
    const fileInput = document.getElementById(
      "imageUpload",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Blog Management</h2>
          <p className="text-gray-600">Create and manage blog posts</p>
        </div>
        <Button onClick={() => openEditor()} className="gap-2">
          <Plus className="w-4 h-4" />
          New Blog Post
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{blogs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Published
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {blogs.filter((b) => b && b.status === "published").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Drafts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {blogs.filter((b) => b && b.status === "draft").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Blog List */}
      {blogs.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No blog posts yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first blog post to get started
              </p>
              <Button onClick={() => openEditor()} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Blog Post
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blogs.map((blog) => (
            <Card key={blog.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                {blog.image ? (
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={
                      blog.status === "published" ? "default" : "secondary"
                    }
                  >
                    {blog.status === "published" ? (
                      <Eye className="w-3 h-3 mr-1" />
                    ) : (
                      <EyeOff className="w-3 h-3 mr-1" />
                    )}
                    {blog.status}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {blog.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {blog.author}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(blog.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditor(blog)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => confirmDelete(blog.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Blog Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBlog ? "Edit Blog Post" : "Create New Blog Post"}
            </DialogTitle>
            <DialogDescription>
              {editingBlog
                ? "Update your blog post details"
                : "Fill in the details to create a new blog post"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter blog title"
                className="mt-1"
              />
            </div>

            {/* Author */}
            <div>
              <Label htmlFor="author">
                Author <span className="text-red-500">*</span>
              </Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author name"
                className="mt-1"
              />
            </div>

            {/* Upload Image */}
            <div>
              <Label htmlFor="imageUpload">
                Blog Image{" "}
                {!editingBlog && <span className="text-red-500">*</span>}
              </Label>
              <div className="mt-1 space-y-2">
                {/* Show current image or preview */}
                {(image || imagePreview) && (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview || image}
                      alt="Blog preview"
                      className="w-full max-w-md h-48 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
                      onClick={removeImage}
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Upload button */}
                {!uploadingImage && !image && !imagePreview && (
                  <div className="flex items-center gap-2">
                    <Input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={uploadingImage}
                    />
                  </div>
                )}

                {/* Uploading state */}
                {uploadingImage && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FF7700]"></div>
                    <span>Uploading image...</span>
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  {image || imagePreview
                    ? "Image uploaded successfully. Click the × button to change it."
                    : "Upload an image for your blog post (max 5MB). JPG, PNG, or GIF formats."}
                </p>
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <Label htmlFor="excerpt">Excerpt (optional)</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Short description (auto-generated if left empty)"
                rows={2}
                className="mt-1"
              />
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content">
                Content <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your blog content here. Use ## for headings, ### for subheadings."
                rows={12}
                className="mt-1 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supports basic markdown: ## for headings, ### for subheadings
              </p>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "draft" | "published")
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="draft">Draft (not visible to public)</option>
                <option value="published">Published (visible to public)</option>
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeEditor}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingBlog ? "Update" : "Create"} Blog Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The blog post will be permanently
              deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeletingBlogId(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}