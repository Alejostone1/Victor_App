"use client";

import type { Exercise } from "@/lib/content/schema";
import type { AnswerInput } from "@/stores/lessonStore";
import { Dialogue } from "./Dialogue";
import { FillBlank } from "./FillBlank";
import { Flashcard } from "./Flashcard";
import { ListenChoose } from "./ListenChoose";
import { ListenType } from "./ListenType";
import { MatchPairs } from "./MatchPairs";
import { PictureChoose } from "./PictureChoose";
import { SpeakRepeat } from "./SpeakRepeat";
import { TapChoose } from "./TapChoose";
import { Translate } from "./Translate";
import { WordOrder } from "./WordOrder";

type Props = {
  exercise: Exercise;
  seed: string;
  retry: boolean;
  locked: boolean;
  onAnswer: (input: AnswerInput) => void;
};

/** Elige el componente según el `type` del ejercicio. */
export function ExerciseRenderer({ exercise, ...rest }: Props) {
  switch (exercise.type) {
    case "flashcard":
      return <Flashcard exercise={exercise} {...rest} />;
    case "listen_choose":
      return <ListenChoose exercise={exercise} {...rest} />;
    case "listen_type":
      return <ListenType exercise={exercise} {...rest} />;
    case "speak_repeat":
      return <SpeakRepeat exercise={exercise} {...rest} />;
    case "word_order":
      return <WordOrder exercise={exercise} {...rest} />;
    case "fill_blank":
      return <FillBlank exercise={exercise} {...rest} />;
    case "translate":
      return <Translate exercise={exercise} {...rest} />;
    case "match_pairs":
      return <MatchPairs exercise={exercise} {...rest} />;
    case "dialogue":
      return <Dialogue exercise={exercise} {...rest} />;
    case "tap_choose":
      return <TapChoose exercise={exercise} {...rest} />;
    case "picture_choose":
      return <PictureChoose exercise={exercise} {...rest} />;
    default: {
      const unreachable: never = exercise;
      return unreachable;
    }
  }
}
