"use client";

import Editor from "@/components/Editor";
import Form from "@/components/form";
import useStateData from "@/hooks/useStateData";
import { AudioLines, Scissors, ShieldCheck, Smartphone } from "lucide-react";
import { HashLoader } from "react-spinners";

export default function Home() {
  const { data, submitted } = useStateData();

  return (
    <div className="min-h-screen bg-[var(--tone-bg)] px-4 py-6 sm:px-6 sm:py-10">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="tone-hero overflow-hidden px-6 py-10 text-center sm:px-10 sm:py-14">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[var(--tone-border)] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--tone-ink-soft)]">
            <AudioLines className="h-3.5 w-3.5" />
            TikTok Ringtone Maker
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-black tracking-[-0.05em] text-[var(--tone-ink)] sm:text-6xl">
            Create a ringtone from any TikTok sound.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[var(--tone-ink-soft)] sm:text-lg">
            Paste a TikTok link, wait for the waveform to load, trim the moment
            you want, and export it for iPhone or Android.
          </p>

          <div className="mt-8">
            <Form />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-[var(--tone-ink-soft)]">
            <span className="tone-badge">Fast waveform trimming</span>
            <span className="tone-badge">iPhone and Android export</span>
            <span className="tone-badge">Production-ready audio proxy</span>
          </div>
        </section>

        {submitted ? (
          <div className="tone-panel flex min-h-[26rem] w-full flex-col items-center justify-center px-6 py-10 text-center">
            <HashLoader color="#ff6b4a" size={42} />
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.24em] text-[var(--tone-ink-soft)]">
              Loading audio
            </p>
            <p className="mt-3 max-w-sm text-lg leading-8 text-[var(--tone-ink)]">
              Fetching the sound and preparing the trim region.
            </p>
          </div>
        ) : data ? (
          <Editor />
        ) : (
          <div className="tone-panel flex min-h-[24rem] w-full flex-col items-center justify-center px-6 py-10 text-center">
            <AudioLines className="h-12 w-12 text-[var(--tone-accent)]" />
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-[var(--tone-ink-soft)]">
              Editor ready
            </p>
            <p className="mt-3 max-w-md text-lg leading-8 text-[var(--tone-ink)]">
              Your waveform editor will appear here as soon as you load a TikTok
              link above.
            </p>
          </div>
        )}

        <section className="grid gap-4 pt-2 sm:grid-cols-3">
          <div className="tone-info-card">
            <div className="tone-info-icon">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-[var(--tone-ink)]">
              Simple flow
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--tone-ink-soft)]">
              Paste the link first. Everything else stays out of the way until
              the audio is ready.
            </p>
          </div>

          <div className="tone-info-card">
            <div className="tone-info-icon">
              <Scissors className="h-4 w-4" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-[var(--tone-ink)]">
              Trim precisely
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--tone-ink-soft)]">
              Wait for the selector to load, then drag the region until the cut
              feels exactly right.
            </p>
          </div>

          <div className="tone-info-card">
            <div className="tone-info-icon">
              <Smartphone className="h-4 w-4" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-[var(--tone-ink)]">
              Export cleanly
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--tone-ink-soft)]">
              Choose `.m4r` for iPhone or `.mp3` for Android and save your tone.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
