"use client";

import {
  CodeButtonTitle,
  CodeGenerateType,
  generateCssVariables,
} from "@/lib/generateVariables";
import { Button } from "@ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ui/components/dialog";
import { useEffect, useState } from "react";
import { useColorStore } from "@/store/store";
import { ScrollArea } from "@ui/components/scroll-area";
import { Copy, CopyCheck } from "lucide-react";
import { useToast } from "@ui/components/ui/use-toast";

const copyDescription = (title: CodeButtonTitle) => {
  switch (title) {
    case CodeButtonTitle.RAW:
      return "Copy and paste this code in your CSS file";
    case CodeButtonTitle.TAILWINDCSS:
      return "Copy and paste this code in your tailwind.config.js file";
    case CodeButtonTitle.SHADCN:
      return "Copy and paste this code in your global.css file";
    case CodeButtonTitle.REACT_NATIVE_PAPER:
      return "Copy and paste this code in your theme.js file";
    case CodeButtonTitle.WEBFLOW:
      return "Copy and paste this code in your Webflow project";
    case CodeButtonTitle.FIGMA:
      return "Copy and paste this url in Figma plugin, the link is valid for 7 days";
    default:
      return "Copy and paste this code in your CSS file";
  }
};
function CodeGenerateButton({
  title,
  type,
  available,
}: {
  title: CodeButtonTitle;
  type: CodeGenerateType;
  available: boolean;
}) {
  const [isCopied, setIsCopied] = useState(false);
  const { colorPalettes, baseColors } = useColorStore();
  const { toast } = useToast();
  const [code, setCode] = useState<string>("");
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "You can now paste it in your CSS file",
      variant: "default",
    });
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const generate = async () => {
    const c = await generateCssVariables({ title, colorPalettes, baseColors });
    setCode(c);
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        {available ? (
          <Button
            variant="outline"
            size="sm"
            className="relative z-10 backdrop-blur-sm"
            onClick={generate}
          >
            Generate
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="relative z-10 text-foreground/50 !opacity-100 backdrop-blur-sm"
            disabled
          >
            Coming Soon
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="block max-h-[min(60rem,calc(100dvh-2rem))] overflow-y-auto overflow-x-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{type}</DialogTitle>
          <DialogDescription>{copyDescription(title)}</DialogDescription>
        </DialogHeader>
        <div className="relative mb-4 py-4">
          <Button
            size="icon"
            className="absolute right-3 top-7 z-20"
            onClick={handleCopy}
            disabled={isCopied}
            variant="outline"
          >
            {isCopied ? (
              <CopyCheck className="h-5 w-5" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </Button>
          <pre className="max-h-[min(60rem,calc(100dvh-20rem))] max-w-full overflow-auto rounded-lg border bg-zinc-950 dark:bg-zinc-900">
            <code
              className="relative min-h-[4rem] rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm"
              style={{
                display: "grid",
                minWidth: "100%",
                overflowWrap: "break-word",
                borderRadius: 0,
                borderWidth: 0,
                backgroundColor: "transparent",
                padding: 0,
                counterReset: "line",
                WebkitBoxDecorationBreak: "clone",
                boxDecorationBreak: "clone",
              }}
            >
              {/* make it a span */}
              {code.split("\n").map((line, index) => (
                <span
                  className="inline-block min-h-[1rem] w-full px-4 py-[0.125rem] text-background dark:text-foreground"
                  key={index}
                >
                  {line}
                </span>
              ))}
            </code>
          </pre>
        </div>
        <p className="text-xs text-muted-foreground">
          Generated by Fluid Colors
        </p>
        <DialogFooter>
          <Button
            type="button"
            className="w-28"
            disabled={isCopied}
            onClick={handleCopy}
          >
            {isCopied ? "Copied!" : "Copy Code"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CodeGenerateButton;
