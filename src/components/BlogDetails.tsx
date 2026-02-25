import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import { blogApi, Blog } from "../utils/blogApi";
import { toast } from "sonner";
import SEOHead from "./SEOHead";

function renderMarkdownish(content: string) {
  const blocks = content.split("\n\n");
  return blocks.map((block, idx) => {
    if (block.startsWith("### ")) {
      return (
        <h3 key={idx} className="text-lg font-semibold mt-4">
          {block.replace(/^###\s+/, "")}
        </h3>
      );
    }
    if (block.startsWith("## ")) {
      return (
        <h2 key={idx} className="text-2xl font-bold mt-4">
          {block.replace(/^##\s+/, "")}
        </h2>
      );
    }
    return (
      <p key={idx} className="text-base text-gray-700 mt-3 whitespace-pre-wrap">
        {block}
      </p>
    );
  });
}

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
        toast.error("Failed to load blog post");
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-10">
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
              Back to blog list
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if content is HTML (WordPress) or plain text (backend)
  const isHtmlContent =
    post.source === "wordpress" || post.content.includes("<");

  return (
    <>
      <SEOHead
        title={`${post.title} | Certifyer Blog`}
        description={post.excerpt}
        image={post.image}
        url={`https://certifyer.online/#/blog/${post.id}`}
        type="article"
      />
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="">
            <div className="text-center">
              <h1 className="text-5xl font-bold">{post.title}</h1>
              <div className="text-sm text-gray-500 mt-2 mb-6">
                <span>{post.author}</span> •{" "}
                <span>{new Date(post.date).toLocaleDateString()}</span>
              </div>
            </div>
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-100 object-cover rounded-lg"
            />

            <div className="mt-6 text-gray-800">
              {isHtmlContent ? (
                // Render HTML content from WordPress
                <div
                  className="prose prose-lg max-w-none
                    prose-headings:font-bold prose-headings:text-gray-900
                    prose-h1:text-4xl prose-h1:mt-8 prose-h1:mb-4
                    prose-h2:text-3xl prose-h2:mt-6 prose-h2:mb-3
                    prose-h3:text-2xl prose-h3:mt-5 prose-h3:mb-2
                    prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                    prose-a:text-[#FF7700] prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-gray-900 prose-strong:font-semibold
                    prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4
                    prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4
                    prose-li:text-gray-700 prose-li:mb-1
                    prose-blockquote:border-l-4 prose-blockquote:border-[#FF7700] 
                    prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
                    prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded
                    prose-pre:bg-gray-800 prose-pre:text-white prose-pre:p-4 prose-pre:rounded-lg
                    prose-img:rounded-lg prose-img:shadow-md"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              ) : (
                // Render markdown-style content from backend
                renderMarkdownish(post.content)
              )}
            </div>
          </div>

          <div className="mt-8">
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-[#FF6600] transition-colors"
            >
              Back to Blog List
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}