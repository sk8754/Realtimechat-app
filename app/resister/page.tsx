import React from "react";
import { signup } from "./actions";

const Page = () => {
  return (
    <div>
      <form>
        <input className="border-2" />
        <input className="border-2" />
        <input className="border-2" />
        <button formAction={signup}>Sign up</button>
      </form>
    </div>
  );
};

export default Page;
