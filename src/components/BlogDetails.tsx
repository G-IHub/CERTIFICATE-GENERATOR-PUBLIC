import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import { blogApi, Blog } from "../utils/blogApi";
import { toast } from "sonner";

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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-4">
          {/* <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 mb-4 hover:underline"
        >
          ← Back
        </button> */}

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
              className="w-full h-100 object-cover"
            />

            <div className="mt-6 text-gray-800">
              {renderMarkdownish(post.content)}
            </div>
          </div>

          <div className="mt-8">
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md"
            >
              Back to Blog List
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}