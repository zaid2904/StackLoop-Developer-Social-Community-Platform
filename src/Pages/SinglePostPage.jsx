import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import Avatar from "../components/UI/Avatar";
import Card from "../components/UI/Card";
import CodeSnippetWindow from "../components/UI/CodeSnippetWindow";
import Skeleton from "../components/UI/Skeleton";
import Toast from "../components/UI/Toast";
import { createComment, getCommentsByPostId, getPostById, likePost } from "../services/postService";

const SEED_COMMENTS = [
  { id: "s1", author: "Priya Sharma", profilePic: "https://i.pravatar.cc/150?u=priya", text: "Clear writing and practical examples. This was useful.", date: new Date(Date.now() - 3600000 * 6).toISOString(), likes: 12 },
  { id: "s2", author: "James Carter", profilePic: "https://i.pravatar.cc/150?u=james", text: "Good framing. I like the workflow section.", date: new Date(Date.now() - 3600000 * 14).toISOString(), likes: 8 },
  { id: "s3", author: "Aisha Yusuf", profilePic: "https://i.pravatar.cc/150?u=aisha", text: "The repeatable process takeaway is spot on.", date: new Date(Date.now() - 3600000 * 28).toISOString(), likes: 5 },
];

function timeAgo(dateString) {
  const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateString).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function splitContentBlocks(content = "") {
  const blocks = [];
  const fenceRegex = /```([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = fenceRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const before = content.slice(lastIndex, match.index).trim();
      if (before) {
        before.split("\n").forEach((paragraph) => {
          if (paragraph.trim()) blocks.push({ type: "paragraph", value: paragraph.trim() });
        });
      }
    }

    blocks.push({ type: "code", value: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }

  const tail = content.slice(lastIndex).trim();
  if (tail) {
    tail.split("\n").forEach((paragraph) => {
      if (paragraph.trim()) blocks.push({ type: "paragraph", value: paragraph.trim() });
    });
  }

  return blocks;
}

export default function SinglePostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const userId = user?.id || user?._id || user?.user?.id || user?.user?._id;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getPostById(id);
        setPost(data.post);
        setLikeCount(data.post.likes?.length || 0);
        if (userId && data.post.likes) setLiked(data.post.likes.includes(userId));

        try {
          const commentsData = await getCommentsByPostId(id);
          if (commentsData.comments?.length) {
            setComments(
              commentsData.comments.map((comment) => ({
                id: comment._id,
                author: comment.user?.name || "Unknown",
                profilePic: null,
                text: comment.text,
                date: comment.createdAt,
                likes: 0,
                isNew: false,
              }))
            );
          } else {
            setComments([]);
          }
        } catch {
          setComments(SEED_COMMENTS);
        }
      } catch {
        const dummy = {
          _id: id,
          title: "The Future of Web Development",
          content:
            "Web development keeps evolving from monolithic stacks to modular systems.\n\nConsistency comes from repeatable process, not motivation.\n\nPick one publishing day per week and split your workflow into capture, outline, draft, and refine.",
          image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
          category: "Technology",
          author: { id: "demo", name: "Alex Johnson", profilePic: "https://i.pravatar.cc/150?u=demo" },
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          readTime: "5 min read",
          likes: [1, 2, 3, 4, 5],
          views: Array(98).fill(0),
        };
        setPost(dummy);
        setLikeCount(dummy.likes.length);
        if (userId && dummy.likes) setLiked(dummy.likes.includes(userId));
        setComments(SEED_COMMENTS);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, userId]);

  const handleLike = async () => {
    if (!user) {
      setToast({ message: "Please log in to like this post", type: "error" });
      return;
    }

    const willLike = !liked;
    setLiked(willLike);
    setLikeCount((count) => count + (willLike ? 1 : -1));

    try {
      await likePost(id);
    } catch {
      setLiked(!willLike);
      setLikeCount((count) => count + (willLike ? -1 : 1));
      setToast({ message: "Failed to update like status", type: "error" });
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentLoading(true);

    try {
      const result = await createComment(id, commentText.trim());
      const newCommentData = result.commentsaved;
      setComments((prev) => [
        {
          id: newCommentData._id,
          author: newCommentData.user?.name || "You",
          profilePic: null,
          text: newCommentData.text,
          date: newCommentData.createdAt,
          likes: 0,
          isNew: true,
        },
        ...prev,
      ]);
      setCommentText("");
      setToast({ message: "Comment posted", type: "success" });
    } catch {
      setToast({ message: "Failed to post comment", type: "error" });
    } finally {
      setCommentLoading(false);
    }
  };

  const handleShare = async () => {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(window.location.href);
    setToast({ message: "Link copied", type: "info" });
  };

  const handleCopyCode = async (code) => {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1400);
  };

  if (loading) {
    return (
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <Skeleton type="image" className="h-[360px] rounded-3xl" />
          <Skeleton type="title" className="h-10 w-2/3" />
          <Skeleton type="text" />
          <Skeleton type="text" className="w-4/5" />
        </div>
        <div className="space-y-4">
          <Skeleton type="card" className="h-52" />
          <Skeleton type="card" className="h-40" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-20 text-center">
        <p className="text-zinc-400">Post not found</p>
        <button onClick={() => navigate(-1)} className="mt-2 text-sm text-brand-200 hover:text-brand-100">Go back</button>
      </div>
    );
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <article className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <Card className="overflow-hidden p-0">
            {post.image && (
              <div className="relative h-[300px] overflow-hidden sm:h-[380px]">
                <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
            )}

            <div className="space-y-6 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-zinc-500">
                <span>{post.readTime || "4 min read"}</span>
                <span>{post.views?.length || 0} views</span>
                <span>{comments.length} comments</span>
              </div>

              <h1 className="font-display text-5xl leading-tight text-zinc-100 sm:text-6xl">{post.title}</h1>

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
                <Link to={`/user/${post.author?.id || "demo"}`} className="flex items-center gap-3">
                  <Avatar src={post.author?.profilePic} fallback={post.author?.name} size="md" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">{post.author?.name}</p>
                    <p className="text-xs text-zinc-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </Link>

                <div className="flex flex-wrap gap-2">
                  <button onClick={handleLike} className={`rounded-xl border px-3 py-1.5 text-sm ${liked ? "border-red-400/40 text-red-200" : "border-white/10 text-zinc-300 hover:border-white/20"}`}>
                    {likeCount} likes
                  </button>
                  <button onClick={handleShare} className="rounded-xl border border-white/10 px-3 py-1.5 text-sm text-zinc-300 hover:border-white/20">Share</button>
                </div>
              </div>

              <div className="space-y-4 text-zinc-300">
                {splitContentBlocks(post.content).map((block, index) =>
                  block.type === "code" ? (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between px-1 text-xs uppercase tracking-[0.14em] text-zinc-500">
                        <span className="px-1">Snippet</span>
                        <button onClick={() => handleCopyCode(block.value)} className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-zinc-300 hover:border-white/20">
                          {copiedCode ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <CodeSnippetWindow code={block.value} maxHeight={360} />
                    </div>
                  ) : (
                    <p key={index} className="leading-8 text-zinc-300">{block.value}</p>
                  )
                )}
              </div>
            </div>
          </Card>

          <section id="comments" className="space-y-4">
            <Card className="p-4">
              <p className="app-chip">Discussion</p>
              <form onSubmit={handleAddComment} className="mt-4 flex gap-3">
                <Avatar size="md" fallback="You" />
                <div className="flex-1 space-y-3">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-brand-300 focus:outline-none"
                    placeholder="Add your comment"
                    required
                  />
                  <div className="flex justify-end">
                    <button disabled={commentLoading || !commentText.trim()} className="rounded-xl bg-brand-400 px-4 py-2 text-sm font-semibold text-black hover:bg-brand-300 disabled:opacity-60">
                      {commentLoading ? "Posting..." : "Post comment"}
                    </button>
                  </div>
                </div>
              </form>
            </Card>

            <div className="space-y-3">
              {comments.length === 0 ? (
                <Card className="p-4 text-sm text-zinc-500">No comments yet.</Card>
              ) : (
                comments.map((comment) => (
                  <Card key={comment.id} className={`${comment.isNew ? "border-brand-300/35" : ""} p-4`}>
                    <div className="flex gap-3">
                      <Avatar src={comment.profilePic} fallback={comment.author} size="md" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-zinc-100">{comment.author}</p>
                          <p className="text-xs text-zinc-500">{timeAgo(comment.date)}</p>
                        </div>
                        <p className="text-sm text-zinc-300">{comment.text}</p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </section>
        </div>

        <aside className="hidden space-y-4 2xl:block">
          <Card className="p-4">
            <p className="app-chip">Post stats</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              {[{ label: "Likes", value: likeCount }, { label: "Comments", value: comments.length }, { label: "Views", value: post.views?.length || 0 }, { label: "Read", value: post.readTime || "4m" }].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/10 bg-black p-2">
                  <p className="text-sm font-semibold text-zinc-100">{item.value}</p>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">{item.label}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <p className="app-chip">Actions</p>
            <div className="mt-3 space-y-2">
              <button onClick={handleShare} className="w-full rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:border-white/20">Copy link</button>
              <button onClick={() => navigate(-1)} className="w-full rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:border-white/20">Back</button>
            </div>
          </Card>
        </aside>
      </article>
    </>
  );
}
