import React from "react";
import { Link } from "react-router-dom";
import { blogs } from "../../src/data/blog";
import { link } from "fs";
import Navbar from "./landing/Navbar";

export default function BlogList() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Blog</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-40 object-cover"
                />
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
        </div>
      </div>
    </>
  );
}