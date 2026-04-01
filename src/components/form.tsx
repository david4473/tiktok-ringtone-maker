"use client";

import useStateData from "@/hooks/useStateData";
import { formAction } from "@/utils/form-action";
import { AlertCircle, ArrowRight, Link2 } from "lucide-react";
import { useState } from "react";

export default function Form() {
  const [url, setUrl] = useState<string>("");
  const { handleSetData, handleSubmitted, handleMessage, message, submitted } =
    useStateData();

  function isValidTikTokUrl(value: string) {
    try {
      const parsed = new URL(value);
      return parsed.hostname.includes("tiktok.com");
    } catch {
      return false;
    }
  }

  async function handleForm(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();

    handleSubmitted(true);
    handleMessage(null);

    try {
      if (!isValidTikTokUrl(url)) {
        handleSetData(null);
        handleMessage("Paste a valid TikTok post URL to load its sound.");
        return;
      }

      const data = await formAction(url);
      handleSetData(data);
      handleMessage(null);
    } catch (error) {
      handleSetData(null);
      handleMessage(
        error instanceof Error
          ? error.message
          : "Failed to fetch TikTok audio. Please try again.",
      );
    } finally {
      handleSubmitted(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <form onSubmit={handleForm} className="w-full">
        <div className="tone-form-shell flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[1.4rem] border border-[var(--tone-border)] bg-white px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(255,107,74,0.22)] bg-[var(--tone-accent-soft)] text-[var(--tone-accent)]">
              <Link2 className="h-4 w-4" />
            </div>
            <input
              name="url"
              type="text"
              placeholder="Paste TikTok video URL here"
              aria-label="TikTok post URL"
              value={url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUrl(e.target.value)
              }
              className="min-w-0 flex-1 border-0 bg-transparent text-base text-[var(--tone-ink)] outline-none placeholder:text-[var(--tone-muted)]"
            />
          </div>

          <button
            type="submit"
            disabled={submitted}
            className="inline-flex h-[4.25rem] items-center justify-center gap-2 rounded-[1.4rem] border border-[rgba(255,255,255,0.35)] bg-[var(--tone-accent)] px-6 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-[0_18px_36px_-22px_rgba(255,107,74,0.48)] transition hover:bg-[var(--tone-accent-deep)] disabled:cursor-not-allowed disabled:border-transparent disabled:bg-[var(--tone-muted)] sm:min-w-[13rem]"
          >
            {submitted ? "Loading" : "Create Tone"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>

      {message ? (
        <div className="mt-4 flex items-start gap-3 rounded-[1.5rem] border border-[var(--tone-error-border)] bg-[var(--tone-error-bg)] px-4 py-4 text-left text-sm text-[var(--tone-error-text)]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{message}</p>
        </div>
      ) : null}
    </div>
  );
}
