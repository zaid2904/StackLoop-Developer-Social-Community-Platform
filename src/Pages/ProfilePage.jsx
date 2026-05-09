import { useEffect, useState } from "react";
import Avatar from "../components/UI/Avatar";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import InputField from "../components/UI/InputField";
import Modal from "../components/UI/Modal";
import { getCurrentUserProfile, updateProfile } from "../services/userService";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [recentposts, setRecentPosts] = useState([]);

  const [formData, setFormData] = useState({ username: "", bio: "", twitter: "", linkedin: "", github: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getCurrentUserProfile();
        setProfile(data.profile);
        setRecentPosts(data.posts);
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
      }
    };

    fetchProfile();
  }, []);

  if (!profile) return <div className="py-20 text-center text-zinc-500">Loading profile...</div>;

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

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-brand-300/20 bg-gradient-to-br from-zinc-950 to-brand-900/20 p-0">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-end gap-4">
              <Avatar src={profile.profilePic} fallback={profile.username} size="xl" />
              <div>
                <span className="app-chip">Profile</span>
                <h1 className="mt-2 font-display text-5xl text-zinc-100">{profile.username}</h1>
                <p className="text-sm text-zinc-500">@{profile.username.toLowerCase()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-center">
                <p className="text-xl font-bold text-zinc-100">{profile.postsCount || 0}</p>
                <p className="text-xs text-zinc-500">posts</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-center">
                <p className="text-xl font-bold text-zinc-100">{links.filter((link) => link.url).length}</p>
                <p className="text-xs text-zinc-500">links</p>
              </div>
              <Button variant="secondary" onClick={() => setOpenModal(true)}>Edit profile</Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card className="p-4">
            <p className="app-chip">About</p>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{profile.bio || "No bio added yet."}</p>
          </Card>

          <Card className="p-4">
            <p className="app-chip">Links</p>
            <div className="mt-3 space-y-2">
              {links.some((link) => link.url) ? (
                links.map((link) =>
                  link.url ? (
                    <a key={link.name} href={link.url} target="_blank" rel="noreferrer" className="block rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-zinc-300 hover:border-brand-300/35 hover:text-brand-200">
                      {link.name}
                    </a>
                  ) : null
                )
              ) : (
                <p className="text-sm text-zinc-500">No social links added.</p>
              )}
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <p className="app-chip">Recent posts</p>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">

            {recentposts.map((post) => (
              <div key={post._id} className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                <img
                  src={post.image || "https://thumbs.dreamstime.com/b/no-image-available-icon-flat-vector-no-image-available-icon-flat-vector-illustration-132482953.jpg"}
                  alt="Post"
                  className={`h-40 w-full object-cover }`}
                />
                <div className="p-4">
                  <h3 className="font-display text-2xl text-zinc-100">{post.title}</h3>
                  <p className="mt-1 text-sm text-zinc-400">{post.content}</p>
                </div>
              </div>
            ))}




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
    </div>
  );
}
