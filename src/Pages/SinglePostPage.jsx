import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import Avatar from "../components/UI/Avatar";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import CodeSnippetWindow from "../components/UI/CodeSnippetWindow";
import Modal from "../components/UI/Modal";
import Skeleton from "../components/UI/Skeleton";
import Toast from "../components/UI/Toast";
import axios from "../services/api";
import { createComment, getCommentsByPostId, getPostById, likePost } from "../services/postService";

const SEED_COMMENTS = [
  {
    id: "s1",
    userId: "seed-1",
    author: "Priya Sharma",
    profilePic: "https://i.pravatar.cc/150?u=priya",
    text: "Clear writing and practical examples. This was useful.",
    date: new Date(Date.now() - 3600000 * 6).toISOString(),
    likes: 12,
    depth: 0,
    parentId: null,
  },
  {
    id: "s2",
    userId: "seed-2",
    author: "James Carter",
    profilePic: "https://i.pravatar.cc/150?u=james",
    text: "Good framing. I like the workflow section.",
    date: new Date(Date.now() - 3600000 * 14).toISOString(),
    likes: 8,
    depth: 0,
    parentId: null,
  },
  {
    id: "s3",
    userId: "seed-3",
    author: "Aisha Yusuf",
    profilePic: "https://i.pravatar.cc/150?u=aisha",
    text: "The repeatable process takeaway is spot on.",
    date: new Date(Date.now() - 3600000 * 28).toISOString(),
    likes: 5,
    depth: 0,
    parentId: null,
  },
];

const LIST_ITEM_REGEX = /^(\s*)([-*+]|(\d+)\.)\s+(.*)$/;
const HEADING_REGEX = /^(#{1,6})\s+(.*)$/;
const BLOCKQUOTE_REGEX = /^>\s?(.*)$/;
const HORIZONTAL_RULE_REGEX = /^(-{3,}|\*{3,}|_{3,})$/;
const CODE_FENCE_REGEX = /^```([\w-+]*)\s*$/;

function escapeHtml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInlineMarkdown(text = "") {
  const escaped = escapeHtml(text);

  return escaped
    .replace(/`([^`]+)`/g, '<code class="rounded-md border border-white/10 bg-black/80 px-1.5 py-0.5 font-mono text-[0.9em] text-brand-100">$1</code>')
    .replace(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="text-brand-200 underline decoration-brand-300/40 underline-offset-4 hover:text-brand-100">$1</a>');
}

function parseMarkdownBlocks(content = "") {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  const blocks = [];

  const pushParagraph = (paragraphLines) => {
    const value = paragraphLines.join(" ").replace(/\s+/g, " ").trim();

    if (value) {
      blocks.push({ type: "paragraph", value });
    }
  };

  const isBlockBoundary = (line) => {
    const trimmed = line.trim();
    return (
      !trimmed ||
      trimmed.startsWith("```") ||
      HEADING_REGEX.test(trimmed) ||
      BLOCKQUOTE_REGEX.test(trimmed) ||
      HORIZONTAL_RULE_REGEX.test(trimmed) ||
      LIST_ITEM_REGEX.test(trimmed)
    );
  };

  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    const fenceMatch = trimmed.match(CODE_FENCE_REGEX);
    if (fenceMatch) {
      const codeLines = [];
      const language = fenceMatch[1] || "";
      index += 1;

      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }

      if (index < lines.length) {
        index += 1;
      }

      blocks.push({ type: "code", value: codeLines.join("\n").trimEnd(), language });
      continue;
    }

    const headingMatch = trimmed.match(HEADING_REGEX);
    if (headingMatch) {
      blocks.push({ type: "heading", level: headingMatch[1].length, value: headingMatch[2].trim() });
      index += 1;
      continue;
    }

    if (HORIZONTAL_RULE_REGEX.test(trimmed)) {
      blocks.push({ type: "divider" });
      index += 1;
      continue;
    }

    const quoteMatch = trimmed.match(BLOCKQUOTE_REGEX);
    if (quoteMatch) {
      const quoteLines = [quoteMatch[1].trim()];
      index += 1;

      while (index < lines.length) {
        const nextLine = lines[index].trim();
        const nextQuoteMatch = nextLine.match(BLOCKQUOTE_REGEX);

        if (!nextQuoteMatch) {
          break;
        }

        quoteLines.push(nextQuoteMatch[1].trim());
        index += 1;
      }

      blocks.push({ type: "blockquote", value: quoteLines.join(" ").replace(/\s+/g, " ").trim() });
      continue;
    }

    const listMatch = trimmed.match(LIST_ITEM_REGEX);
    if (listMatch) {
      const ordered = Boolean(listMatch[3]);
      const items = [];

      while (index < lines.length) {
        const currentMatch = lines[index].trim().match(LIST_ITEM_REGEX);

        if (!currentMatch || Boolean(currentMatch[3]) !== ordered) {
          break;
        }

        items.push(currentMatch[4].trim());
        index += 1;
      }

      blocks.push({ type: "list", ordered, items });
      continue;
    }

    const paragraphLines = [trimmed];
    index += 1;

    while (index < lines.length && !isBlockBoundary(lines[index])) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    pushParagraph(paragraphLines);
  }

  return blocks;
}

