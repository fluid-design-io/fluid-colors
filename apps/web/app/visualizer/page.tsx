import ColorPickerFab from "@/components/core/color-picker-fab";
import PaletteVisualizer from "@/components/palette/palette-visualizer";
import React from "react";

export default function VisualizerPage() {
  return (
    <div className="site-padding mx-auto mt-6 flex w-full max-w-[120rem] flex-1 flex-col pb-20 sm:pb-24 md:mt-8 lg:mt-10">
      <PaletteVisualizer />
      <ColorPickerFab />
    </div>
  );
}