import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Save,
  Loader2,
  X,
  Image as ImageIcon,
  BarChart3,
} from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { blogService, type BlogPost } from "../../utils/blogService";
import { toast } from "sonner";
import BlogAnalytics from "./BlogAnalytics";

interface BlogManagementProps {
  currentUser: {
    name: string;
    email: string;
  };
}

export function BlogManagement({ currentUser }: BlogManagementProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost> | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "draft" | "published"
  >("all");
  const [viewMode, setViewMode] = useState<
    "list" | "analytics" | "single-analytics"
  >("list");
  const [selectedBlogForAnalytics, setSelectedBlogForAnalytics] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "align",
    "link",
    "image",
  ];

  // Fetch blog posts from database
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await blogService.getAll(filterStatus);
      setPosts(data);
    } catch (error: any) {
      console.error("Error fetching blog posts:", error);
      toast.error("Failed to load blog posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filterStatus]);

  // Create or update blog post
  const handleSave = async () => {
    if (saving) {
      return;
    }

    if (!currentPost?.title || !currentPost?.content) {
      toast.error("Please fill in title and content");
      return;
    }

    setSaving(true);

    try {
      const postData = {
        title: currentPost.title,
        excerpt: currentPost.excerpt || "",
        content: currentPost.content,
        featured_image: currentPost.featured_image,
        author: currentPost.author || currentUser.name,
        status: (currentPost.status || "draft") as "draft" | "published",
      };

      if (currentPost.id) {
        // Update existing post
        await blogService.update(currentPost.id, postData);
        toast.success("Blog post updated successfully!");
      } else {
        // Create new post
        await blogService.create(postData);
        toast.success("Blog post created successfully!");
      }

      setIsEditing(false);
      setCurrentPost(null);
      fetchPosts();
    } catch (error: any) {
      console.error("Error saving blog post:", error);
      toast.error(error.message || "Failed to save blog post");
    } finally {
      setSaving(false);
    }
  };

  // Delete blog post
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) {
      return;
    }

    try {
      await blogService.delete(id);
      toast.success("Blog post deleted successfully!");
      fetchPosts();
    } catch (error: any) {
      console.error("Error deleting blog post:", error);
      toast.error(error.message || "Failed to delete blog post");
    }
  };

  // Upload featured image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const imageUrl = await blogService.uploadImage(file);
      setCurrentPost((prev) => ({
        ...prev,
        featured_image: imageUrl,
      }));
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // Start creating new post
  const handleNewPost = () => {
    setCurrentPost({
      title: "",
      excerpt: "",
      content: "",
      author: currentUser.name,
      status: "draft",
    });
    setIsEditing(true);
  };

  // Start editing existing post
  const handleEdit = (post: BlogPost) => {
    setCurrentPost(post);
    setIsEditing(true);
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setCurrentPost(null);
  };

  // Publish/unpublish post
  const handleTogglePublish = async (post: BlogPost) => {
    const newStatus = post.status === "published" ? "draft" : "published";

    try {
      await blogService.update(post.id, { status: newStatus });
      toast.success(
        `Post ${newStatus === "published" ? "published" : "unpublished"} successfully!`,
      );
      fetchPosts();
    } catch (error: any) {
      console.error("Error updating post status:", error);
      toast.error(error.message || "Failed to update post status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {currentPost?.id ? "Edit Blog Post" : "Create New Blog Post"}
          </h2>
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={currentPost?.title || ""}
              onChange={(e) =>
                setCurrentPost((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter blog post title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt (optional)
            </label>
            <textarea
              value={currentPost?.excerpt || ""}
              onChange={(e) =>
                setCurrentPost((prev) => ({ ...prev, excerpt: e.target.value }))
              }
              placeholder="Short summary of the blog post (shown in previews)"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image
            </label>
            <div className="flex items-center gap-4">
              {currentPost?.featured_image ? (
                <div className="relative">
                  <img
                    src={currentPost.featured_image}
                    alt="Featured"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() =>
                      setCurrentPost((prev) => ({
                        ...prev,
                        featured_image: undefined,
                      }))
                    }
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Upload Image"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Author
            </label>
            <input
              type="text"
              value={currentPost?.author || ""}
              onChange={(e) =>
                setCurrentPost((prev) => ({ ...prev, author: e.target.value }))
              }
              placeholder="Author name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <ReactQuill
                theme="snow"
                value={currentPost?.content || ""}
                onChange={(content) =>
                  setCurrentPost((prev) => ({ ...prev, content }))
                }
                modules={modules}
                formats={formats}
                placeholder="Write your blog post content here..."
                className="bg-white"
                style={{ minHeight: "400px" }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  checked={currentPost?.status === "draft"}
                  onChange={() =>
                    setCurrentPost((prev) => ({ ...prev, status: "draft" }))
                  }
                  className="text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Save as Draft</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  checked={currentPost?.status === "published"}
                  onChange={() =>
                    setCurrentPost((prev) => ({ ...prev, status: "published" }))
                  }
                  className="text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Publish</span>
              </label>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving
                ? currentPost?.id
                  ? "Updating..."
                  : "Creating..."
                : currentPost?.id
                  ? "Update Post"
                  : "Create Post"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "analytics") {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Blog Analytics</h2>
          <button
            onClick={() => setViewMode("list")}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Back to List
          </button>
        </div>

        <BlogAnalytics />
      </div>
    );
  }

  if (viewMode === "single-analytics") {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Blog Analytics: {selectedBlogForAnalytics?.title}
          </h2>
          <button
            onClick={() => setViewMode("list")}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Back to List
          </button>
        </div>

        <BlogAnalytics blogId={selectedBlogForAnalytics?.id} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Blog Management</h2>
          <p className="text-gray-600">
            Create and manage blog posts for the platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode("analytics")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-md"
          >
            <BarChart3 className="w-5 h-5" />
            View Analytics
          </button>
          <button
            onClick={handleNewPost}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 shadow-md"
          >
            <Plus className="w-5 h-5" />
            New Blog Post
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <span className="text-sm text-gray-600">Filter:</span>
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-4 py-2 rounded-lg ${
            filterStatus === "all"
              ? "bg-orange-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterStatus("published")}
          className={`px-4 py-2 rounded-lg ${
            filterStatus === "published"
              ? "bg-orange-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Published
        </button>
        <button
          onClick={() => setFilterStatus("draft")}
          className={`px-4 py-2 rounded-lg ${
            filterStatus === "draft"
              ? "bg-orange-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Drafts
        </button>
      </div>

      {/* Blog Posts List */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No blog posts yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first blog post to start sharing content with your
            audience.
          </p>
          <button
            onClick={handleNewPost}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create First Post
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="flex">
                {/* Featured Image */}
                {post.featured_image && (
                  <div className="w-48 h-48 flex-shrink-0">
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{post.title}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            post.status === "published"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {post.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        By {post.author} •{" "}
                        {new Date(post.updated_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-gray-700 line-clamp-2">
                        {post.excerpt ||
                          post.content
                            .replace(/<[^>]*>/g, "")
                            .substring(0, 150) + "..."}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => handleEdit(post)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBlogForAnalytics({
                          id: post.id,
                          title: post.title,
                        });
                        setViewMode("single-analytics");
                      }}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-2 text-sm"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </button>
                    <button
                      onClick={() => handleTogglePublish(post)}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm ${
                        post.status === "published"
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      {post.status === "published" ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-2 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
