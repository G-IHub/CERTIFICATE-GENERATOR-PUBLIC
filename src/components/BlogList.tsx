import React from "react";
import { Link } from "react-router";
import Navbar from "./landing/Navbar";
import { blogApi, Blog } from "../utils/blogApi";
import { toast } from "sonner";

export default function BlogList() {
  const [blogs, setBlogs] = React.useState<Blog[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await blogApi.getAllPublished();
        setBlogs(response.blogs);
      } catch (error: any) {
        console.error("Failed to fetch blogs:", error);
        toast.error("Failed to load blogs");
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-10">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-3xl font-bold mb-6">Blog</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                  <div className="w-full h-40 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Blog</h1>
          
          {blogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No blog posts available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col"
                >
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50">
                      <span className="text-4xl">📝</span>
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <h2 className="text-lg font-semibold mb-2 truncate">
                      {post.title}
                    </h2>
                    <p className="text-sm text-gray-600 mb-3 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-3">
                      <div className="text-xs text-gray-500">
                        <div>{post.author}</div>
                        <div>{new Date(post.date).toLocaleDateString()}</div>
                      </div>
                      <Link
                        to={`/blog/${post.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-md text-sm"
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}