function renderMarkdownBlock(block, index) {
  if (block.type === "heading") {
    const headingLevel = Math.min(Math.max(block.level, 1), 6);
    const HeadingTag = `h${headingLevel}`;
    const headingClasses = {
      1: "text-3xl font-display font-semibold leading-tight text-zinc-100 sm:text-4xl",
      2: "text-2xl font-display font-semibold leading-tight text-zinc-100 sm:text-3xl",
      3: "text-xl font-display font-semibold leading-tight text-zinc-100 sm:text-2xl",
      4: "text-lg font-display font-semibold leading-tight text-zinc-100",
      5: "text-base font-display font-semibold leading-tight text-zinc-100",
      6: "text-sm font-display font-semibold uppercase tracking-[0.14em] text-zinc-100",
    };

    return (
      <HeadingTag
        key={`heading-${index}`}
        className={headingClasses[headingLevel]}
        dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(block.value) }}
      />
    );
  }

  if (block.type === "divider") {
    return <div key={`divider-${index}`} className="h-px w-full bg-white/10" />;
  }

  if (block.type === "blockquote") {
    return (
      <blockquote
        key={`blockquote-${index}`}
        className="border-l-2 border-brand-300/40 pl-4 text-zinc-300"
        dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(block.value) }}
      />
    );
  }

  if (block.type === "list") {
    const ListTag = block.ordered ? "ol" : "ul";
    const listClasses = block.ordered ? "list-decimal" : "list-disc";

    return (
      <ListTag key={`list-${index}`} className={`space-y-2 pl-5 ${listClasses}`}>
        {block.items.map((item, itemIndex) => (
          <li
            key={`${index}-${itemIndex}`}
            className="pl-1 leading-8 text-zinc-300"
            dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(item) }}
          />
        ))}
      </ListTag>
    );
  }

  if (block.type === "code") {
    return (
      <div key={`code-${index}`} className="space-y-2">
        <div className="flex items-center justify-between px-1 text-xs uppercase tracking-[0.14em] text-zinc-500">
          <span className="px-1">Snippet</span>
        </div>
        <CodeSnippetWindow code={block.value} maxHeight={360} />
      </div>
    );
  }

  return (
    <p
      key={`paragraph-${index}`}
      className="leading-8 text-zinc-300"
      dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(block.value) }}
    />
  );
}

function timeAgo(dateString) {
  const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateString).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function CommentActionIcon({ type, className = "h-4 w-4" }) {
  if (type === "menu") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="5" r="1.7" />
        <circle cx="12" cy="12" r="1.7" />
        <circle cx="12" cy="19" r="1.7" />
      </svg>
    );
  }

  if (type === "edit") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 20h4l10-10a2 2 0 0 0-4-4L4 16v4z" />
      </svg>
    );
  }

  if (type === "trash") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 7h16" />
        <path d="M9 7V5h6v2" />
        <path d="M7.5 7l1 12h7l1-12" />
      </svg>
    );
  }

  if (type === "chat") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 5h12a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-6l-4 3v-3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3z" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function getCommentDepth(comment) {
  const depthValue = Number(comment?.depth);
  if (Number.isFinite(depthValue) && depthValue > 0) return depthValue;
  return comment?.parentId ? 1 : 0;
}

