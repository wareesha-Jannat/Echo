"use client";
import { Button } from "@/components/ui/button";
import kyInstance from "@/lib/ky";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";
import React from "react";
import { useQod } from "./QodContext";

const QuestionOfDay = () => {
  const { qod, setQod } = useQod();

  const { data, isPending } = useQuery({
    queryKey: ["question-of-the-day"],
    queryFn: () =>
      kyInstance.get("/api/question-of-the-day").json<{ question: string }>(),
  });

  return (
    <div className="bg-card flex flex-col items-center justify-center gap-2 rounded-2xl p-4 shadow-sm">
      <div className="flex w-full flex-col items-center justify-between gap-3 min-[450px]:flex-row sm:gap-0">
        <div className="text-primary flex items-center gap-2 font-semibold">
          <Sparkles className="size-4" />
          <span> Question of the day</span>
        </div>
        <Button
          type="button"
          className="bg-primary text-white"
          onClick={() => setQod(!qod)}
        >
          {qod ? "All posts" : "Answered posts"}
        </Button>
      </div>
      {isPending ? (
        <Loader2 className="animate-spin" />
      ) : (
        <p className="text-lg leading-snug font-medium">{data?.question}</p>
      )}
    </div>
  );
};

export default QuestionOfDay;
