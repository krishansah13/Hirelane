"use client";

import { useActionState, useEffect, useState, startTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { updateAccount, type AccountState } from "@/lib/actions/account";

type ProfileProps = {
  name: string;
  email: string;
  mobile: string;
  image: string;
};

const initialState: AccountState = { ok: false };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-[#2e46ba] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

export default function Profile({ name, email, mobile, image }: ProfileProps) {
  const router = useRouter();
  const { update } = useSession();
  const [state, formAction] = useActionState(updateAccount, initialState);

  const [fullName, setFullName] = useState(name);
  const [phone, setPhone] = useState(mobile);
  const [preview, setPreview] = useState(image);
  const [file, setFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!state.ok) return;
    setSaved(true);
    void update({ name: state.name, image: state.image });
    router.refresh();
    // Session update() identity can change every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok, state.name, state.image]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError("");
    setSaved(false);

    let imageUrl = preview;

    if (file) {
      setUploading(true);
      try {
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("kind", "avatar");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        const uploadJson = (await uploadRes.json()) as {
          url?: string;
          error?: string;
        };

        if (uploadRes.status === 401) {
          window.location.href = "/login?callbackUrl=/account";
          return;
        }

        if (!uploadRes.ok || !uploadJson.url) {
          setClientError(uploadJson.error ?? "Photo upload failed");
          return;
        }

        imageUrl = uploadJson.url;
        setPreview(imageUrl);
      } catch {
        setClientError("Could not upload your photo. Try again.");
        return;
      } finally {
        setUploading(false);
      }
    }

    const actionData = new FormData();
    actionData.set("name", fullName);
    actionData.set("mobile", phone);
    if (imageUrl) actionData.set("image", imageUrl);

    startTransition(() => {
      formAction(actionData);
    });
  }

  const error = clientError || (state.ok ? "" : state.error);
  const initials = fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <span className="inline-flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eef0ff] text-lg font-semibold text-[#2e46ba] ring-1 ring-gray-100">
          {preview ? (
            <img
              src={preview}
              alt={fullName || "Profile photo"}
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </span>
        <div>
          <label
            htmlFor="avatar"
            className="block text-sm font-medium text-gray-700"
          >
            Profile photo
          </label>
          <input
            id="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            onChange={(event) => {
              const next = event.target.files?.[0] ?? null;
              setFile(next);
              setClientError("");
              setSaved(false);
              if (next) setPreview(URL.createObjectURL(next));
            }}
            className="mt-2 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#e9e9ff] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#4338a8]"
          />
          <p className="mt-1 text-xs text-gray-400">JPG, PNG, or WebP. Max 2MB.</p>
        </div>
      </div>

      <label className="block text-sm font-medium text-gray-700">
        Name
        <input
          name="name"
          value={fullName}
          onChange={(event) => {
            setFullName(event.target.value);
            setSaved(false);
          }}
          required
          minLength={2}
          className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
        />
      </label>

      <label className="block text-sm font-medium text-gray-700">
        Email
        <input
          value={email}
          disabled
          className="mt-1 w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-gray-500"
        />
      </label>

      <label className="block text-sm font-medium text-gray-700">
        Mobile number
        <input
          name="mobile"
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value);
            setSaved(false);
          }}
          placeholder="10-digit mobile number"
          className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
        />
        <span className="mt-1 block text-xs font-normal text-gray-400">
          Optional. Indian 10-digit number, used when employers review applications.
        </span>
      </label>

      {error ? (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {error}
        </p>
      ) : null}

      {saved ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          Account updated.
        </p>
      ) : null}

      <SubmitButton label={uploading ? "Uploading..." : "Save changes"} />
    </form>
  );
}
