import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "./landing/Navbar";
import { blogs } from "../data/blogs";

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

// useEffect(() => {
//   const id = "merriweather-font";
//   if (!document.getElementById(id)) {
//     const link = document.createElement("link");
//     link.id = id;
//     link.rel = "stylesheet";
//     link.href =
//       "https://fonts.googleapis.com/css2?family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&display=swap";
//     document.head.appendChild(link);
//   }
// }, []);

export default function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  const post = blogs.find((b) => b.id === id);

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
