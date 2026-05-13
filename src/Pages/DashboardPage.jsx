import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Avatar from "../components/UI/Avatar";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import InputField from "../components/UI/InputField";
import Modal from "../components/UI/Modal";
import Select from "../components/UI/Select";
import { createPost, getAllPosts, likePost } from "../services/postService";
import { Editor } from "@monaco-editor/react";

export default function DashboardPage() {
  const { user } = useSelector((state) => state.auth);
  const userId = user?.id || user?._id || user?.user?.id || user?.user?._id;

  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postForm, setPostForm] = useState({
    title: "",
    content: "",
    image: "",
    category: "Technology",
    isPremium: false,
  });

  const categories = ["Technology", "Design", "Programming", "Lifestyle", "Business"];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getAllPosts();
      setPosts(data.posts || []);
    
    } catch {
      setPosts([
        { _id: "1", title: "Shipping React features faster", content: "A practical workflow for keeping momentum.", author: { name: "Alice" }, likes: [1, 2], comments: [1], views: Array(120).fill(""), category: "Programming" },
        { _id: "2", title: "Design QA for modern teams", content: "Simple checks that prevent visual regressions.", author: { name: "Bob" }, likes: [1], comments: [], views: Array(45).fill(""), category: "Design" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePostFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPostForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const data = await createPost(postForm);
      setPosts([data.post, ...posts]);
      setPostForm({ title: "", content: "", image: "", category: "Technology", isPremium: false });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error creating post:", err);
    }
  };

  const handleLike = async (postId) => {
    if (!userId) return;

    setPosts((currentPosts) =>
      currentPosts.map((post) => {
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

  const stats = [
    { label: "Posts", value: posts.length || 0 },
    { label: "Likes", value: posts.reduce((acc, post) => acc + (post.likes?.length || 0), 0) },
    { label: "Comments", value: posts.reduce((acc, post) => acc + (post.comments?.length || 0), 0) },
  ];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-brand-300/20 bg-gradient-to-br from-zinc-950 to-brand-900/20 p-0">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_360px] lg:items-center">
          <div className="space-y-4">
            <span className="app-chip">Creator studio</span>
            <h1 className="section-title">Manage posts and track engagement</h1>
            <p className="section-copy max-w-2xl">Create quickly, monitor activity, and iterate on what resonates with your audience.</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>Create post</Button>
              <Button variant="secondary" onClick={fetchPosts}>Refresh</Button>
            </div>
          </div>

          <div className="grid h-fit grid-cols-3 gap-3">
            {stats.map((item) => (
              <div key={item.label} className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/60 p-4 text-center">
                <p className="text-2xl font-bold text-zinc-100">{item.value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Post">
        <form onSubmit={handleCreatePost} className="space-y-4">
          <InputField label="Title" name="title" value={postForm.title} onChange={handlePostFormChange} placeholder="Enter a clear title" required />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Category</label>
            <Select
              name="category"
              value={postForm.category}
              options={categories}
              onChange={handlePostFormChange}
              className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-zinc-100 hover:border-white/20 focus:border-brand-300 focus:outline-none"
            />
          </div>

          <InputField label="Content" type="textarea" name="content" value={postForm.content} onChange={handlePostFormChange} placeholder="Write your content" rows="6" required />
          <InputField label="Image URL" type="url" name="image" value={postForm.image} onChange={handlePostFormChange} placeholder="https://example.com/image.jpg" />

          <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black p-3">
            <input
              type="checkbox"
              name="isPremium"
              checked={postForm.isPremium}
              onChange={handlePostFormChange}
              className="h-4 w-4 rounded border-white/20 bg-black text-brand-400"
            />
            <span className="text-sm text-zinc-300">Mark as premium content</span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Publish</Button>
          </div>
        </form>
      </Modal>

      <div className="space-y-4">
        {loading ? (
          <p className="py-10 text-center text-zinc-500">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="py-10 text-center text-zinc-500">No posts available.</p>
        ) : (
          <div className="columns-1 gap-4 md:columns-2">
            {posts.map((post) => {
            const categoryLabel =
              typeof post.category === "string"
                ? post.category.trim()
                : "";
            const hasImage =
              typeof post.image === "string" &&
              post.image.trim().length > 0;
            const postCode =
              typeof post.code === "string"
                ? post.code.trim()
                : "";
            const hasCode = postCode.length > 0;
            const contentPreview =
              typeof post.content === "string"
                ? post.content.trim()
                : "";
            const isCompact = !hasImage && !hasCode;

            return (
              <article key={post._id} className="mb-4 break-inside-avoid">
                <Card
                  hoverable
                  className={`h-fit p-4 sm:p-5 ${isCompact ? "space-y-2.5" : "space-y-3.5"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <Link to={`/user/${post.author?.username || "demo_user"}`} className="flex min-w-0 items-center gap-3">
                      <Avatar src={post.author?.profilePic} fallback={post.author?.name || "U"} size="md" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-100">{post.author?.name || "User"}</p>
                        <p className="text-xs text-zinc-500">{new Date().toLocaleDateString()}</p>
                      </div>
                    </Link>
                    {categoryLabel && (
                      <span className="rounded-full border border-white/10 bg-black px-3 py-1 text-xs text-zinc-400">
                        {categoryLabel}
                      </span>
                    )}
                  </div>

                  {hasImage && (
                    <Link to={`/post/${post._id}`} className="block overflow-hidden rounded-2xl border border-white/10">
                      <img src={post.image} alt="post" className="h-44 w-full object-cover transition-transform duration-500 hover:scale-[1.02] sm:h-52" loading="lazy" />
                    </Link>
                  )}

                  <div className="space-y-1.5">
                    <h3 className="font-display text-2xl leading-tight text-zinc-100 sm:text-3xl">
                      <Link to={`/post/${post._id}`} className="transition-colors hover:text-brand-200">{post.title}</Link>
                    </h3>

                    {hasCode && (
                      <div className="overflow-hidden rounded-xl border border-white/10">
                        <Editor
                          height="180px"
                          defaultLanguage={post.language || "python"}
                          theme="vs-dark"
                          defaultValue={postCode}
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
                            automaticLayout: true,
                          }}
                        />
                      </div>
                    )}

                    {contentPreview && (
                      <p className={`text-sm text-zinc-400 ${isCompact ? "line-clamp-2" : "line-clamp-3"}`}>
                        {contentPreview}
                      </p>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-2.5 border-t border-white/10 pt-2.5 text-xs text-zinc-400">
                    <button onClick={() => handleLike(post._id)} className="rounded-xl border border-white/10 bg-black px-2.5 py-1 transition-all duration-200 hover:border-red-400/40 hover:text-red-200 active:scale-[0.98]">
                      {post.likes?.length || 0} likes
                    </button>
                    <span>{post.comments?.length || 0} comments</span>
                    <span className="ml-auto">{post.views?.length || 0} views</span>
                  </div>
                </Card>
              </article>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
}