export default function SinglePostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const userId = user?.id || user?._id || user?.user?.id || user?.user?._id;
  const currentUserLabel =
    (user?.name || user?.username || user?.user?.name || user?.user?.username || "").trim().toLowerCase();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [activeCommentMenuId, setActiveCommentMenuId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [commentDeleteTarget, setCommentDeleteTarget] = useState(null);
  const [copiedCodeId, setCopiedCodeId] = useState(null);

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
              commentsData.comments.map((comment, index) => ({
                id: comment._id || `comment-${index}`,
                userId: comment.user?._id || comment.user?.id || null,
                author: comment.user?.name || "Unknown",
                profilePic: comment.user?.profilePic || comment.user?.avatar || null,
                text: comment.text || "",
                date: comment.createdAt || new Date().toISOString(),
                likes: Array.isArray(comment.likes) ? comment.likes.length : 0,
                depth: Number(comment.depth) || (comment.parentId || comment.parentCommentId || comment.parentComment ? 1 : 0),
                parentId: comment.parentId || comment.parentCommentId || comment.parentComment || null,
                editedAt: comment.updatedAt || null,
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

  useEffect(() => {
    const closeCommentMenu = () => setActiveCommentMenuId(null);
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setActiveCommentMenuId(null);
        setEditingCommentId(null);
        setEditingCommentText("");
      }
    };

    window.addEventListener("click", closeCommentMenu);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("click", closeCommentMenu);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

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
          id: newCommentData._id || `local-${Date.now()}`,
          userId: newCommentData.user?._id || newCommentData.user?.id || userId || null,
          author: newCommentData.user?.name || "You",
          profilePic: newCommentData.user?.profilePic || newCommentData.user?.avatar || null,
          text: newCommentData.text,
          date: newCommentData.createdAt || new Date().toISOString(),
          likes: 0,
          depth: 0,
          parentId: null,
          editedAt: null,
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

  const isCommentOwner = (comment) => {
    if (userId && comment?.userId) {
      return String(comment.userId) === String(userId);
    }

    if (!currentUserLabel || !comment?.author) return false;
    return String(comment.author).trim().toLowerCase() === currentUserLabel;
  };

  const toggleCommentMenu = (event, commentId) => {
    event.stopPropagation();
    setActiveCommentMenuId((current) => (current === commentId ? null : commentId));
  };

  const handleStartEditComment = (event, comment) => {
    event.stopPropagation();
    setActiveCommentMenuId(null);
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.text || "");
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const handleSaveEditedComment = (commentId) => {
    const nextText = editingCommentText.trim();
    if (!nextText) {
      
      setToast({ message: "Comment cannot be empty.", type: "error" });
      return;
    }

    setComments((currentComments) =>
      currentComments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              text: nextText,
              editedAt: new Date().toISOString(),
            }
          : comment
      )
    );
axios.put(`/auth/v2/comment/${commentId}`, {text : nextText})
console.log(commentId);

    setEditingCommentId(null);
    setEditingCommentText("");
    setToast({ message: "Comment updated.", type: "success" });
  };

  const handleRequestDeleteComment = (event, comment) => {
    event.stopPropagation();
    setActiveCommentMenuId(null);
    setCommentDeleteTarget(comment);
    axios.delete(`/auth/v2/comment/${comment.id}`)
    console.log(comment);
    
  };

  const handleConfirmDeleteComment = () => {
    if (!commentDeleteTarget) return;

    setComments((currentComments) =>
      currentComments.filter((comment) => comment.id !== commentDeleteTarget.id)
    );

    if (editingCommentId === commentDeleteTarget.id) {
      setEditingCommentId(null);
      setEditingCommentText("");
    }

    setCommentDeleteTarget(null);
    setToast({ message: "Comment deleted.", type: "info" });
  };

  const handleShare = async () => {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(window.location.href);
    setToast({ message: "Link copied", type: "info" });
  };

  const handleCopyCode = async (code, codeId) => {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(code);
    setCopiedCodeId(codeId);
    setTimeout(() => setCopiedCodeId((currentId) => (currentId === codeId ? null : currentId)), 1400);
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

  const markdownBlocks = parseMarkdownBlocks(post.content || "");
  const hasEmbeddedCode = markdownBlocks.some((block) => block.type === "code");
  const postCode = typeof post.code === "string" ? post.code.trim() : "";
  const displayBlocks = postCode && !hasEmbeddedCode ? [...markdownBlocks, { type: "code", value: postCode }] : markdownBlocks;

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
                {displayBlocks.map((block, index) =>
                  block.type === "code" ? (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between px-1 text-xs uppercase tracking-[0.14em] text-zinc-500">
                        <span className="px-1">Snippet</span>
                        <button onClick={() => handleCopyCode(block.value, `code-${index}`)} className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-zinc-300 hover:border-white/20">
                          {copiedCodeId === `code-${index}` ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <CodeSnippetWindow code={block.value} maxHeight={360} />
                    </div>
                  ) : (
                    renderMarkdownBlock(block, index)
                  )
                )}
              </div>
            </div>
          </Card>

          <section id="comments" className="space-y-4">
            <Card className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="app-chip">Discussion</p>
                <span className="rounded-full border border-white/10 bg-black/70 px-3 py-1 text-xs font-medium text-zinc-400">
                  {comments.length} comments
                </span>
              </div>

              <form onSubmit={handleAddComment} className="mt-4 flex gap-3">
                <Avatar size="md" fallback="You" />
                <div className="flex-1 space-y-3">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[118px] w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm leading-6 text-zinc-100 placeholder:text-zinc-600 transition-[border-color,box-shadow] duration-200 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-300/20"
                    placeholder="Share your thoughts"
                    required
                  />
                  <div className="flex justify-end">
                    <button
                      disabled={commentLoading || !commentText.trim()}
                      className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-400 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
                    >
                      {commentLoading ? "Posting..." : "Post comment"}
                    </button>
                  </div>
                </div>
              </form>
            </Card>

            <div className="space-y-3">
              {comments.length === 0 ? (
                <Card className="p-8 text-center">
                  <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/80 text-zinc-400">
                    <CommentActionIcon type="chat" className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-sm font-medium text-zinc-300">No comments yet</p>
                  <p className="mt-1 text-xs text-zinc-500">Start the conversation with the first comment.</p>
                </Card>
              ) : (
                comments.map((comment) => {
                  const owner = isCommentOwner(comment);
                  const isEditing = editingCommentId === comment.id;
                  const depth = Math.min(getCommentDepth(comment), 2);
                  const replyOffset = depth > 0 ? { marginLeft: `${depth * 16}px` } : undefined;

                  return (
                    <Card
                      key={comment.id}
                      className={`${comment.isNew ? "border-brand-300/35" : ""} group p-4 sm:p-5 transition-[transform,border-color,background-color,box-shadow] duration-200 hover:-translate-y-[1px] hover:border-white/20 hover:bg-zinc-900/85`}
                      style={replyOffset}
                    >
                      <div className={`flex gap-3 ${depth > 0 ? "rounded-xl border-l border-brand-300/20 pl-3" : ""}`}>
                        <Avatar src={comment.profilePic} fallback={comment.author} size="md" />
                        
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate text-sm font-semibold text-zinc-100">{comment.author}</p>
                                {comment.editedAt && (
                                  <span className="rounded-full border border-white/10 bg-zinc-900 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                                    edited
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-zinc-500">{timeAgo(comment.date)}</p>
                            </div>

                            {owner && (
                              <div className="relative shrink-0" onClick={(event) => event.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={(event) => toggleCommentMenu(event, comment.id)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/75 text-zinc-400 opacity-80 transition-all duration-200 hover:border-white/20 hover:text-zinc-200 group-hover:opacity-100"
                                  aria-label={`Open actions for comment by ${comment.author}`}
                                >
                                  <CommentActionIcon type="menu" className="h-4 w-4" />
                                </button>

                                {activeCommentMenuId === comment.id && (
                                  <div className="absolute right-0 top-10 z-20 w-36 overflow-hidden rounded-xl border border-white/10 bg-zinc-950/95 p-1.5 shadow-panel backdrop-blur-sm">
                                    <button
                                      type="button"
                                      onClick={(event) => handleStartEditComment(event, comment)}
                                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
                                    >
                                      <CommentActionIcon type="edit" className="h-3.5 w-3.5" />
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(event) => handleRequestDeleteComment(event, comment)}
                                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-red-200 transition-colors hover:bg-red-500/15 hover:text-red-100"
                                    >
                                      <CommentActionIcon type="trash" className="h-3.5 w-3.5" />
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {isEditing ? (
                            <div className="comment-edit-shell rounded-xl border border-white/10 bg-black/70 p-3">
                              <textarea
                                value={editingCommentText}
                                onChange={(event) => setEditingCommentText(event.target.value)}
                                className="min-h-[96px] w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm leading-6 text-zinc-100 placeholder:text-zinc-600 transition-[border-color,box-shadow] duration-200 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-300/20"
                                placeholder="Edit your comment"
                                autoFocus
                              />
                              <div className="mt-3 flex flex-wrap justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={handleCancelEditComment}>
                                  Cancel
                                </Button>
                                <Button
                                  type="button"
                                  variant="primary"
                                  onClick={() => handleSaveEditedComment(comment.id)}
                                  disabled={!editingCommentText.trim()}
                                >
                                  Save 
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-zinc-300">
                              {comment.text}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
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

      <Modal
        isOpen={Boolean(commentDeleteTarget)}
        onClose={() => setCommentDeleteTarget(null)}
        title="Delete comment"
      >
        {commentDeleteTarget && (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-zinc-400">
              Delete this comment permanently?
            </p>
            <p className="rounded-xl border border-white/10 bg-black/65 px-3 py-2 text-sm text-zinc-300">
              {commentDeleteTarget.text}
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setCommentDeleteTarget(null)}>
                Cancel
              </Button>
              <Button type="button" variant="danger" onClick={handleConfirmDeleteComment}>
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
