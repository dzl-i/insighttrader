"use client";

// @ts-ignore
import ReactWordcloud, { Word } from "react-wordcloud";

export default function WordCloud({ words }: { words: Word[] }) {
  return (
    <div className="h-full w-full grow overflow-hidden">
      <ReactWordcloud
        options={{
          colors: ["#53DD6C", "#3F8CFF", "#E94F37", "#FFC107"],
          padding: 2,
          rotations: 0,
          rotationAngles: [0, 90],
          scale: "sqrt",
          spiral: "rectangular",
        }}
        words={words}
      />
    </div>
  );
}
