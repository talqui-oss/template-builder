import type { Platform, Template } from "@talqui-oss/template-builder";
import { TemplatePreview } from "@talqui-oss/template-builder-react";
import type { Ref } from "react";

type Props = {
  template: Template;
  platform: Platform;
  /** The node exported as an image: chat wallpaper plus the message. */
  screenRef: Ref<HTMLDivElement>;
};

/** A slice of the chat screen, 440pt wide like the iPhone the preview was measured on. */
export function PhoneView({ template, platform, screenRef }: Props) {
  return (
    <div className="pg-phone">
      <div className="pg-phone__screen" ref={screenRef}>
        <TemplatePreview
          template={template}
          platform={platform}
          time={currentTime()}
        />
      </div>
    </div>
  );
}

const currentTime = () =>
  new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
