import { login } from "./actions";

export default function LoginPage() {
  return (
    <form className="max-w-[500px] flex flex-col mx-auto">
      <label htmlFor="email">メールアドレス:</label>
      <input
        className="border-2"
        id="email"
        name="email"
        type="email"
        required
      />
      <label htmlFor="password">パスワード:</label>
      <input
        className="border-2"
        id="password"
        name="password"
        type="password"
        required
      />
      <div className="text-center">
        <button
          className="bg-[#24a7ff] p-[0.5rem] rounded-[1rem] mt-[1rem]"
          formAction={login}
        >
          ログイン
        </button>
      </div>
    </form>
  );
}
