import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Avatar from "../components/UI/Avatar";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import InputField from "../components/UI/InputField";
import Modal from "../components/UI/Modal";
import Toast from "../components/UI/Toast";
import { logout } from "../features/auth/authSlice";
import { getCurrentUserProfile, updateProfile } from "../services/userService";

function createPostClientId(post, index) {
  return post?._id || post?.id || `${post?.title || "post"}-${post?.createdAt || "draft"}-${index}`;
}

function withClientIds(posts = []) {
  return posts.map((post, index) => ({
    ...post,
    __clientId: post.__clientId || createPostClientId(post, index),
  }));
}

function splitTagTokens(value) {
  if (typeof value !== "string") return [];

  const trimmed = value.trim();
  if (!trimmed) return [];

  if (trimmed.includes(",")) {
    return trimmed
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean);
  }

  if (trimmed.length > 26 && trimmed.includes(" ")) {
    return trimmed
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean);
  }

  return [trimmed];
}

function getPostTags(post) {
  const tags = [
    ...(Array.isArray(post?.tags) ? post.tags : []),
    ...splitTagTokens(post?.tag),
    ...splitTagTokens(post?.tag1),
    ...splitTagTokens(post?.category),
  ];

  return tags.filter((tag, index) => tag && tags.findIndex((item) => item.toLowerCase() === tag.toLowerCase()) === index);
}

