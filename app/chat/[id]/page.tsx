"use client";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const Page = ({ params }: { params: { id: string } }) => {
  const supabase = createClient();
  const [inputText, setInputText] = useState("");
  const [sendUser, setSendUser] = useState<User | null>(null);
  const [sendUserMessage, setSendUserMessage] = useState<any[]>([]);
  const [toUserMessage, setToUserMessage] = useState<any[]>([]);
  const [profile, setProfile] = useState<any[]>([]);

  const toUserId = params.id;

  const toUserProfile = profile.find((element) => element.id === toUserId);

  const messageEndRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const getProfile = async () => {
    try {
      const { data } = await supabase.from("profiles").select("*");
      if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

  const getSendUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    setSendUser(data.user);

    if (!data || error) {
      console.error(error);
      router.push("/error");
    }
  };

  const getSendUserMessage = async () => {
    try {
      const { data } = await supabase
        .from("chats")
        .select("*")
        .eq("toid", toUserId);

      if (data) {
        setSendUserMessage(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getToUserMessage = async () => {
    try {
      const { data } = await supabase
        .from("chats")
        .select("*")
        .eq("uid", toUserId);

      if (data) {
        setToUserMessage(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await getProfile();
      await getSendUser();
      await getSendUserMessage();
      await getToUserMessage();
    };
    fetchData();

    // リアルタイム更新の処理
    const channel = supabase
      .channel("public:chats")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chats",
        },
        (payload) => {
          const newMessage = payload.new;

          if (newMessage.uid === toUserId) {
            setToUserMessage((prevMessage) => [...prevMessage, newMessage]);
          }

          if (newMessage.uid === sendUser?.id) {
            setSendUserMessage((prevMessage) => [...prevMessage, newMessage]);
          }
        }
      )
      .subscribe();

    // クリーンアップ関数
    return () => {
      channel.unsubscribe();
    };
  }, [toUserId, sendUser?.id]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [sendUserMessage, toUserMessage]);

  const onSubmitNewMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText) {
      return;
    }

    const { error } = await supabase.from("chats").insert({
      message: inputText,
      uid: sendUser?.id,
      toid: toUserId,
    });

    if (error) {
      console.error(error);
    }

    setInputText("");
  };

  const allMessages = [...sendUserMessage, ...toUserMessage].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="bg-[#a59ad3] min-h-[100vh]  ">
      <header className="fixed top-0">
        <div className="flex justify-between">
          <div className="flex gap-4 pl-[1rem] sm:pl-0">
            <button>
              <Link className="font-bold" href={"/"}>
                ＜
              </Link>
            </button>
            <h1 className="font-bold text-2xl">
              {toUserProfile ? toUserProfile.name : ""}
            </h1>
          </div>

          <div></div>
        </div>
      </header>

      {/* トークルーム画面 */}
      <div className="pt-[3rem] px-[5%] sm:px-0">
        {/* チャットコンテナ */}
        <div>
          {allMessages.map((message) =>
            message.uid == sendUser?.id ? (
              <div
                className="flex justify-end text-right mb-[0.5rem]"
                key={message.id}
              >
                <div className="relative mr-[0.1rem]">
                  <div className="text-[0.6rem]">
                    {message.isAlreadyRead ? "既読" : ""}
                  </div>
                  <div
                    className={`absolute bottom-0 w-[70px] translate-x-[-70px] text-[0.25rem] sm:text-[0.5rem] ${
                      message.isAlreadyRead == true && "translate-x-[-50px]"
                    }`}
                  >
                    {formatDateTime(message.created_at)}
                  </div>
                </div>
                <div className="rounded-[0.5rem] bg-[#22e622] sm:text-[1.5rem]">
                  {message.message}
                </div>
              </div>
            ) : (
              message.uid == toUserId && (
                <div
                  className="flex justify-start text-left max-w-[80%] mb-[0.5rem]"
                  key={message.id}
                >
                  <div>画像</div>
                  <div className="flex relative">
                    <div>
                      <p>{toUserProfile ? toUserProfile.name : ""}</p>
                      <div className="bg-white rounded-[0.5rem] sm:text-[1.5rem]">
                        {message.message}
                      </div>
                    </div>

                    <p className="text-[0.25rem] sm:text-[0.5rem] absolute bottom-0 right-[-35px] sm:right-[-70px]">
                      {formatDateTime(message.created_at)}
                    </p>
                  </div>
                </div>
              )
            )
          )}
        </div>

        {/* メッセージのスクロール */}
        {/* <div ref={messageEndRef} /> */}
      </div>

      {/* テキスト入力フォーム */}
      <form
        onSubmit={onSubmitNewMessage}
        className="fixed bottom-0 bg-white w-[100vw] h-[8vh] sm:h-[10vh]"
      >
        <div className="flex justify-center items-center gap-6 h-[100%]">
          <input
            className="w-[50%] h-[80%] pl-[1rem]  bg-[#efeeee] rounded-[2rem]"
            type="text"
            name="message"
            onChange={(e) => setInputText(e.target.value)}
            value={inputText}
          />

          <button className="bg-[#41cf41] px-[2rem] h-[90%] rounded-[1rem]">
            送信
          </button>
        </div>
      </form>
    </div>
  );
};

export default Page;
