"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect } from "react";

export default function LoginButton() {
  const { data: session } = useSession();

  // Send token to Flask backend after login
  useEffect(() => {
    async function sendToken() {
      if (session?.idToken) {
        try {
          const res = await fetch("http://localhost:5000/api/signup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: session.idToken }),
          });

          const result = await res.json();
          console.log("Flask response:", result);
        } catch (err) {
          console.error("Error sending token to Flask:", err);
        }
      }
    }

    sendToken();
  }, [session]);

  if (!session) {
    return (
      <div className="flex flex-col items-center mt-20">
        <button
          onClick={() => signIn("google")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mt-20">
      <p className="text-xl">Welcome, {session.user?.name}</p>
      <p className="text-sm text-gray-600">{session.user?.email}</p>
      <button
        onClick={() => signOut()}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md"
      >
        Sign Out
      </button>
    </div>
  );
}
