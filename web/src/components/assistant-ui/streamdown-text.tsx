"use client";

import { StreamdownTextPrimitive } from "@assistant-ui/react-streamdown";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import { type FC } from "react";

const isSameOriginLink = (url: string) => {
  if (typeof window === "undefined") return false;

  try {
    return new URL(url, window.location.origin).origin === window.location.origin;
  } catch {
    return false;
  }
};

export const StreamdownText: FC = () => {
  return (
    <StreamdownTextPrimitive
      mode="streaming"
      plugins={{ code, math, mermaid, cjk }}
      shikiTheme={["github-light", "github-dark"]}
      defer
      animated
      caret="block"
      controls={{
        code: true,
        table: true,
        mermaid: {
          copy: true,
          download: true,
          fullscreen: true,
          panZoom: true,
        },
      }}
      remend={{
        links: true,
        images: true,
        linkMode: "protocol",
        bold: true,
        italic: true,
        boldItalic: true,
        inlineCode: true,
        strikethrough: true,
        katex: true,
        setextHeadings: true,
        handlers: [],
      }}
      linkSafety={{
        enabled: true,
        onLinkCheck: isSameOriginLink,
      }}
      security={{
        allowedLinkPrefixes: ["*"],
        allowedImagePrefixes: ["*"],
        allowedProtocols: ["http", "https", "mailto"],
        allowDataImages: false,
        blockedLinkClass: "pointer-events-none opacity-60",
        blockedImageClass: "hidden",
      }}
      containerClassName="aui-md"
    />
  );
};
