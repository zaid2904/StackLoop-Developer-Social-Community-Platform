import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Avatar from "../components/UI/Avatar";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import axios from "../services/api";

export default function OtherUserProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [profile, setProfile] = useState({});
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(128);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`/auth/v1/postuser/${id}`);
        const recent = await axios.post(`/auth/v1/recentpost/${id}`);
        setProfile(response.data || {});
        setPosts(recent.data.postdata || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, [id]);

  const handleFollowToggle = () => {
    setIsFollowing((prev) => {
      setFollowerCount((count) => (prev ? count - 1 : count + 1));
      return !prev;
    });
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-brand-300/20 bg-gradient-to-br from-zinc-950 to-brand-900/20 p-0">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-end gap-4">
              <Avatar src={profile.profilePic} fallback={profile.username || "U"} size="xl" />
              <div>
                <span className="app-chip">Creator profile</span>
                <h1 className="mt-2 font-display text-5xl text-zinc-100">{profile.username || "Creator"}</h1>
                <p className="text-sm text-zinc-500">@{profile.username || "username"}</p>
              </div>
            </div>

            <Button onClick={handleFollowToggle} variant={isFollowing ? "secondary" : "primary"}>
              {isFollowing ? "Following" : "Follow"}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card className="p-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              {[{ label: "Posts", value: profile.postsCount || 0 }, { label: "Followers", value: followerCount }, { label: "Following", value: 64 }].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/10 bg-black p-2">
                  <p className="text-lg font-bold text-zinc-100">{item.value}</p>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">{item.label}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <p className="app-chip">About</p>
            <p className="mt-3 text-sm text-zinc-400">{profile.bio || "This creator has not added a bio yet."}</p>
          </Card>
        </div>

        <Card className="p-5">
          <p className="app-chip">Recent posts</p>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {posts.length === 0 ? (
              <p className="col-span-full rounded-2xl border border-dashed border-white/10 bg-black/40 px-4 py-6 text-center text-sm text-zinc-500">
                No posts published yet.
              </p>
            ) : (
              posts.map((post, index) => {
                const hasImage =
                  typeof post.image === "string" &&
                  post.image.trim().length > 0;

                return (
                  <div key={post._id || index} className="overflow-hidden rounded-2xl border border-white/10 bg-black/80 transition-colors duration-200 hover:border-white/20">
                    {hasImage && (
                      <img src={post.image} alt="Post" className="h-40 w-full object-cover" loading="lazy" />
                    )}
                    <div className="space-y-2 p-4">
                      <h3 className="line-clamp-2 font-display text-2xl text-zinc-100">{post.title || `Post ${index + 1}`}</h3>
                      <p className="line-clamp-3 text-sm text-zinc-400">A peek into this creator's work and ideas.</p>
                      <button className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-200 transition-colors hover:text-brand-100" onClick={() => navigate(`/post/${post._id}`)}>
                        Read post
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
