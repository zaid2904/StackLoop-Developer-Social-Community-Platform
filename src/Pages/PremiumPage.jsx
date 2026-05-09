import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getPremiumPosts, likePost } from "../services/postService";
import { buyrazorpay } from "../services/paymentService";
import Card from "../components/UI/Card";
import Avatar from "../components/UI/Avatar";
import Button from "../components/UI/Button";

export default function PremiumPage() {
  const { user } = useSelector((state) => state.auth);
  const userId = user?.id || user?._id || user?.user?.id || user?.user?._id;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setAccessDenied(false);
      const data = await getPremiumPosts();
      setPosts(data.posts || []);
    } catch (err) {
      if (err.response?.status === 403) setAccessDenied(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (!userId) return;

    setPosts((current) =>
      current.map((post) => {
        if (post._id !== postId) return post;
        const hasLiked = post.likes?.includes(userId);
        return {
          ...post,
          likes: hasLiked ? post.likes.filter((id) => id !== userId) : [...(post.likes || []), userId],
        };
      })
    );

    try {
      await likePost(postId);
    } catch {
      fetchPosts();
    }
  };

  if (accessDenied) {
    return (
      <Card className="mx-auto max-w-4xl border-brand-300/20 bg-gradient-to-br from-zinc-950 to-brand-900/20 py-14 text-center">
        <h1 className="font-display text-6xl text-zinc-100">Unlock premium</h1>
        <p className="mx-auto mt-3 max-w-2xl text-zinc-400">Access long-form deep dives, advanced tutorials, and premium creator content.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={buyrazorpay}>Upgrade now</Button>
          <Link to="/" className="inline-flex items-center rounded-2xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:border-white/20">Back to feed</Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-brand-300/20 bg-gradient-to-br from-zinc-950 to-brand-900/20 p-0">
        <div className="space-y-4 p-6 sm:p-8">
          <span className="app-chip">Premium</span>
          <h1 className="section-title">Members-only knowledge vault</h1>
          <p className="section-copy max-w-3xl">Curated content for creators who want deeper frameworks, faster execution, and better craft.</p>
        </div>
      </Card>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-[320px] animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card className="py-16 text-center">
          <h2 className="font-display text-4xl text-zinc-100">No premium posts yet</h2>
          <p className="mt-2 text-zinc-500">Check back soon for new exclusive content.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <Card key={post._id} hoverable className="flex h-full flex-col overflow-hidden p-0">
              <div className="relative h-48 overflow-hidden border-b border-white/10">
                {post.image ? <img src={post.image} alt={post.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center bg-black text-zinc-500">No image</div>}
                <span className="absolute left-3 top-3 rounded-full bg-brand-300 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-black">Premium</span>
              </div>

              <div className="flex flex-1 flex-col space-y-3 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{post.category || "Expert"}</p>
                <h3 className="line-clamp-2 font-display text-3xl text-zinc-100">
                  <Link to={`/post/${post._id}`} className="hover:text-brand-200">{post.title}</Link>
                </h3>
                <p className="line-clamp-3 text-sm text-zinc-400">{post.content}</p>

                <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3">
                  <Link to={`/user/${post.author?.username || "demo"}`} className="flex items-center gap-2">
                    <Avatar src={post.author?.profilePic} fallback={post.author?.name || "E"} size="xs" />
                    <span className="text-xs text-zinc-300">{post.author?.name || "Expert"}</span>
                  </Link>
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`rounded-xl border px-2 py-1 text-xs ${post.likes?.includes(userId) ? "border-red-400/40 text-red-200" : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200"}`}
                  >
                    {post.likes?.length || 0} likes
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
