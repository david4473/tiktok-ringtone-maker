"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import {
  AlertCircle,
  Download,
  LoaderCircle,
  Pause,
  Play,
  Scissors,
  Waves,
} from "lucide-react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin, {
  Region,
} from "wavesurfer.js/dist/plugins/regions.esm.js";
import useStateData from "@/hooks/useStateData";
import { encodeWAV } from "@/utils/encodeWave";

const Editor: React.FC = () => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<RegionsPlugin | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const editorMessageKindRef = useRef<"default" | "ffmpeg-loading">("default");
  const audioObjectUrlRef = useRef<string | null>(null);
  const audioLoadAbortRef = useRef<AbortController | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [ffmpegLoaded, setFFmpegLoaded] = useState<boolean>(false);
  const [ffmpegProgress, setFFmpegProgress] = useState<number>(0);
  const [waveformLoading, setWaveformLoading] = useState<boolean>(false);
  const [exportingFormat, setExportingFormat] = useState<
    "ios" | "android" | null
  >(null);
  const [editorMessage, setEditorMessage] = useState<string | null>(null);
  const [editorMessageKind, setEditorMessageKind] = useState<
    "default" | "ffmpeg-loading"
  >("default");
  const [highlightMessage, setHighlightMessage] = useState<boolean>(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [duration, setDuration] = useState<number>(0);

  const { data } = useStateData();
  const fileLoaded = Boolean(data);
  const fileName = data?.data.result.author.username ?? "";
  const trackTitle = data?.data.result.music.title ?? "TikTok Audio";
  const proxiedAudioUrl = data
    ? `/api/audio?src=${encodeURIComponent(data.data.result.music.playUrl[0])}`
    : null;

  const focusMessage = useCallback(() => {
    setHighlightMessage(true);

    requestAnimationFrame(() => {
      messageRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      messageRef.current?.focus();
    });

    window.setTimeout(() => {
      setHighlightMessage(false);
    }, 1800);
  }, []);

  useEffect(() => {
    editorMessageKindRef.current = editorMessageKind;
  }, [editorMessageKind]);

  useEffect(() => {
    const loadFFmpeg = async () => {
      if (!ffmpegRef.current) {
        try {
          const ffmpeg = new FFmpeg();
          ffmpegRef.current = ffmpeg;
          setFFmpegProgress(0.08);

          ffmpeg.on("log", ({ message }) => {
            console.log("[FFmpeg]", message);
          });

          ffmpeg.on("progress", ({ progress }) => {
            setFFmpegProgress((current) => Math.max(current, progress));
          });

          await ffmpeg.load();
          setFFmpegProgress(1);
          setFFmpegLoaded(true);
          setEditorMessage(null);
          setEditorMessageKind("default");
        } catch (error) {
          console.error("Failed to load FFmpeg", error);
          setEditorMessageKind("default");
          setEditorMessage(
            "Audio conversion tools could not load. Refresh and try again.",
          );
        }
      }
    };

    loadFFmpeg();
  }, []);

  useEffect(() => {
    if (ffmpegLoaded) {
      return;
    }

    const timer = window.setInterval(() => {
      setFFmpegProgress((current) => {
        if (current >= 0.92) {
          return current;
        }

        return Math.min(0.92, current + 0.04);
      });
    }, 500);

    return () => {
      window.clearInterval(timer);
    };
  }, [ffmpegLoaded]);

  useEffect(() => {
    if (waveformRef.current && !wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#b8d6d8",
        progressColor: "#ff6b4a",
        cursorColor: "#0f3f45",
        barWidth: 3,
        barRadius: 6,
        height: 136,
        normalize: true,
      });

      const wsRegions = wavesurferRef.current.registerPlugin(
        RegionsPlugin.create(),
      );
      regionsRef.current = wsRegions;

      wavesurferRef.current.on("decode", (decodedDuration: number) => {
        setDuration(decodedDuration);
        setWaveformLoading(false);
        setEditorMessage((current) =>
          editorMessageKindRef.current === "ffmpeg-loading" ? current : null,
        );
        wsRegions.getRegions().forEach((region) => region.remove());
        wsRegions.addRegion({
          start: 0,
          end: Math.min(30, decodedDuration),
          color: "rgba(255, 107, 74, 0.18)",
          drag: true,
          resize: true,
        });
      });

      wavesurferRef.current.on("play", () => setIsPlaying(true));
      wavesurferRef.current.on("pause", () => setIsPlaying(false));
      wavesurferRef.current.on("error", (error) => {
        console.error("Waveform load error", error);
        setWaveformLoading(false);
        setEditorMessageKind("default");
        setEditorMessage(
          "We couldn't prepare the waveform for that sound. Please try another link.",
        );
      });

      wsRegions.on("region-updated", (region: Region) => {
        if (region.end - region.start > 30) {
          region.setOptions({ end: region.start + 30 });
        }
        region.play();
      });

      wsRegions.on("region-out", (region) => {
        region.play();
      });
    }

    return () => {
      audioLoadAbortRef.current?.abort();

      if (audioObjectUrlRef.current) {
        URL.revokeObjectURL(audioObjectUrlRef.current);
        audioObjectUrlRef.current = null;
      }

      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const loadWaveform = async () => {
      if (!wavesurferRef.current) {
        return;
      }

      audioLoadAbortRef.current?.abort();
      audioLoadAbortRef.current = null;

      if (audioObjectUrlRef.current) {
        URL.revokeObjectURL(audioObjectUrlRef.current);
        audioObjectUrlRef.current = null;
      }

      if (!proxiedAudioUrl) {
        setWaveformLoading(false);
        wavesurferRef.current?.stop();
        regionsRef.current?.getRegions().forEach((region) => region.remove());
        return;
      }

      const abortController = new AbortController();
      audioLoadAbortRef.current = abortController;

      try {
        setEditorMessage((current) =>
          editorMessageKindRef.current === "ffmpeg-loading" ? current : null,
        );
        setWaveformLoading(true);
        wavesurferRef.current.stop();
        regionsRef.current?.getRegions().forEach((region) => region.remove());

        const response = await fetch(proxiedAudioUrl, {
          cache: "no-store",
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`Audio download failed with status ${response.status}`);
        }

        const audioBlob = await response.blob();
        const objectUrl = URL.createObjectURL(audioBlob);

        if (abortController.signal.aborted) {
          URL.revokeObjectURL(objectUrl);
          return;
        }

        audioObjectUrlRef.current = objectUrl;
        wavesurferRef.current.load(objectUrl);
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        console.error("Waveform source download error", error);
        setWaveformLoading(false);
        setEditorMessageKind("default");
        setEditorMessage(
          "We couldn't download that sound reliably. Check your network and try again.",
        );
      }
    };

    loadWaveform();

    return () => {
      audioLoadAbortRef.current?.abort();
      audioLoadAbortRef.current = null;
    };
  }, [proxiedAudioUrl]);

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const handleExport = useCallback(
    async (format: "ios" | "android") => {
      if (!wavesurferRef.current || !regionsRef.current || !ffmpegRef.current) {
        return;
      }

      const regions = regionsRef.current.getRegions();
      if (regions.length === 0) {
        setEditorMessageKind("default");
        setEditorMessage("Drag the highlighted region to choose the snippet.");
        return;
      }

      if (!ffmpegLoaded) {
        setEditorMessageKind("ffmpeg-loading");
        setEditorMessage("Audio converter is still loading. Give it a moment.");
        focusMessage();
        return;
      }

      setEditorMessageKind("default");
      setEditorMessage(null);
      setExportingFormat(format);

      const region = regions[0];
      const start = region.start;
      const end = region.end;
      const originalBuffer = wavesurferRef.current.getDecodedData();

      if (!originalBuffer) {
        setEditorMessageKind("default");
        setEditorMessage("Audio data is still preparing. Please wait a moment.");
        setExportingFormat(null);
        return;
      }

      const sampleRate = originalBuffer.sampleRate;
      const numChannels = originalBuffer.numberOfChannels;
      const startFrame = Math.floor(start * sampleRate);
      const endFrame = Math.floor(end * sampleRate);
      const frameCount = endFrame - startFrame;

      const interleaved = new Float32Array(frameCount * numChannels);
      for (let channel = 0; channel < numChannels; channel++) {
        const channelData = originalBuffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
          interleaved[i * numChannels + channel] = channelData[startFrame + i];
        }
      }

      const wavData = encodeWAV(interleaved, sampleRate, numChannels);
      const wavUint8 = new Uint8Array(
        wavData.buffer as ArrayBuffer,
        wavData.byteOffset,
        wavData.byteLength,
      );

      try {
        const ffmpeg = ffmpegRef.current;
        await ffmpeg.writeFile("input.wav", wavUint8);

        if (format === "ios") {
          await ffmpeg.exec([
            "-i",
            "input.wav",
            "-c:a",
            "aac",
            "-b:a",
            "128k",
            "-ar",
            "44100",
            "-ac",
            "2",
            "-f",
            "ipod",
            "output.m4r",
          ]);
        } else {
          await ffmpeg.exec([
            "-i",
            "input.wav",
            "-c:a",
            "libmp3lame",
            "-b:a",
            "192k",
            "-ar",
            "44100",
            "output.mp3",
          ]);
        }

        const outputFilename = format === "ios" ? "output.m4r" : "output.mp3";
        const outputData = (await ffmpeg.readFile(outputFilename)) as Uint8Array;
        const blob = new Blob([new Uint8Array(outputData)], {
          type: format === "ios" ? "audio/mp4" : "audio/mpeg",
        });
        const url = URL.createObjectURL(blob);

        const anchor = document.createElement("a");
        anchor.style.display = "none";
        anchor.href = url;
        anchor.download = `ringtone-${Date.now()}.${format === "ios" ? "m4r" : "mp3"}`;
        document.body.appendChild(anchor);
        anchor.click();

        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(anchor);
        }, 100);

        await ffmpeg.deleteFile("input.wav");
        await ffmpeg.deleteFile(outputFilename);
      } catch (error) {
        console.error("FFmpeg conversion error:", error);
        setEditorMessageKind("default");
        setEditorMessage("Export failed. Please try again.");
      } finally {
        setExportingFormat(null);
      }
    },
    [ffmpegLoaded, focusMessage],
  );

  return (
    <div className="tone-panel w-full px-5 py-5 sm:px-6 sm:py-6">
      <div className={fileLoaded ? "block" : "hidden"}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--tone-ink-soft)]">
              Now trimming
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--tone-ink)] sm:text-3xl">
              {trackTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--tone-ink-soft)]">
              Sound from <span className="font-semibold text-[var(--tone-ink)]">{fileName}</span>.
              Resize the highlighted band until the cut feels right.
            </p>
          </div>
          <div className="rounded-[1.4rem] border border-[rgba(255,107,74,0.22)] bg-[var(--tone-accent-soft)] px-4 py-3 text-sm font-semibold text-[var(--tone-ink)] shadow-[0_10px_24px_-20px_rgba(255,107,74,0.35)]">
            Max 30 seconds
          </div>
        </div>

        {editorMessage ? (
          <div
            ref={messageRef}
            tabIndex={-1}
            role="alert"
            aria-live="polite"
            className={`mt-4 overflow-hidden rounded-[1.4rem] border border-[var(--tone-error-border)] bg-[var(--tone-error-bg)] text-sm text-[var(--tone-error-text)] outline-none transition-shadow ${
              highlightMessage ? "tone-pulse-ring" : ""
            }`}
          >
            <div className="relative">
              {editorMessageKind === "ffmpeg-loading" ? (
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 bg-[color:color-mix(in_srgb,var(--tone-accent)_18%,transparent)] transition-[width] duration-300"
                  style={{ width: `${Math.round(ffmpegProgress * 100)}%` }}
                />
              ) : null}
              <div className="relative flex items-start gap-3 px-4 py-4">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p>{editorMessage}</p>
                  {editorMessageKind === "ffmpeg-loading" ? (
                    <div className="mt-3">
                      <div className="h-2 overflow-hidden rounded-full bg-white/75 ring-1 ring-[rgba(255,107,74,0.14)]">
                        <div
                          className="h-full rounded-full bg-[var(--tone-accent)] transition-[width] duration-300"
                          style={{ width: `${Math.round(ffmpegProgress * 100)}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:color-mix(in_srgb,var(--tone-error-text)_82%,white)]">
                        Converter loading {Math.round(ffmpegProgress * 100)}%
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-5 rounded-[1.8rem] border border-[var(--tone-border-strong)] bg-[var(--tone-surface)] p-4 shadow-[0_18px_36px_-30px_rgba(20,63,69,0.14)]">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tone-ink-soft)]">
            <Waves className="h-4 w-4" />
            Region selector
          </div>
          <div className="relative">
            <div
              ref={waveformRef}
              className="min-h-[8.5rem] w-full overflow-hidden rounded-[1.4rem] border border-[var(--tone-border-strong)] bg-[var(--tone-wave-bg)] px-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
            />
            {waveformLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[1.4rem] bg-[rgba(245,251,251,0.94)]">
                <LoaderCircle className="h-7 w-7 animate-spin text-[var(--tone-accent)]" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-[var(--tone-ink)]">
                    Preparing trim handles
                  </p>
                  <p className="mt-1 text-xs text-[var(--tone-ink-soft)]">
                    The waveform and draggable region will appear in a moment.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-3 rounded-[1.5rem] border border-[var(--tone-border)] bg-[var(--tone-surface)] px-4 py-4 text-sm text-[var(--tone-ink-soft)] shadow-[0_14px_28px_-26px_rgba(20,63,69,0.18)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(255,107,74,0.22)] bg-[var(--tone-accent-soft)] text-[var(--tone-accent)]">
            <Scissors className="h-4 w-4" />
          </div>
          Drag either edge of the highlighted region to choose the exact snippet.
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handlePlayPause}
            disabled={waveformLoading}
            aria-label={isPlaying ? "Pause audio preview" : "Play audio preview"}
            className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(255,255,255,0.3)] bg-[var(--tone-ink)] text-white shadow-[0_18px_32px_-18px_rgba(15,63,69,0.5)] transition hover:bg-[var(--tone-accent)] disabled:cursor-not-allowed disabled:border-transparent disabled:bg-[var(--tone-muted)]"
          >
            {isPlaying ? (
              <Pause fill="currentColor" className="h-5 w-5" />
            ) : (
              <Play fill="currentColor" className="ml-0.5 h-5 w-5" />
            )}
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => handleExport("ios")}
            disabled={waveformLoading || exportingFormat !== null}
            className="rounded-[1.8rem] border border-[var(--tone-border-strong)] bg-[var(--tone-surface)] p-5 text-left shadow-[0_16px_32px_-28px_rgba(20,63,69,0.16)] transition hover:border-[var(--tone-accent)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tone-ink-soft)]">
                iPhone
              </p>
              {exportingFormat === "ios" ? (
                <LoaderCircle className="h-5 w-5 animate-spin text-[var(--tone-accent)]" />
              ) : (
                <Download className="h-5 w-5 text-[var(--tone-accent)]" />
              )}
            </div>
            <p className="mt-4 text-3xl font-black tracking-[-0.04em] text-[var(--tone-ink)]">
              .m4r
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--tone-ink-soft)]">
              Export a ringtone file for the iPhone import workflow.
            </p>
          </button>

          <button
            onClick={() => handleExport("android")}
            disabled={waveformLoading || exportingFormat !== null}
            className="rounded-[1.8rem] border border-[rgba(255,255,255,0.3)] bg-[var(--tone-accent)] p-5 text-left text-white shadow-[0_20px_36px_-24px_rgba(255,107,74,0.48)] transition hover:bg-[var(--tone-accent-deep)] disabled:cursor-not-allowed disabled:border-transparent disabled:opacity-60"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
                Android
              </p>
              {exportingFormat === "android" ? (
                <LoaderCircle className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Download className="h-5 w-5 text-white" />
              )}
            </div>
            <p className="mt-4 text-3xl font-black tracking-[-0.04em]">.mp3</p>
            <p className="mt-2 text-sm leading-6 text-white/80">
              Export a clean MP3 for Android ringtone settings.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Editor;
