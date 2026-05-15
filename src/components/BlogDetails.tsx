import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import Navbar from "./landing/Navbar";
import { blogApi, Blog } from "../utils/blogApi";
import { toast } from "sonner";
import SEOHead from "./SEOHead";
import { decodeHtmlEntities } from "../utils/htmlDecode";
import { useBlogAnalytics } from "../utils/analytics";

export default function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = "merriweather-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await blogApi.getById(id);
        setPost(response.blog);
      } catch (error: any) {
        console.error("Failed to fetch blog:", error);
        toast.error(error.message || "Failed to load blog post");
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  // Analytics tracking
  useEffect(() => {
    if (!post || !id) return;

    const analytics = useBlogAnalytics(id, post.title);

    // Track page view
    analytics.trackView();

    // Track scroll depth
    const handleScroll = () => {
      analytics.updateScrollDepth();
    };
    window.addEventListener("scroll", handleScroll);

    // Track engagement on unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
      analytics.trackEngagement();
    };
  }, [post, id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-10 lg:-mt-30">
          <div className="max-w-4xl mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="w-full h-100 bg-gray-200 rounded"></div>
              <div className="mt-6 space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Post not found</h2>
          <div className="mt-4">
            <Link to="/blogs" className="text-primary hover:underline">
              Back to blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${decodeHtmlEntities(post.title)} | Certifyer Blog`}
        description={decodeHtmlEntities(post.excerpt)}
        image={post.image}
        url={`https://certifyer.online/blog/${post.id}`}
        type="article"
      />
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-10 lg:-mt-30">
        <div className="my-8 ml-20">
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-500 font-semibold rounded-md hover:text-gray-700 "
            >
              &larr; Back to Blog
            </Link>
          </div>
        <div className="max-w-4xl mx-auto px-4"> 
          <div className="">
            <div className="text-start">
              <h1 className="text-5xl font-bold">
                {decodeHtmlEntities(post.title)}
              </h1>
              <div className="text-sm text-gray-500 mt-2 mb-6">
                <span>{post.author}</span> •{" "}
                <span>{new Date(post.date).toLocaleDateString()}</span>
              </div>
            </div>
            <img
              src={post.image}
              alt={decodeHtmlEntities(post.title)}
              className="w-full h-100 object-cover rounded-lg"
            />

            {/* WordPress HTML Content */}
            <div className="mt-6 text-gray-800">
              <div
                className="prose prose-xl max-w-none text-2xl text-gray-700 tracking-wide leading-loose
                  prose-headings:font-bold prose-headings:text-gray-900
                  prose-h1:text-5xl prose-h1:mt-8 prose-h1:mb-4
                  prose-h2:text-4xl prose-h2:mt-6 prose-h2:mb-3
                  prose-h3:text-3xl prose-h3:mt-5 prose-h3:mb-2
                  prose-p:text-lg prose-p:leading-relaxed prose-p:mb-4
                  prose-a:text-[#FF7700] prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-gray-900 prose-strong:font-semibold
                  prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4
                  prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4
                  prose-li:text-lg prose-li:mb-1
                  prose-blockquote:border-l-4 prose-blockquote:border-[#FF7700] 
                  prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
                  prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded
                  prose-pre:bg-gray-800 prose-pre:text-white prose-pre:p-4 prose-pre:rounded-lg
                  prose-img:rounded-lg prose-img:shadow-md"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
