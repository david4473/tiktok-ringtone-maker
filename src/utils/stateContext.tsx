"use client";

import type { TikTokPost } from "@/lib/types";
import React, { createContext, useCallback, useMemo, useState } from "react";

interface StateContextProps {
  data: TikTokPost | null;
  handleSetData: (value: TikTokPost | null) => void;
  submitted: boolean;
  handleSubmitted: (value: boolean) => void;
  message: string | null;
  handleMessage: (value: string | null) => void;
}

const StateContext = createContext<StateContextProps | null>(null);

const StateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<TikTokPost | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSetData = useCallback((value: TikTokPost | null) => {
    setData(value);
  }, []);

  const handleSubmitted = useCallback((value: boolean) => {
    setSubmitted(value);
  }, []);

  const handleMessage = useCallback((value: string | null) => {
    setMessage(value);
  }, []);

  const contextValue = useMemo(
    () => ({
      data,
      handleSetData,
      submitted,
      handleSubmitted,
      message,
      handleMessage,
    }),
    [data, handleSetData, submitted, handleSubmitted, message, handleMessage],
  );

  return (
    <StateContext.Provider value={contextValue}>
      {children}
    </StateContext.Provider>
  );
};

export { StateContext, StateProvider };
