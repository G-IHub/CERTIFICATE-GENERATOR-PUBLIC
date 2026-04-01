import { useState, useEffect } from "react";
import { Link } from "react-router";
import { blogApi, Blog } from "../../utils/blogApi";
import { Calendar, User, ArrowRight } from "lucide-react";
import { decodeHtmlEntities } from "../../utils/htmlDecode";

export default function BlogSection() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await blogApi.getAllPublished();
        // Only show the first 3 most recent blogs
        setBlogs(response.blogs.slice(0, 3));
      } catch (error: any) {
        console.error("Failed to fetch blogs:", error);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Don't render the section if there are no blogs
  if (!loading && blogs.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 bg-white relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Latest from Our Blog
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest insights, tips, and news about
            certificate management
          </p>
        </div>

        {/* Blog Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-lg overflow-hidden animate-pulse"
              >
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <article
                key={blog.id}
                className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
              >
                {/* Blog Image */}
                <div className="w-full h-48 bg-gray-100 overflow-hidden">
                  {blog.image ? (
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50">
                      <span className="text-4xl">📝</span>
                    </div>
                  )}
                </div>

                {/* Blog Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{blog.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(blog.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-3 line-clamp-2 hover:text-[#FF7700] transition-colors">
                    <Link to={`/blog/${blog.id}`}>
                      {decodeHtmlEntities(blog.title)}
                    </Link>
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                    {decodeHtmlEntities(blog.excerpt)}
                  </p>

                  {/* Read More Link */}
                  <Link
                    to={`/blog/${blog.id}`}
                    className="inline-flex items-center gap-2 text-[#FF7700] font-semibold hover:gap-3 transition-all"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* View All Link */}
        {!loading && blogs.length > 0 && (
          <div className="text-center mt-12">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF7700] text-white font-semibold rounded-lg hover:bg-[#FF6600] transition-colors"
            >
              View All Blog Posts
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}