function formatPostDate(createdAt) {
  if (!createdAt) return "Draft";

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Draft";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function PostActionIcon({ type, className = "h-4 w-4" }) {
  if (type === "plus") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    );
  }

  if (type === "menu") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="5" r="1.7" />
        <circle cx="12" cy="12" r="1.7" />
        <circle cx="12" cy="19" r="1.7" />
      </svg>
    );
  }

  if (type === "eye") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
        <circle cx="12" cy="12" r="2.8" />
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

  if (type === "post") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
        <path d="M8 9h8" />
        <path d="M8 13h8" />
        <path d="M8 17h5" />
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

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [recentposts, setRecentPosts] = useState([]);
  const [toast, setToast] = useState(null);
  const [activePostMenuId, setActivePostMenuId] = useState(null);
  const [previewPost, setPreviewPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [deletePostTarget, setDeletePostTarget] = useState(null);
  const [postEditForm, setPostEditForm] = useState({
    title: "",
    content: "",
    tag: "",
    tag1: "",
    image: "",
  });

  const [formData, setFormData] = useState({ username: "", bio: "", twitter: "", linkedin: "", github: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getCurrentUserProfile();
        setProfile(data.profile);
        setRecentPosts(withClientIds(Array.isArray(data.posts) ? data.posts : []));
        setFormData({
          username: data.profile.username || "",
          bio: data.profile.bio || "",
          twitter: data.profile.socialLinks?.twitter || "",
          linkedin: data.profile.socialLinks?.linkedin || "",
          github: data.profile.socialLinks?.github || "",
        });
      } catch {
        setProfile({
          username: "Demo_User",
          bio: "Frontend developer and UI enthusiast.",
          postsCount: 15,
          socialLinks: {},
        });
        setRecentPosts([]);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const closeMenu = () => setActivePostMenuId(null);
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setActivePostMenuId(null);
      }
    };

    window.addEventListener("click", closeMenu);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  if (!profile) return <div className="py-20 text-center text-zinc-500">Loading profile...</div>;

  const profileHandle = (profile.username || "user").toLowerCase();
  const links = [
    { name: "Twitter", url: profile.socialLinks?.twitter },
    { name: "LinkedIn", url: profile.socialLinks?.linkedin },
    { name: "GitHub", url: profile.socialLinks?.github },
  ];

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFileChange = (e) => setPhotoFile(e.target.files[0] || null);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("username", formData.username);
      fd.append("bio", formData.bio);
      fd.append("socialLinks[twitter]", formData.twitter);
      fd.append("socialLinks[linkedin]", formData.linkedin);
      fd.append("socialLinks[github]", formData.github);
      if (photoFile) fd.append("profilepic", photoFile);

      const data = await updateProfile(fd);
      setProfile(data.profile);
      setPhotoFile(null);
      setOpenModal(false);
    } catch (err) {
      console.error("Profile update failed", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const togglePostMenu = (event, postClientId) => {
    event.stopPropagation();
    setActivePostMenuId((currentId) => (currentId === postClientId ? null : postClientId));
  };

  const openPostPreview = (post) => {
    setActivePostMenuId(null);
    setPreviewPost(post);
  };

  const openEditPostModal = (post) => {
    setActivePostMenuId(null);
    setPreviewPost(null);
    setPostEditForm({
      title: typeof post.title === "string" ? post.title : "",
      content: typeof post.content === "string" ? post.content : "",
      tag: typeof post.tag === "string" ? post.tag : "",
      tag1: typeof post.tag1 === "string" ? post.tag1 : "",
      image: typeof post.image === "string" ? post.image : "",
    });
    setEditingPost(post);
  };

  const requestDeletePost = (post) => {
    setActivePostMenuId(null);
    setDeletePostTarget(post);
  };

  const handleEditPostFieldChange = (event) => {
    const { name, value } = event.target;
    setPostEditForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSavePostEdit = (event) => {
    event.preventDefault();

    if (!postEditForm.title.trim()) {
      setToast({ type: "error", message: "Post title cannot be empty." });
      return;
    }

    setRecentPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.__clientId === editingPost.__clientId
          ? {
              ...post,
              title: postEditForm.title.trim(),
              content: postEditForm.content.trim(),
              tag: postEditForm.tag.trim(),
              tag1: postEditForm.tag1.trim(),
              image: postEditForm.image.trim(),
            }
          : post
      )
    );

    setPreviewPost((currentPreview) =>
      currentPreview?.__clientId === editingPost.__clientId
        ? {
            ...currentPreview,
            title: postEditForm.title.trim(),
            content: postEditForm.content.trim(),
            tag: postEditForm.tag.trim(),
            tag1: postEditForm.tag1.trim(),
            image: postEditForm.image.trim(),
          }
        : currentPreview
    );

    setEditingPost(null);
    setToast({ type: "success", message: "Post updated in your profile view." });
  };

  const handleDeletePost = () => {
    if (!deletePostTarget) return;

    setRecentPosts((currentPosts) =>
      currentPosts.filter((post) => post.__clientId !== deletePostTarget.__clientId)
    );

    setPreviewPost((currentPreview) =>
      currentPreview?.__clientId === deletePostTarget.__clientId ? null : currentPreview
    );

    setToast({ type: "info", message: "Post removed from recent posts." });
    setDeletePostTarget(null);
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Card className="overflow-hidden border-brand-300/20 bg-gradient-to-br from-zinc-950 to-brand-900/20 p-0">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="shrink-0">
                <Avatar src={profile.profilePic} fallback={profile.username} size="xl" />
              </div>
              <div className="space-y-4">
                <div>
                  <span className="app-chip">Profile</span>
                  <h1 className="mt-2 font-display text-5xl text-zinc-100">{profile.username}</h1>
                  <p className="text-sm text-zinc-500">@{profileHandle}</p>
                </div>
                <div className="max-w-lg">
                  <p className="text-sm leading-6 text-zinc-400">{profile.bio || "No bio added yet."}</p>
                </div>
                {links.some((link) => link.url) && (
                  <div className="flex flex-wrap gap-2">
                    {links.map((link) =>
                      link.url ? (
                        <a key={link.name} href={link.url} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 bg-black px-3 py-1.5 text-xs text-zinc-300 hover:border-brand-300/35 hover:text-brand-200 transition-colors">
                          {link.name}
                        </a>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:items-end">
              <div className="flex items-center gap-2">
                <div className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-center min-w-[80px]">
                  <p className="text-xl font-bold text-zinc-100">{profile.postsCount || 0}</p>
                  <p className="text-xs text-zinc-500">posts</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-center min-w-[80px]">
                  <p className="text-xl font-bold text-zinc-100">{links.filter((link) => link.url).length}</p>
                  <p className="text-xs text-zinc-500">links</p>
                </div>
              </div>
              <div className="flex flex-col items-stretch gap-2 w-full sm:w-auto min-w-[168px]">
                <Button className="w-full justify-center" variant="secondary" onClick={() => setOpenModal(true)}>Edit profile</Button>
                <button type="button" onClick={handleLogout} className="text-xs font-medium text-zinc-500 hover:text-red-400 transition-colors text-center py-1">Log out</button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6">

        <Card className="p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <p className="app-chip">Recent posts</p>
              <span className="rounded-full border border-white/10 bg-black/70 px-3 py-1 text-xs font-medium text-zinc-400">
                {recentposts.length} total
              </span>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full justify-center sm:w-auto"
              onClick={() => navigate("/create-post")}
            >
              <PostActionIcon type="plus" className="h-4 w-4" />
              Create post
            </Button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
            {recentposts.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-black/55 px-5 py-10 text-center">
                <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/80 text-zinc-400">
                  <PostActionIcon type="post" className="h-5 w-5" />
                </span>
                <p className="mt-4 text-base font-semibold text-zinc-200">No recent posts yet</p>
                <p className="mt-1 text-sm text-zinc-500">Create your first post and it will appear here.</p>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-5"
                  onClick={() => navigate("/create-post")}
                >
                  <PostActionIcon type="plus" className="h-4 w-4" />
                  New post
                </Button>
              </div>
            ) : (
              recentposts.map((post) => {
                const postClientId = post.__clientId || createPostClientId(post, 0);
                const hasImage =
                  typeof post.image === "string" &&
                  post.image.trim().length > 0;
                const postTitle =
                  typeof post.title === "string" && post.title.trim().length > 0
                    ? post.title.trim()
                    : "Untitled post";
                const postContent =
                  typeof post.content === "string" && post.content.trim().length > 0
                    ? post.content.trim()
                    : "No summary provided yet.";
                const tags = getPostTags(post);

                return (
                  <article
                    key={postClientId}
                    className="profile-post-card group relative h-full min-h-[245px] cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-black/85"
                    onClick={() => openPostPreview(post)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openPostPreview(post);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Preview ${postTitle}`}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.18),transparent_45%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100" />

                    {hasImage && (
                      <div className="overflow-hidden border-b border-white/10">
                        <img
                          src={post.image}
                          alt={postTitle}
                          className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div className="relative flex h-full flex-col p-4 sm:p-5">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                          {formatPostDate(post.createdAt)}
                        </p>

                        <div className="relative z-20" onClick={(event) => event.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(event) => togglePostMenu(event, postClientId)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/70 text-zinc-400 transition-all duration-200 hover:border-white/20 hover:text-zinc-200"
                            aria-label={`Open actions for ${postTitle}`}
                          >
                            <PostActionIcon type="menu" className="h-4 w-4" />
                          </button>

                          {activePostMenuId === postClientId && (
                            <div className="absolute right-0 top-10 w-40 overflow-hidden rounded-xl border border-white/10 bg-zinc-950/95 p-1.5 shadow-panel backdrop-blur-sm">
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openEditPostModal(post);
                                }}
                              >
                                <PostActionIcon type="edit" className="h-3.5 w-3.5" />
                                Edit post
                              </button>
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-red-200 transition-colors hover:bg-red-500/15 hover:text-red-100"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  requestDeletePost(post);
                                }}
                              >
                                <PostActionIcon type="trash" className="h-3.5 w-3.5" />
                                Delete post
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="profile-post-title font-display text-[1.6rem] leading-tight text-zinc-100" title={postTitle}>
                        {postTitle}
                      </h3>
                      <p className="profile-post-content mt-2 text-sm leading-6 text-zinc-400">{postContent}</p>

                      {tags.length > 0 && (
                        <div className="profile-tech-wrap mt-3">
                          {tags.map((tag) => (
                            <span key={`${postClientId}-${tag}`} className="profile-tech-chip" title={tag}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3 text-xs text-zinc-500">
                        <span>{post.likes?.length || 0} likes</span>
                        <span>{post.comments?.length || 0} comments</span>
                        <span className="ml-auto">{post.views?.length || 0} views</span>
                      </div>
                    </div>

                    <div className="pointer-events-none absolute bottom-3 right-3 z-10 flex translate-y-2 items-center gap-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                      <button
                        type="button"
                        className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/75 text-zinc-300 transition-all duration-200 hover:border-white/20 hover:text-zinc-100"
                        onClick={(event) => {
                          event.stopPropagation();
                          openPostPreview(post);
                        }}
                        aria-label={`View ${postTitle}`}
                      >
                        <PostActionIcon type="eye" className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/75 text-zinc-300 transition-all duration-200 hover:border-white/20 hover:text-zinc-100"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEditPostModal(post);
                        }}
                        aria-label={`Edit ${postTitle}`}
                      >
                        <PostActionIcon type="edit" className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </Card>
      </div>

      <Modal isOpen={openModal} onClose={() => setOpenModal(false)} title="Edit Profile">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Profile Photo</label>
            <div className="flex items-center gap-4">
              <Avatar src={profile.profilePic} fallback={profile.username} size="lg" />
              <input type="file" accept="image/*" name="profilepic" onChange={handleFileChange} className="text-sm text-zinc-400" />
            </div>
          </div>

          <InputField label="Username" type="text" name="username" value={formData.username} onChange={handleChange} />
          <InputField label="Bio" type="textarea" name="bio" value={formData.bio} onChange={handleChange} rows="3" />
          <InputField type="url" name="twitter" value={formData.twitter} onChange={handleChange} placeholder="Twitter URL" />
          <InputField type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="LinkedIn URL" />
          <InputField type="url" name="github" value={formData.github} onChange={handleChange} placeholder="GitHub URL" />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(previewPost)}
        onClose={() => setPreviewPost(null)}
        title="Post preview"
      >
        {previewPost && (
          <div className="space-y-4">
            {typeof previewPost.image === "string" && previewPost.image.trim() && (
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <img
                  src={previewPost.image}
                  alt={previewPost.title || "Post image"}
                  className="max-h-[320px] w-full object-cover"
                  loading="lazy"
                />
              </div>
            )}

            <div>
              <h3 className="break-words font-display text-3xl text-zinc-100">
                {previewPost.title || "Untitled post"}
              </h3>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-zinc-500">
                {formatPostDate(previewPost.createdAt)}
              </p>
            </div>

            {getPostTags(previewPost).length > 0 && (
              <div className="profile-tech-wrap">
                {getPostTags(previewPost).map((tag) => (
                  <span key={`preview-${previewPost.__clientId}-${tag}`} className="profile-tech-chip">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="max-h-[280px] overflow-y-auto rounded-2xl border border-white/10 bg-black/75 p-4">
              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-zinc-300">
                {previewPost.content || "No detailed content provided for this post yet."}
              </p>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => setPreviewPost(null)}>
                Close
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => openEditPostModal(previewPost)}
              >
                Edit post
              </Button>
              {previewPost._id && (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => navigate(`/post/${previewPost._id}`)}
                >
                  View full post
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(editingPost)}
        onClose={() => setEditingPost(null)}
        title="Edit post"
      >
        <form onSubmit={handleSavePostEdit} className="space-y-4">
          <InputField
            label="Title"
            id="edit-post-title"
            name="title"
            value={postEditForm.title}
            onChange={handleEditPostFieldChange}
            placeholder="Update post title"
            required
          />
          <InputField
            label="Content"
            id="edit-post-content"
            type="textarea"
            name="content"
            value={postEditForm.content}
            onChange={handleEditPostFieldChange}
            rows="6"
            placeholder="Refine your summary or post intro"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <InputField
              label="Tags"
              id="edit-post-tags"
              name="tag"
              value={postEditForm.tag}
              onChange={handleEditPostFieldChange}
              placeholder="react, node, ui"
            />
            <InputField
              label="Tech stack"
              id="edit-post-tech-stack"
              name="tag1"
              value={postEditForm.tag1}
              onChange={handleEditPostFieldChange}
              placeholder="javascript typescript mongodb"
            />
          </div>
          <InputField
            label="Image URL"
            id="edit-post-image"
            type="url"
            name="image"
            value={postEditForm.image}
            onChange={handleEditPostFieldChange}
            placeholder="https://example.com/post-cover.jpg"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setEditingPost(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save changes
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(deletePostTarget)}
        onClose={() => setDeletePostTarget(null)}
        title="Delete post"
      >
        {deletePostTarget && (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-zinc-400">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-zinc-200">
                {deletePostTarget.title || "this post"}
              </span>
              ? This action removes it from your recent posts view.
            </p>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setDeletePostTarget(null)}>
                Cancel
              </Button>
              <Button type="button" variant="danger" onClick={handleDeletePost}>
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
