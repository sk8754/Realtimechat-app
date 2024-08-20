"use client";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Profile = {
  id: string;
  name: string;
};
export default function Home() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    router.push("/login");

    if (error) {
      console.error(error);
    }
  };

  const getUser = async () => {
    try {
      const { data } = await supabase.auth.getUser();

      if (!data || null) {
        router.push("/login");
      }
      setUser(data.user);
    } catch (err) {
      console.error(err);
    }
  };

  const getProfile = async () => {
    try {
      const { data } = await supabase.from("profiles").select("*");
      setProfile(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      await getUser();
      await getProfile();
    };
    fetchProfile();
  }, []);

  const filterProfile = profile.filter((filter) => filter.id !== user?.id);

  const myProfile = profile.find((element) => element.id === user?.id);
  return (
    <div>
      <div className="max-w-[1000px] mx-auto text-center">
        <div>
          <h2>
            あなたのユーザー名は{myProfile ? myProfile.name : "未定義"}です
          </h2>
        </div>
        <h2>チャット相手を選んでください</h2>

        <ul>
          {filterProfile.map((profile) => (
            <li key={profile.id}>
              <Link href={`/chat/${profile.id}`}>{profile.name}</Link>
            </li>
          ))}
        </ul>
        <button onClick={signOut} className="mt-[2rem] bg-[red] text-[white]">
          ログアウト
        </button>
      </div>
    </div>
  );
}
