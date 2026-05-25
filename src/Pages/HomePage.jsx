import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";

import Card from "../components/UI/Card";
import Skeleton from "../components/UI/Skeleton";

import { Editor } from "@monaco-editor/react";
import {
  categogary,
  getAllPosts,
  likePost,
} from "../services/postService";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("json", json);
hljs.registerLanguage("python", python);
hljs.registerLanguage("bash", bash);



// ================= PREVIEW =================





// ================= ICONS =================

const UpvoteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 19V5M5 12l7-7 7 7"/>
  </svg>
);

const CommentIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);



// ================= FEED CARD =================

function FeedCard({ post }) {

  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const userId =
    user?.id ||
    user?._id ||
    user?.user?.id ||
    user?.user?._id;

  const [liked, setLiked] = useState(() => {
    if (!userId || !post.likes) return false;

    return post.likes.includes(userId);
  });

  const [likeCount, setLikeCount] = useState(
    post.likes?.length || 0
  );


  const authorId =
    post.author?.id ||
    post.author?._id ||
    "demo";

  const mediaUrl = [
    post.image,
    post.mediaUrl,
    post.videoUrl,
    post.audioUrl,
    post.gifUrl,
  ].find((value) => typeof value === "string" && value.trim()) || null;

  const authorName =
    (post.author?.name || post.author?.username || "").trim() ||
    "Community member";

  const username = (
    post.author?.username ||
    post.author?.name ||
    "user"
  )
    .toString()
    .trim()
    .replace(/\s+/g, "_")
    .toLowerCase();

  const tags = Array.from(
    new Set(
      (Array.isArray(post.tags)
        ? post.tags
        : [post.tags, post.tag, post.category]
      )
        .filter((tag) => typeof tag === "string")
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );

  const postExcerpt =
    typeof post.content === "string"
      ? post.content.trim()
      : "";


  const handleLike = async (e) => {

    e.preventDefault();

    if (!userId) {
      navigate("/login");
      return;
    }

    const willLike = !liked;

    setLiked(willLike);

    setLikeCount((count) =>
      count + (willLike ? 1 : -1)
    );

    try {

      await likePost(post._id);

    } catch (err) {

      setLiked(!willLike);

      setLikeCount((count) =>
        count + (willLike ? -1 : 1)
      );
    }
  };


  return (
    <div className="border-b border-white/[0.08] py-6 transition-colors duration-200 first:pt-0 last:border-0 sm:py-8">

      <div className="flex items-start gap-4">

        <Link
          to={`/user/${authorId}`}
          className="mt-0.5 shrink-0 transition-transform duration-200 hover:scale-[1.02]"
        >

          {post.author?.profilePic ? (

            <img
              src={post.author.profilePic}
              alt={authorName}
              className="h-11 w-11 rounded-full border border-white/10 object-cover"
            />

          ) : (

            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-zinc-900 font-semibold text-zinc-100">

              {authorName
                ? authorName.slice(0, 1).toUpperCase()
                : "?"}

            </div>

          )}

        </Link>


        <div className="min-w-0 flex-1 space-y-3">

          <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[15px] leading-tight">

            <Link
              to={`/user/${authorId}`}
              className="font-bold text-zinc-100 transition-colors hover:text-brand-100"
            >
              {authorName}
            </Link>

            <span className="max-w-full break-all text-zinc-500">
              @{username}
            </span>

          </div>


          <div className="space-y-2 text-[15px] leading-relaxed">

            <Link
              to={`/post/${post._id}`}
              className="group block transition-opacity hover:opacity-95"
            >

              <span className="font-bold text-zinc-100 transition-colors group-hover:text-brand-100">
                {post.title}
              </span>

            </Link>

            {postExcerpt && (
              <p className="line-clamp-4 text-[14px] leading-relaxed text-zinc-300">
                {postExcerpt}
              </p>
            )}

          </div>


          {/* TAGS */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">

              {tags.map((tag, index) => (

                <span
                  key={`${tag}-${index}`}
                  className="rounded-lg border border-white/10 bg-zinc-900 px-2 py-1 text-xs text-zinc-300"
                >
                  {tag}
                </span>

              ))}

            </div>
          )}


          {/* IMAGE */}
          {mediaUrl && (

            <div className="mt-3 overflow-hidden rounded-[1.25rem] border border-white/[0.08] bg-black/30">

              <img
                src={mediaUrl}
                alt={post.title}
                className="max-h-[500px] w-full object-cover transition-transform duration-500 hover:scale-[1.01]"
                loading="lazy"
              />

            </div>

          )}


          {/* CODE */}
          {post.iscode && (
            <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#272d44]">
              <div className="flex items-center justify-between bg-[#31395A] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                </div>

                <p className="text-xs uppercase tracking-[0.12em] text-zinc-300">
                  {post.language || "code snippet"}
                </p>
              </div>

              <Editor
                height="200px"
                defaultLanguage={post.language || "python"}
                theme="vs-dark"
                defaultValue={post.code}
                options={{
                  fontSize: 14,
                  minimap: {
                    enabled: false,
                  },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  lineNumbersMinChars: 3,
                  glyphMargin: false,
                  folding: false,
                  lineDecorationsWidth: 10,
                  readOnly: true,
                  renderLineHighlight: "none",
                }}
              />
            </div>
          )}


          {/* ACTIONS */}
          <div className="flex flex-wrap items-center gap-3 pt-2 sm:gap-4">

            <button
              onClick={handleLike}
              className={`inline-flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-sm tabular-nums transition-all duration-200 active:scale-[0.98] ${liked
                ? "border-red-400/35 bg-red-500/10 text-red-100"
                : "border-white/10 text-zinc-300 hover:border-white/20 hover:text-white"
                }`}
            >

              <UpvoteIcon />

              <span>
                {likeCount}
              </span>

            </button>


            <button
              onClick={() =>
                navigate(`/post/${post._id}`)
              }
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-2.5 py-1.5 text-sm text-zinc-400 transition-all duration-200 hover:border-white/20 hover:text-zinc-200 active:scale-[0.98]"
            >

              <CommentIcon />

              <span>
                {post.comments?.length || 0}
              </span>

            </button>


            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-2.5 py-1.5 text-sm text-zinc-500">

              <EyeIcon />

              <span className="tabular-nums">
                {post.views?.length || 0}
              </span>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}



// ================= HOME PAGE =================

export default function HomePage({ search, setSearch, searchpost, setSearchpost }) {

  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] =
    useState("All");


  const categories = [
    "All",
    "Technology",
    "Design",
    "Programming",
    "Lifestyle",
    "Business",
  ];

  


  // FETCH POSTS
  useEffect(() => {

    const fetchPosts = async () => {

      try {

        setLoading(true);

        // ALL POSTS
        if (activeCategory === "All") {

          const data = await getAllPosts();

          setPosts(data.posts || []);

        }

        // CATEGORY POSTS
        else {

          const data = await categogary({
            tag: activeCategory,
          });

          setPosts(data.post || []);

        }

      } catch (err) {

        console.log(err);

        setPosts([]);

      } finally {

        setLoading(false);

      }

    };

    fetchPosts();

  }, [activeCategory]);

  // ================= RENDER =================
  // FETCH POSTS
  useEffect(() => {

    const fetchPosts = async () => {

      try {

        setLoading(true);
console.log(searchpost)
        // ALL POSTS
        setPosts(searchpost.posts || []);
      

      } catch (err) {

        console.log(err);


      } finally {

        setLoading(false);

      }

    };

    fetchPosts();

  }, [search]);


 


  return (
    <div className="space-y-6">

      <Card className="overflow-hidden border-brand-300/20 bg-gradient-to-br from-zinc-950 via-zinc-950 to-brand-900/20 p-0">

        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr]">

          <div className="space-y-4">

            <span className="app-chip">
              Signal Feed
            </span>

            <h1 className="section-title">
              Build. Share. Iterate.
            </h1>

            <p className="section-copy max-w-2xl">
              Discover high-signal posts from developers and designers.
            </p>

            


            {/* CATEGORY BUTTONS */}
            <div className="flex flex-wrap gap-2">

              {categories.map((category) => (

                <button
                  key={category}
                  onClick={() =>
                    setActiveCategory(category)
                  }
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-200 active:scale-[0.98]

                  ${
                    activeCategory === category
                      ? "border-brand-300/50 bg-brand-300/20 text-brand-100 shadow-[0_0_0_1px_rgba(239,68,68,0.14)]"
                      : "border-white/10 bg-black text-zinc-400 hover:border-white/20 hover:text-zinc-200 hover:-translate-y-px"
                  }`}
                >
                  {category}
                </button>

              ))}

            </div>

          </div>


          {/* STATS */}
          <div className="flex justify-end">

            <div className="w-full max-w-[220px] rounded-2xl border border-white/10 bg-black/60 p-4">

              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                Posts
              </p>

              <p className="mt-2 text-xl font-bold text-zinc-100">
                {posts.length}
              </p>

            </div>

          </div>

        </div>

      </Card>



      {/* POSTS SECTION */}

      {loading ? (

        <div className="space-y-4">

          {Array.from({ length: 3 }).map((_, index) => (

            <Skeleton
              key={index}
              type="card"
              className="h-64"
            />

          ))}

        </div>

      ) : posts.length === 0 ? (

        <Card className="py-16 text-center">

          <h2 className="font-display text-4xl text-zinc-100">
            No posts in this lane yet
          </h2>

          <p className="mt-2 text-zinc-500">
            Switch category or publish a fresh post to populate this stream.
          </p>

          <button
            onClick={() =>
              setActiveCategory("All")
            }
            className="mt-5 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-400 active:scale-[0.98]"
          >
            Show all
          </button>

        </Card>

      ) : (

        <div className="flex flex-col border-t border-white/[0.08] pt-6 sm:pt-8">

          {posts.map((post) => (

            <FeedCard
              key={post._id}
              post={post}
            />

          ))}

        </div>

      )}

    </div>
  );
}
