import React from "react";
import { signup } from "./actions";

const page = () => {
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

export default page;
