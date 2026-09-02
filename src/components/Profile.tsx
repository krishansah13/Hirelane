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
      className="rounded-xl bg-[#1739ad] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#12329c] disabled:opacity-70"
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
  const [dirty, setDirty] = useState(false);
  const [handledSaveKey, setHandledSaveKey] = useState<string | null>(null);

  const saveKey = state.ok ? `${state.name ?? ""}:${state.image ?? ""}` : null;
  if (saveKey && handledSaveKey !== saveKey) {
    setHandledSaveKey(saveKey);
    setDirty(false);
    setFile(null);
  }

  useEffect(() => {
    if (!state.ok) return;
    void update({ name: state.name, image: state.image });
    router.refresh();
    // Session update() identity can change every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok, state.name, state.image]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError("");
    setDirty(true);

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
          router.push("/login?callbackUrl=/account");
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
  const saved = Boolean(state.ok && !dirty);
  const initials = fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";

  const fieldClass =
    "mt-1.5 h-11 w-full rounded-xl bg-[#fbf9ff] px-3 text-sm text-gray-950 outline-none ring-1 ring-[#dcd8ea] focus:ring-2 focus:ring-[#2E46BA] disabled:bg-gray-50 disabled:text-gray-500";

  return (
    <section className="rounded-2xl bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold text-gray-950">Profile</h2>
        <p className="mt-1 text-sm text-gray-500">
          Name, photo, and how employers can reach you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
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
              className="block text-xs font-medium text-gray-500"
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
                setDirty(true);
                if (next) setPreview(URL.createObjectURL(next));
              }}
              className="mt-2 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#e9e9ff] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#4338a8]"
            />
            <p className="mt-1 text-xs text-gray-400">JPG, PNG, or WebP. Max 2MB.</p>
          </div>
        </div>

        <label className="block text-xs font-medium text-gray-500">
          Name
          <input
            name="name"
            value={fullName}
            placeholder="Enter your full name"
            onChange={(event) => {
              setFullName(event.target.value);
              setDirty(true);
            }}
            required
            minLength={2}
            maxLength={80}
            autoCapitalize="words"
            className={fieldClass}
          />
          <span className="mt-1.5 block text-xs font-normal text-gray-400">
            Letters and spaces only
          </span>
        </label>

        <label className="block text-xs font-medium text-gray-500">
          Email
          <input
            value={email}
            disabled
            className={fieldClass}
          />
        </label>

        <label className="block text-xs font-medium text-gray-500">
          Mobile number
          <input
            name="mobile"
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value);
              setDirty(true);
            }}
            placeholder="10-digit mobile number"
            className={fieldClass}
          />
          <span className="mt-1.5 block text-xs font-normal text-gray-400">
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
    </section>
  );
}
